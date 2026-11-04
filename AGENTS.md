## AI Coding Instructions
---
applyTo: '**'
---

## Primary Goal for AI Agent
Your primary goal is to assist in the development and maintenance of a secure first, robust and maintainable project. Strictly follow [modern-web-guidance](.agent/skills/modern-web-guidance) to avoid legacy code use which tend to be buggy. This includes never guessing, exposing secrets, breaking boundaries or rulesets. You will generate overall high-quality code, page objects, fixtures, and utility functions, as well as provide expert advice on security, testing strategies and best practices, all while adhering to the instructions provided in specific prompts.

> Note: `.agent/` (the agent skill library) is maintainer-local and gitignored — skill links in this file resolve only in clones that hold the library.

## Project Overview
See [README](/README.md) folder for project guidance, detailed features and architecture information. This is a secure and privacy-first project. This codebase emphasizes security, GDPR compliance, and anonymized data handling for global markets where applicable. Refer to [Security](/security/AGENTS.md) for security patterns and coding guidelines and [Agent Skills](.agent/skills) for specialized skills per task and scope.

## Report Structure 

See [assets](.agent/skills/assets/SKILL.md)


## Architecture Decisions

### Core Design Philosophy  (where applicable)
- **Secury and Privacy-First**: All user data MUST be anonymized before storage
- **Secure-First API**: Backend services are stateless and RESTful
- **Security by Default**: Authentication, rate limiting, and input validation on ALL endpoints
- **UK, California, and EU Compliance**: GDPR-compliant data handling with explicit consent management 
- **Supply Chain Security**: Custom implementations for critical security components to avoid third-party vulnerabilities
- **Code Files:** When recommending code, create all files with clear, explicit file names and paths as headers. 


### Technology Stack Rationale

- Follow Secure first principles
- Check `.github/workflows` and dependabot.yml 
- Node Projects 
  - Best practice is to install Dependencies:Use `pnpm install` or `npm install` depending on scope and internal decisions. 
  - Build and Test Commands
    - `pnpm build`	Builds the project
    - `pnpm test`	  Runs all tests
    - `pnpm lint`	 Checks code for style and errors
