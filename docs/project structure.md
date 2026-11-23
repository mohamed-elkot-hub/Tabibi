# Project Structure

This document describes the repository as it exists today. Product flow documents describe proposed behavior; they do not imply that those features are implemented yet.

```text
Tabibi/
├── .agents/                  # Repository-local agent skills and workflows
├── docs/                     # Product flows and project documentation
│   ├── admin.md              # Admin workflow
│   ├── auth.md               # Authentication workflow
│   ├── booking.md            # Booking workflow and its learned rules
│   ├── doctor.md             # Doctor workflow
│   ├── index.md              # Product flow index
│   └── project structure.md  # This document
├── src/
│   ├── common/               # Shared models, guards, decorators, types, interfaces, enums, constants
│   │   └── models/
│   │       ├── doctor/       # Doctor schema, repository, exports
│   │       └── user/         # User schema, model, repository, exports
│   ├── config/               # Application configuration
│   ├── modules/              # NestJS feature and infrastructure modules
│   │   └── user/             # User controller, service, module
│   ├── app.controller.ts     # Root HTTP controller
│   ├── app.module.ts         # Root NestJS module and module imports
│   ├── app.service.ts        # Root application service
│   └── main.ts               # Application bootstrap
├── test/                     # End-to-end tests
├── .env.example              # Environment variable template
├── package.json              # Scripts and dependency declarations
├── package-lock.json         # npm dependency lockfile
├── nest-cli.json             # Nest CLI configuration
├── tsconfig*.json            # TypeScript build configuration
├── vitest.config.ts          # Unit test configuration
└── vitest.config.e2e.ts      # End-to-end test configuration
```

## Source Areas

- **`src/modules/`** contains NestJS modules that group controllers, services, and module wiring. Authentication, admin review, and user features are implemented; MongoDB infrastructure is in `mongodb.module.ts`.
- **`src/modules/auth/`** is the parent authentication feature. Each auth method or flow (for example login, registration, or magic link) gets a separate subfolder with its own NestJS module; shared auth infrastructure lives at the parent level only when it is shared across methods.
- **`src/common/`** contains code shared across feature modules: Mongoose models and repositories, guards, decorators, role definitions, types, interfaces, and constants.
- **`src/config/`** contains application configuration. Environment-specific values belong in local environment files; never put secret values in documentation or source control.
- **`src/main.ts` and `src/app.module.ts`** bootstrap the application and compose its root modules.
- **`test/`** currently contains the end-to-end test entry point. Unit tests use Vitest configuration at the repository root.
- **`docs/`** contains product flow documents and project documentation. Keep learned product rules in the matching flow document rather than in a standalone learned-rules file.
- **`.agents/`** contains repository-local skills that guide agent work.

## NestJS Configuration Architecture

- `AppConfigModule` is the single place for NestJS configuration setup and registration. Keep configuration wiring out of `AppModule`.
- Import `AppConfigModule` into `app.config.ts`.
- `AppModule` must not define NestJS configuration; keep it focused on application module composition.
- Keep environment-specific secret values in environment or secret-manager configuration; never commit them.
- This architecture is implemented in `src/config/app.config.ts` and imported by `AppModule`.

## Current Feature Coverage

The source contains shared user and doctor models, Mongo-backed sessions and authentication token stores, doctor registration and email verification, password and magic-link sign-in, super-admin seeding, doctor review endpoints, MongoDB wiring, and Redis-backed cache configuration. Patient registration, booking, doctor professional profile and credential submission, availability, and dashboards remain product planning.

## Common Commands

| Purpose | Command |
|---|---|
| Development server | `npm run start:dev` |
| Production build | `npm run build` |
| Unit tests | `npm test` |
| End-to-end tests | `npm run test:e2e` |
| Lint | `npm run lint` |
