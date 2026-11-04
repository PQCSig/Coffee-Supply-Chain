## Security Patterns
---
applyTo: '**'
---


## Foundational Instructions for LLMs 

- As a security-focused software engineer, consistently generate secure code that inherently prevents top security weaknesses.
- Ensure code design and implementation is inherently safe and secure rather than merely renaming methods with "secure_" prefixes.
- Use inline comments to clearly highlight critical security controls, implemented measures, and any security assumptions made in the code.
- Adhere strictly to "CRITICAL INSTRUCTIONS" and best practices from OWASP, with particular consideration for the OWASP Top ten 2025 web application security risks and OWASP Top 10 2025 LLM security risks.
- **Avoid Slopsquatting**: Be careful when referencing or importing packages. Do not guess if a package exists. Comment on any low reputation or uncommon packages you have included.

## CRITICAL INSTRUCTIONS:

- FOCUS ON IMPACT: Prioritize vulnerabilities that could lead to unauthorized access, data breaches, or system compromise.
- Input Validation Vulnerabilities:

- SQL injection via unsanitized user input
- Command injection in system calls or subprocesses
- XXE injection in XML parsing
- Template injection in templating engines
- NoSQL injection in database queries
- Path traversal in file operations
- Authentication & Authorization Issues:

- Authentication bypass logic
- Privilege escalation paths
- Session management flaws
- JWT token vulnerabilities
- Authorization logic bypasses
- Crypto & Secrets Management:

- Hardcoded API keys, passwords, or tokens
- Weak cryptographic algorithms or implementations
- Improper key storage or management
- Cryptographic randomness issues
- Certificate validation bypasses
- Injection & Code Execution:

- Remote code execution via deseralization
- Pickle injection in Python
- YAML deserialization vulnerabilities
- Eval injection in dynamic code execution
- XSS vulnerabilities in web applications (reflected, stored, DOM-based)

Data Exposure:

- Sensitive data logging or storage
- PII handling violations
- API endpoint data leakage
- Debug information exposure
- Additional notes:

**Even if something is only exploitable from the local network, it can still be a HIGH severity issue**


<OWASP_Top_10_2025_Web_Application_Security_Risks> 

- A01:2021-Broken Access Control moves up from the fifth position; 94% of applications were tested for some form of broken access control. The 34 Common Weakness Enumerations (CWEs) mapped to Broken Access Control had more occurrences in applications than any other category.

- A02:2021-Cryptographic Failures shifts up one position to #2, previously known as Sensitive Data Exposure, which was broad symptom rather than a root cause. The renewed focus here is on failures related to cryptography which often leads to sensitive data exposure or system compromise.

- A03:2021-Injection slides down to the third position. 94% of the applications were tested for some form of injection, and the 33 CWEs mapped into this category have the second most occurrences in applications. Cross-site Scripting is now part of this category in this edition.

- A04:2021-Insecure Design is a new category for 2021, with a focus on risks related to design flaws. If we genuinely want to “move left” as an industry, it calls for more use of threat modeling, secure design patterns and principles, and reference architectures.

- A05:2021-Security Misconfiguration moves up from #6 in the previous edition; 90% of applications were tested for some form of misconfiguration. With more shifts into highly configurable software, it’s not surprising to see this category move up. The former category for XML External Entities (XXE) is now part of this category.

- A06:2021-Vulnerable and Outdated Components was previously titled Using Components with Known Vulnerabilities and is #2 in the Top 10 community survey, but also had enough data to make the Top 10 via data analysis. This category moves up from #9 in 2017 and is a known issue that we struggle to test and assess risk. It is the only category not to have any Common Vulnerability and Exposures (CVEs) mapped to the included CWEs, so a default exploit and impact weights of 5.0 are factored into their scores.

- A07:2021-Identification and Authentication Failures was previously Broken Authentication and is sliding down from the second position, and now includes CWEs that are more related to identification failures. This category is still an integral part of the Top 10, but the increased availability of standardized frameworks seems to be helping.

