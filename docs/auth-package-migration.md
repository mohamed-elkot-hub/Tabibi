# Spec: NestJS Authentication and Authorization Migration

## Objective

Replace Tabibi's manually implemented session guard, role guard, and request/role decorators with the official NestJS authentication and authorization packages. Use the official NestJS mail package for transactional email through Google's SMTP service. Preserve the approved product flows and MongoDB-backed session behavior.

## Current State

- `src/main.ts` configures `express-session` with `connect-mongo` and a seven-day session lifetime.
- `SessionGuard`, `RolesGuard`, `IsPublic`, `Roles`, and `CurrentUser` are hand-written under `src/common`.
- User identity is loaded through `UserService` from MongoDB.
- The working tree already contains unrelated edits, including changes to `package.json`, `package-lock.json`, `src/main.ts`, `src/app.module.ts`, and `AGENTS.md`; migration work must preserve them.

## Proposed Scope

- Keep all NestJS configuration for authentication, authorization, and mail in `AppConfigModule`; import `AppConfigModule` into `app.config.ts`. Do not put configuration setup in `AppModule`.
- Organize auth implementation under `src/modules/auth/`, with a separate subfolder and NestJS module for each auth method/flow (such as login, registration, and magic link); only genuinely shared auth infrastructure belongs directly under `auth/`.
- Add `@nestjs/authentication` and `@nestjs/authorization` at versions compatible with the project's NestJS 12 dependencies.
- Add `@nestjs/mail` for email delivery; configure Google's Gmail SMTP endpoint from environment variables, without adding a separate mail transport package.
- Replace custom guard/decorator responsibilities with package-provided authentication context and authorization policies.
- Keep `express-session` and `connect-mongo` only if the authentication package supports integrating the current session store without duplicating session middleware.
- Update module/bootstrap wiring and affected controllers/services to use package APIs.
- Remove obsolete manual guards/decorators only after all references have migrated.
- Preserve existing route access behavior and user roles; do not add new sign-in endpoints or change product authentication flows in this migration.

## Acceptance Criteria

- The official packages install cleanly and are compatible with NestJS 12 and the existing TypeScript setup.
- Every currently protected route still requires an authenticated session; explicitly public routes remain public.
- Role/policy-protected routes continue to distinguish unauthenticated users from authenticated users lacking permission.
- The current user resolved from the session remains the MongoDB user and does not expose credential secrets.
- No old custom guard/decorator remains in use; deleted files have no remaining imports.
- The seven-day Mongo-backed session behavior is retained, or any required change is approved and recorded before implementation.
- Build and relevant authentication/authorization tests pass after implementation.

## Dependencies

- Required: `@nestjs/authentication`, `@nestjs/authorization`, and `@nestjs/mail` (official NestJS packages; user approved).
- Remove `express-session`, `connect-mongo`, and `@types/express-session` if the migration replaces their use with the authentication package's session API and a Mongoose-backed session store.
- Do not add another email or SMTP package. Third-party dependencies remain subject to the repository approval rule.

## Out of Scope

- Implementing or changing patient/doctor sign-in, registration, email verification, magic-link, password, or admin-review flows.
- Adding Redis or changing pending-account storage.
- Implementing authentication email flows or sending real messages as part of this migration; configure the mail transport only.
- Changing session duration, cookie policy, or user roles.

## Open Decisions / Verification Gates

- Verify the packages' published peer dependency ranges and NestJS 12 compatibility before installation.
- Use a custom Mongoose adapter for the authentication package's documented session-store contract; do not retain `express-session` or `connect-mongo` as parallel session systems.
- Google SMTP uses `smtp.gmail.com` with STARTTLS on port 587 or implicit TLS on 465. Authentication credentials must be configured as secrets; choose App Password or OAuth2 credentials according to the Google account's supported configuration.
- For package documentation, NestJS calls its email package `@nestjs/mail` (the application guide is `/application/mail`), not `@nestjs/email`.
- Inspect the existing working-tree diffs before editing overlapping files and preserve unrelated edits.

## Technical Sources

- [NestJS authentication](https://docs.nestjs.com/security/authentication)
- [NestJS authorization](https://docs.nestjs.com/security/authorization)
- [NestJS caching and alternative stores](https://docs.nestjs.com/data/caching)
