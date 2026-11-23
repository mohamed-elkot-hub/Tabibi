# Repository Technical Context

## Architecture

- Backend framework: NestJS with TypeScript.
- Persistence: MongoDB through Mongoose and `@nestjs/mongoose`.
- Authentication uses the shared Nest authentication module with sessions stored in MongoDB through Mongoose.
- Observability is initialized through `createObserveModule()` in `src/app.module.ts`; it uses the `@nestjs/observe` integration.
- Application code is organized under `src/modules`, `src/common`, and `src/config`.
- NestJS configuration belongs in `AppConfigModule`, not directly in `AppModule`. Import `AppConfigModule` into `app.config.ts`; keep configuration setup out of `AppModule`.
- Authentication code is grouped under `src/modules/auth/`. Give each authentication method or flow (such as login, registration, or magic link) its own subfolder and NestJS module under `auth/`; keep shared auth infrastructure at the `auth/` root only when it is genuinely shared.
- The current data models include users and doctors; doctors use the shared user model/discriminator pattern.
- Product requirements and learned product decisions belong in `docs/`, not in this file.

## Dependencies

### Dependency Policy

- **NestJS-first:** Always prefer official NestJS packages maintained by the NestJS team (`@nestjs/*`) for application functionality, architecture, integrations, and infrastructure.
- **No unauthorized third-party dependencies:** Never install, add, replace, or introduce any package outside the official NestJS ecosystem without explicit user approval.
- **Approval required:** If a task requires a non-NestJS dependency, stop before installing or modifying anything and ask the user for approval.
- **Explain before requesting approval:** Clearly provide:
  - The package name and its purpose.
  - Why existing NestJS packages or built-in Node.js APIs are insufficient.
  - Whether the dependency is required or optional.
  - Any viable alternative that avoids adding a third-party package.
- **No automatic installation:** Never assume approval based on the package's popularity, existing usage in other projects, or a previous approval for a different dependency.
- **Existing dependencies:** Runtime dependencies are declared in `package.json`, with `package-lock.json` as the npm lockfile. Existing third-party dependencies may continue to be used where already integrated, but do not add new ones or replace them without approval.
- **Current stack:** The project uses NestJS 12, Mongoose 9, `@nestjs/authentication`, `@nestjs/authorization`, `@nestjs/mail`, class-validator, class-transformer, and NestJS Observe for observability.
- **Development tools:** TypeScript 6, Vitest 4, Oxlint, Prettier, and the Nest CLI are already available.
- **Redis cache:** The project includes `@nestjs/cache-manager`, `cache-manager`, and `@keyv/redis` for Redis-backed cache storage. Configure cache infrastructure through Nest's cache module and AppConfigModule. Keep product-specific Redis flows documented in `docs/`.
- **Dependency changes:** After receiving approval, use npm to manage dependencies and keep `package.json` and `package-lock.json` synchronized.
- **No workarounds:** Never bypass this policy by copying third-party library code into the project, downloading packages manually, or using an alternative package manager.

### Mandatory Approval Rule

**Before introducing any new non-NestJS package, ask for explicit approval and wait for the user's response. Do not proceed with the installation until approval is granted.**

## Technical Sources

- NestJS documentation: https://docs.nestjs.com/
- Mongoose documentation: https://mongoosejs.com/docs/
- MongoDB manual: https://www.mongodb.com/docs/manual/
- NestJS caching documentation: https://docs.nestjs.com/techniques/caching
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Vitest documentation: https://vitest.dev/guide/
- Class-validator documentation: https://github.com/typestack/class-validator
- Class-transformer documentation: https://github.com/typestack/class-transformer