- A08:2021-Software and Data Integrity Failures is a new category for 2021, focusing on making assumptions related to software updates, critical data, and CI/CD pipelines without verifying integrity. One of the highest weighted impacts from Common Vulnerability and Exposures/Common Vulnerability Scoring System (CVE/CVSS) data mapped to the 10 CWEs in this category. Insecure Deserialization from 2017 is now a part of this larger category.

- A09:2021-Security Logging and Monitoring Failures was previously Insufficient Logging & Monitoring and is added from the industry survey (#3), moving up from #10 previously. This category is expanded to include more types of failures, is challenging to test for, and isn’t well represented in the CVE/CVSS data. However, failures in this category can directly impact visibility, incident alerting, and forensics.

- A10:2021-Server-Side Request Forgery is added from the Top 10 community survey (#1). The data shows a relatively low incidence rate with above average testing coverage, along with above-average ratings for Exploit and Impact potential. This category represents the scenario where the security community members are telling us this is important, even though it’s not illustrated in the data at this time.

</OWASP_Top_10_2025_Web_Application_Security_Risks> 


<OWASP_Top_10_2025_LLM_security_risks> 


- LLM01: Prompt Injection – Attackers manipulate an LLM’s behavior by injecting malicious instructions into user inputs, either directly or indirectly through external sources like documents or websites.This remains the top risk due to its high impact and ease of exploitation.

- LLM02: Sensitive Information Disclosure – The model unintentionally reveals sensitive data such as personally identifiable information (PII), financial details, health records, or proprietary business information during normal operation.

- LLM03: Supply Chain Vulnerabilities – Risks arising from compromised components in the LLM development and deployment pipeline, including third-party models, datasets, or plugins.

- LLM04: Data and Model Poisoning – Malicious data is introduced during pre-training, fine-tuning, or embedding processes, leading to biased, toxic, or degraded model performance.
The 2025 version expands this category to include manipulation beyond just training data.

- LLM05: Improper Output Handling – LLM outputs are used without proper validation or sanitization, potentially leading to downstream security issues such as code injection or command execution.

- LLM06: Excessive Agency – LLMs are granted excessive autonomy or permissions to interact with external systems (e.g., APIs, tools), enabling them to perform harmful actions based on manipulated outputs.This goes beyond improper output handling by allowing the model to act independently.

- LLM07: System Prompt Leakage – The model inadvertently reveals its internal system prompts or instructions, which can be exploited to understand or manipulate its behavior.

- LLM08: Vector and Embedding Weaknesses – Vulnerabilities in the vector databases or embedding models used in retrieval-augmented generation (RAG) systems, such as embedding inversion or adversarial retrieval.

- LLM09: Misinformation – The model generates false or misleading content, either innocently (hallucination) or as a result of adversarial manipulation, which can have serious consequences in critical applications.

- LLM10: Unbounded Consumption – LLMs or associated systems consume excessive computational resources (e.g., tokens, API calls, processing time) due to uncontrolled inputs or recursive behaviors, leading to denial-of-service or financial loss.

</OWASP_Top_10_2025_LLM_security_risks>



<OWASP_Top_10_2026_Agentic_security_risks>

- ASI01: Agent Goal Hijack – Attackers manipulate an AI agent to change its goals or objectives, causing it to perform unintended or harmful actions. This can be achieved through prompt injection, data poisoning, or exploiting vulnerabilities in the agent's decision-making processes.

- AS102: Tool Misuse & Exploitation – AI agents often utilize external tools or APIs to accomplish tasks. Attackers may exploit vulnerabilities in these tools or manipulate the agent's use of them to achieve malicious outcomes.

- ASI03: Identity & Privilege Abuse – Compromising the identity or privileges of an AI agent can allow attackers to escalate access within systems, leading to unauthorized actions or data breaches.

- AS104: Agentic Supply Chain Vulnerabilities – Similar to LLMs, AI agents may rely on third-party components, models, or services. Vulnerabilities in these dependencies can be exploited to compromise the agent's behavior or security.

- ASI05: Unexpected Code Execution (RCE) – AI agents that generate or execute code may inadvertently introduce vulnerabilities that allow for remote code execution, leading to system compromise.

- ASI06: Memory & Context Poisoning – Manipulating the memory or context that an AI agent relies on can lead to altered decision-making or behavior, potentially causing harmful actions.

- ASI07: Insecure Inter-Agent Communication – AI agents that communicate with each other may do so over insecure channels, allowing attackers to intercept or manipulate messages, leading to compromised behavior.

- ASI08: Cascading Failures – Failures in one AI agent can propagate to others in a networked environment, leading to widespread disruption or unintended actions.

- ASI09: Human Agent Trust Exploitation – Attackers may exploit the trust relationship between human operators and AI agents, manipulating humans into making decisions that lead to security breaches.

- ASI10: Rogue Agents – AI agents that operate outside of intended parameters or controls can become rogue, performing unauthorized actions that compromise security.



</OWASP_Top_10_2026_Agentic_security_risks>



### Github Actions Security 


[Owasp GitHub Actions Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html)


This cheat sheet provides guidance on securing GitHub Actions workflows, primarily for public GitHub repositories. The main goal is to prevent attacker-controlled code execution, which may lead to the following outcomes.

- **Secrets exfiltration.** CI/CD pipelines often use long-lived credentials to access external services (e.g., cloud provider credentials or package registry tokens). Such secrets can be exfiltrated (printing to logs, sending to external endpoints or embedding them in artifacts) via remote code execution.
- **Compromise of GITHUB_TOKEN with write permissions.** GitHub automatically provides each workflow run with a short-lived GITHUB_TOKEN that is scoped to the repository and has specific permissions. If this token is granted with write permissions and an attacker is able to exfiltrate or misuse the token, they could potentially modify repository contents, create or alter releases or interact with other GitHub resources.
- **GitHub Actions cache poisoning.** Workflows may reuse cached data across different workflow runs. If an attacker can inject malicious content into the cache and subsequent workflows (such as release pipelines) restore and use this cache, the poisoned data can be executed in a privileged context and potentially compromise the integrity of published release artifacts, obtain code execution in the privileged workflow and steal the production secrets.
- **Denial-of-wallet attacks.** CI/CD pipelines often integrate with paid external services, such as LLMs, for code review. If an attacker can repeatedly trigger pipelines or manipulate inputs to maximize resource consumption, this can lead to uncontrolled spending and financial impact.

Treat your [CI/CD pipeline](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html) as a critical production code

Because a CI/CD pipeline usually has access to sensitive credentials and functions/endpoints, it must be treated as a critical asset, potentially even more critical than the source code it processes. Therefore, secure software development best practices must be applied, including (but not limited to): threat modeling, secure code reviews, security validation and penetration testing.

For deeper guidance and recommended practices, see:

`NIST "Strategies for the Integration of Software Supply Chain Security in DevSecOps CI/CD Pipeline";`
`OWASP CI/CD Security Cheat Sheet;`
`OWASP Secure Pipeline Verification Standard.`
`Assume failure and have an incident response plan in place`

Assume breaches will happen and design for rapid response. Define clear incident response procedures with roles, communication and escalation paths. Continuously improve by actively learning from other incidents through publicly available post-mortems (e.g., Trivy post-mortem, Cline post-mortem).

Enable static analysis for GitHub Actions workflows¶

[!IMPORTANT] CodeQL is freely available for open-source repositories on GitHub. Verify that CodeQL is enabled for your repositories and configured to scan GitHub Actions workflow files. CodeQL can be enabled via GitHub UI or by including a workflow file under `.github/workflows` folder:

If enabling via workflow, ensure that language: actions is included in the workflow.
If enabling via Settings → Advanced Security → Code scanning → CodeQL analysis, ensure that GitHub Actions appears under the Languages section.
If available, enable CodeQL actions scanning in your repositories to detect vulnerabilities in GitHub Actions workflows. In addition, use Zizmor for defense in depth. Periodically upgrade these tools, as new releases may contain updated detection rules.
Configure these tools to run on every relevant pull request and mark them as required status checks before merging. At a minimum, block merges when high or critical severity issues are detected.
Run comprehensive workflow scans on a scheduled basis (e.g., daily) and ensure that findings are tracked and remediated over time.
If you need to enable scanning across several repositories, try to utilize a centralized reusable workflow or shared actions to standardize security practices (see this Grafana example).
Harden repository settings¶

[!IMPORTANT] Please note that the Require approval for first-time contributors setting presents a security risk because an attacker can submit an initially legitimate-looking pull request (e.g., a typo fix) to gain trust and later submit subsequent PRs that introduce malicious changes which are executed in CI without requiring further approval.

**Enable the setting Require approval for all external contributors in the repository settings.**
This ensures that workflows triggered by pull requests from forks (i.e., users who are not members of the repository or organization) do not run automatically and therefore prevents untrusted code execution.
Restrict default GITHUB_TOKEN permissions to Read repository contents and packages permissions in the repository settings. Explicitly grant additional permissions in the workflow file if required.
Enforce strong branch protection rules. Configure branch protection to require pull request reviews, status checks, signed commits and CODEOWNERS approval before merging into protected branches. Tools such as the OpenSSF Scorecard can help audit these settings.
Require workflows to pass before merging via repository rulesets to enforce organizational or enterprise-level requirements — such as checking for required labels or validating commit messages — before code is merged.
Restrict egress traffic from GitHub-hosted runners¶


## Runners 

Use solutions (e.g., Harden-Runner) to monitor and restrict egress traffic from GitHub-hosted runners to prevent secret exfiltration.

Use self-hosted runners with extra caution

- Self-hosted runners usually have access to internal networks and may cache credentials, secrets or store internal data. Because they execute arbitrary code by design, they can be used by an attacker to establish persistent remote access and exfiltrate secrets. In general, never use self-hosted runners with public repositories, as anyone who can fork the repository and open a pull request can potentially execute code on your runner.

If you use self-hosted runners for a public repository:

- Use standard secure software development best practices when enabling self-hosted runners (threat modeling, secure code reviews, security validation, penetration testing, patching and hardening).
- Use the Require approval for all external contributors option, review proposed changes and manually approve each workflow execution for all external contributors.
- Use ephemeral runners (e.g., container-based runners) and destroy the runner environment after each job execution to prevent persistence.
- Do not store sensitive data on runner machines, as any user who can invoke workflows has access to the runner environment.
- Restrict runner network access and avoid giving self-hosted runners access to sensitive infrastructure.
- Segregate runners using runner groups and labels

- Use runner groups and labels to separate high-privilege runners from low-privilege runners. High-privilege runners may have access to sensitive resources, while low-privilege runners should not.

This separation gives more granular control over which repositories can access a runner group and which workflows can target specific runners, reducing the risk that a compromised or misconfigured workflow gains access to sensitive resources.

For example, consider creating:

A runner group for container image build runners, limited to only the repositories that require those privileges.
A runner group for runners with access to restricted networks.
A separate runner group for low-privilege tasks such as linting and static analysis, used by repositories where secrets are absent or isolated in separate environments.
Maintain curated shared workflows and actions¶

If you need to support several repositories, establish a centralized repository of curated, security-reviewed workflows/actions and reuse it across other repositories.

For a practical example, see grafana/shared-workflows.

**Prevent artifact poisoning**

- Artifact poisoning occurs when malicious or untrusted content is introduced into build artifacts, often via shared caches or previously stored dependencies (GitHub Actions Cache Poisoning). This can compromise the integrity of released software or lead to production secret exfiltration. To reduce this risk, disable all forms of caching in release or publishing workflows to avoid reusing potentially compromised artifacts or exfiltrating production secrets.

**Be careful with AI assistant running in CI/CD pipeline**

- Sometimes, an AI assistant is used directly in workflows, e.g., to review pull requests or triage submitted issues. This creates a risk of prompt injection attacks, where malicious input manipulates the AI assistant's behavior. If the workflow running the AI assistant has access to secrets or a GITHUB_TOKEN with write permissions and can be triggered by untrusted users (e.g., any GitHub account), this may lead to secret exfiltration or unauthorized actions. A real-world example is the "clinejection" attack.

- To mitigate potential attacks, limit AI assistant capabilities — only enable the minimum tools and actions required for task execution.

**Write Secure GitHub Workflows**

This section contains some recommendations. In general, a static code analyzer (CodeQL, Zizmor) should report such issues.

- Avoid dangerous triggers

- Avoid using the pull_request_target trigger

- Workflows triggered by pull_request_target run in the context of the base (target) repository and have access to the GITHUB_TOKEN with write permissions and GitHub secrets available to the workflow. If untrusted code from a PR is checked out and used, this may lead to code execution. There are some common patterns, like labeling workflows where untrusted code is not checked out, but in general, try to avoid the pull_request_target trigger.

[!IMPORTANT] Never check out (via actions/checkout or GitHub CLI) and run untrusted code in this context.

- Avoid using the workflow_run trigger

- The workflow_run trigger automates tasks based on the execution of other workflows and can grant access to the GITHUB_TOKEN with write permissions and GitHub secrets. An attacker can modify triggering workflows via pull requests and cause privileged workflows to run. Even if the initial workflow is unprivileged, the triggered one may execute with higher permissions, enabling privilege escalation. Additionally, attackers can exploit artifact poisoning by injecting malicious files that downstream workflows use without verification, leading to potential code execution. If you need to implement workflow chains, use workflow_call with reusable workflows instead.

- Use issue_comment trigger with extra care

- This trigger can automate workflows (e.g., end-to-end tests) in response to comments on issues or pull requests and can grant access to the GITHUB_TOKEN with write permissions and GitHub secrets. Implementation may introduce a Time-of-Check to Time-of-Use (TOCTOU) issue, where an attacker can modify a pull request between comment approval and workflow execution to run malicious code. Additionally, this trigger can bypass pull request approval mechanisms, allowing attackers to execute workflows without proper review.

- To secure the implementation with the issue_comment trigger:

- Check if the triggering actor meets authorization criteria, e.g., allow workflow execution only if it was triggered by a trusted member of the specific GitHub org.
- Use the commit SHA in a comment that triggers the workflow: instead of using a /ok-to-test comment, design the workflow to accept /ok-to-test(<trusted_sha_commit>) and check out code only from <trusted_sha_commit> submitted by an authorized actor. This will help mitigate the checkout and execution of untrusted code.
- Alternatively, consider replacing the issue_comment trigger with label-based triggers. When using the pull_request trigger with the labeled event, github.event.pull_request.head.sha contains the latest commit SHA for the pull request. Users with triage access can apply labels. Verify that the actor applying a workflow-triggering label is authorized for that operation; permission to label does not establish that the commit has been reviewed. Applying a label does not elevate workflow permissions. For pull requests from forks of public repositories, pull_request workflows still receive a read-only GITHUB_TOKEN and no other secrets, as described in GitHub's fork workflow restrictions. After reviewing the proposed code, check out the exact commit SHA available via github.event.pull_request.head.sha, which reflects the state of the pull request at the time the label was applied. Do not treat the label as approval for later commits.

[!IMPORTANT] In general, never check out code using mutable references (e.g., pull request numbers or branch names) - always use immutable references such as a full commit SHA.

- Use third-party GitHub Actions and reusable workflows securely

- Use third-party actions with caution

- In general, try to minimize third-party actions usage, e.g., use the GitHub API in your workflows when possible to implement required logic.

- While using third-party actions, verify the origin, check that the author is trusted and active, ensure that there are multiple active contributors. Check that the code is stable and safe to use, and that the action does not require unnecessary permissions.

- Always pin all action and reusable workflow versions with a commit hash and check for impostor commits

- Check that the used commit belongs to the specified organization/repository. This will prevent dependency confusion attacks, as currently GitHub resolves the commit SHA, finds a matching object and executes it regardless of which fork it originated from. This check can be automated with the Zizmor impostor-commit rule.

- Use automated dependency update tools

- Use tools such as Dependabot or Renovate to keep third-party GitHub Actions up to date.
- Configure a delay between a dependency release and its adoption (e.g., a few days). This helps avoid immediately pulling in newly published malicious or compromised versions, allowing time for the community to detect and report issues. To configure this, Dependabot has a cooldown flag, Renovate has a minimumReleaseAge flag.
Minimize GITHUB_TOKEN permissions¶

- Always set permissions: {} at the workflow level to disable all permissions by default. Then, grant only the specific permissions needed at the job level.

- Require approval for deployments or publications to critical environments

- Use GitHub environments with required approval rules. Define a list of authorized accounts who must manually approve deployments to production or other critical environments before workflow execution.

- Sanitize user input

- An attacker may submit a malicious payload via context (e.g., via PR title) that could cause remote execution. To prevent injection, always use intermediate environment variables to pass any context into run: and similar code execution blocks. Although some input contexts may appear relatively safe, it is better to always follow this approach for consistency and security.

- Protect secrets used in workflows (e.g., use OIDC `https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-with-reusable-workflows`)

- Try to eliminate all static credentials from your workflows

- Try to eliminate all static credentials (e.g., personal access tokens, static cloud keys) used in workflows. Migrate to OIDC-based short-lived authentication tokens [Trusted publishing](https://docs.github.com/en/actions/concepts/security/openid-connect). Currently, many major registries and cloud providers support this feature. For cloud deployment trust restrictions and credential handling, see the Workload Identity Federation Cheat Sheet.

- Secure handling of static credentials (if elimination is unavoidable)¶

If complete elimination cannot be achieved:

- Never hardcode secrets in workflow files.
- Pass secrets at the step level, not the job level.
- Prefer environment-level secrets that are only accessible when a job targets a specific environment.
- Rotate secrets regularly.
- Eliminate secrets: inherit while reusing workflows

When invoking a reusable workflow, secrets: inherit passes all secrets available to the calling workflow, including secrets the called workflow may not need. Explicitly pass only the required secrets. Also review any environment selected by a job inside the reusable workflow: GitHub documents that the environment's secrets are used there and can override secrets passed by the caller. An explicit caller secret map does not remove that separate source of access.

**Mask sensitive data**

- Mask all sensitive information that is not a GitHub secret by using ::add-mask::{value}. Masking a value prevents a string or variable from being printed in the log

- Use secret scanning tools 

- Implement secret scanning in both pre-commit and pull request stages to prevent accidental exposure of sensitive data in the repository:

- Run secret scanning locally (e.g., via pre-commit hooks) to catch issues before code is committed.
- Enforce scanning in pull requests to detect and block any leaked secrets before merging.
- Automatically fail checks when potential secrets are detected to ensure remediation before proceeding.
actions/checkout should be used with persist-credentials: false

- Unless needed for git operations, actions/checkout should be used with persist-credentials: false. This prevents Git credentials from being persisted to the workflow's environment, reducing the risk of credential exposure if the workflow is compromised.

References:

GitHub Actions: Secure Use Reference
GitHub Actions: OpenID Connect
