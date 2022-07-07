# Coffee-Supply-Chain

This is a DApp coffee supply chain solution to prove the authenticity of coffee using an Ethereum smart contract. This project demonstrates
solid blockchain architecture with role based permissions in a supply chain flow between sellers and buyers at various stages- see code in /contracts folder. 


![activity](https://user-images.githubusercontent.com/67720949/177696085-bd69f935-1e28-47dc-b303-fb24c4ec6c09.png)

![sequence](https://user-images.githubusercontent.com/67720949/177696098-76705450-a16f-44a9-a458-dfdeeaaf3a8f.png)

![State](https://user-images.githubusercontent.com/67720949/177696111-ede6a48c-6aae-405c-8936-4c8688234372.png)

![class](https://user-images.githubusercontent.com/67720949/177696125-549e1752-9c44-4b07-9aa6-8da52b936b60.png)

![Fairtradecoffee](https://user-images.githubusercontent.com/67720949/177696131-9d540509-cd40-455c-b50a-7560db0f0cfb.png)


Program Versions:

Truffle v5.1.51 (core: 5.1.51)
Solidity - 0.5.16 (solc-js)
Node v16.15.1
Web3.js v1.2.9



Libraries 

Below are the dependencies in my packages.json file:

"dependencies": {
    "@truffle/hdwallet-provider": "^2.0.10",
    "truffle-assertions": "^0.9.2",
    "web3": "^0.20.7"
  }


Why I used each library:

    
truffle: truffle is development environment, testing framework and asset pipeline for blockchains using the Ethereum Virtual Machine (EVM), aiming to make life as a developer easier. 
For example, I used truffle to deploy my smart contracts to the Rinkeby test network.
truffle-assertions: used to test Ethereum smart contracts inside Truffle tests. I used assertion to test if contracts correctly emitted different events as expected.
truffle-hdwallet-provider: HD Wallet-enabled Web3 provider. Use it to sign transactions for addresses derived from a 12-word mnemonic.
It allowed me to connect with my Metamask wallet on the Rinkeby network to authentic my contracts to Rinkeby.
web3: a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket. It allows you to interact with the blockchain using the JavaScript API.

IPFS Write-up

I did not use IPFS for this project.

The Rinkeby contract address for this project is: 0x018C2daBef4904ECbd7118350A0c54DbeaE3549A

