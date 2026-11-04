// Tests for SupplyChain.sol — covers the full harvest → purchase lifecycle,
// role-gated access, and regression tests for the fixed security findings:
// payment routing to the farmer (FT-2), price enforcement (FT-1), and
// harvest access control / UPC overwrite protection (FT-3).
var SupplyChain = artifacts.require('SupplyChain')
var truffleAssert = require('truffle-assertions')

contract('SupplyChain', function(accounts) {
    // Contract owner (deploys, therefore holds every role via the role constructors)
    const ownerID = accounts[0]
    const farmerID = accounts[1]
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const attackerID = accounts[5] // holds no role

    const sku = 1
    const upc = 1
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarra Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', 'ether')
    const overpayment = web3.utils.toWei('3', 'ether')
    const BN = web3.utils.BN

    before(async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.addFarmer(farmerID, { from: ownerID })
        await supplyChain.addDistributor(distributorID, { from: ownerID })
        await supplyChain.addRetailer(retailerID, { from: ownerID })
        await supplyChain.addConsumer(consumerID, { from: ownerID })
    })

    // 1st Test
    it("harvestItem() allows a farmer to harvest coffee and emits Harvested()", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.harvestItem(
            upc, farmerID, originFarmName, originFarmInformation,
            originFarmLatitude, originFarmLongitude, productNotes,
            { from: farmerID }
        )

        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], farmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Harvested', ev => ev.upc.toString() === upc.toString())
    })

    // FT-3 regression: only farmers may harvest
    it("harvestItem() reverts when called by an account without the farmer role", async() => {
        const supplyChain = await SupplyChain.deployed()

        await truffleAssert.reverts(
            supplyChain.harvestItem(
                2, attackerID, originFarmName, originFarmInformation,
                originFarmLatitude, originFarmLongitude, productNotes,
                { from: attackerID }
            )
        )
    })

    // FT-3 regression: a farmer cannot attribute an item to another farmer
    it("harvestItem() reverts when attributing an item to a different farmer address", async() => {
        const supplyChain = await SupplyChain.deployed()

        await truffleAssert.reverts(
            supplyChain.harvestItem(
                2, farmerID, originFarmName, originFarmInformation,
                originFarmLatitude, originFarmLongitude, productNotes,
                { from: ownerID }
            ),
            "Items must be attributed to the calling farmer"
        )
    })

    // FT-3 regression: an existing UPC cannot be re-harvested (state reset / hijack)
    it("harvestItem() reverts when the UPC already exists", async() => {
        const supplyChain = await SupplyChain.deployed()

        await truffleAssert.reverts(
            supplyChain.harvestItem(
                upc, farmerID, originFarmName, originFarmInformation,
                originFarmLatitude, originFarmLongitude, productNotes,
                { from: farmerID }
            ),
            "UPC already exists"
        )
    })

    // 2nd Test
    it("processItem() allows the originating farmer to mark coffee Processed", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.processItem(upc, { from: farmerID })
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Processed')
    })

    // 3rd Test
    it("packItem() allows the originating farmer to mark coffee Packed", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.packItem(upc, { from: farmerID })
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Packed')
    })

    // 4th Test
    it("sellItem() allows the originating farmer to mark coffee ForSale at a price", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.sellItem(upc, productPrice, { from: farmerID })
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[4].toString(), productPrice.toString(), 'Error: Invalid product price')
        truffleAssert.eventEmitted(result, 'ForSale')
    })

    // 5th Test — FT-1/FT-2 regression: the distributor pays at least the price,
    // the farmer receives the exact price, the overpayment is refunded to the buyer
    it("buyItem() marks coffee Sold, pays the farmer the exact price and refunds overpayment", async() => {
        const supplyChain = await SupplyChain.deployed()

        const farmerBalanceBefore = new BN(await web3.eth.getBalance(farmerID))
        const buyerBalanceBefore = new BN(await web3.eth.getBalance(distributorID))

        const result = await supplyChain.buyItem(upc, { from: distributorID, value: overpayment })

        const farmerBalanceAfter = new BN(await web3.eth.getBalance(farmerID))
        const buyerBalanceAfter = new BN(await web3.eth.getBalance(distributorID))
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // FT-2 regression: proceeds go to the farmer, not back to the buyer
        assert(farmerBalanceAfter.sub(farmerBalanceBefore).eq(new BN(productPrice)),
            'Error: Farmer did not receive the exact sale price')
        // FT-1 regression: buyer pays the sale price (plus gas), not merely the UPC value
        assert(buyerBalanceBefore.sub(buyerBalanceAfter).gt(new BN(productPrice)),
            'Error: Buyer was charged less than the sale price')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Sold')
    })

    it("buyItem() reverts when the payment is below the sale price", async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.harvestItem(
            3, farmerID, originFarmName, originFarmInformation,
            originFarmLatitude, originFarmLongitude, productNotes,
            { from: farmerID }
        )
        await supplyChain.processItem(3, { from: farmerID })
        await supplyChain.packItem(3, { from: farmerID })
        await supplyChain.sellItem(3, productPrice, { from: farmerID })

        // FT-1 regression: underpaying (even above the UPC number) must revert
        await truffleAssert.reverts(
            supplyChain.buyItem(3, { from: distributorID, value: web3.utils.toWei('0.5', 'ether') })
        )
    })

    // 6th Test
    it("shipItem() allows the distributor to mark coffee Shipped", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.shipItem(upc, { from: distributorID })
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Shipped')
    })

    // 7th Test
    it("receiveItem() allows a retailer to mark coffee Received", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.receiveItem(upc, { from: retailerID })
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Received')
    })

    // 8th Test
    it("purchaseItem() allows a consumer to mark coffee Purchased", async() => {
        const supplyChain = await SupplyChain.deployed()

        const result = await supplyChain.purchaseItem(upc, { from: consumerID })
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        truffleAssert.eventEmitted(result, 'Purchased')
    })

    // 9th Test
    it("fetchItemBufferOne() allows anyone to fetch item details", async() => {
        const supplyChain = await SupplyChain.deployed()

        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)

        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
    })

    // 10th Test
    it("fetchItemBufferTwo() allows anyone to fetch product details", async() => {
        const supplyChain = await SupplyChain.deployed()

        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID')
    })
});
