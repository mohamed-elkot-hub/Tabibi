# Authentication Flow

## Goal

Let patients create and access an account using a verified email Magic Link, without requiring a password for the patient flow.

## Patient Registration and Sign-in

1. The patient enters their name and email when starting registration or booking.
2. The system validates the input and creates or updates a short-lived pending registration. It does not create an active patient account yet.
3. The system sends a single-use Magic Link to the submitted email address.
4. The patient opens the link. The system validates that it is genuine, unused, and unexpired.
5. On successful verification, the system creates the patient account if one does not already exist, marks the email as verified, consumes the link, and starts the patient session.
6. The patient continues to the booking they started, if applicable; otherwise they reach their account.

## Existing Patient

When an email already belongs to an account, send a sign-in link instead of creating a duplicate account. Successful verification starts a session for that account.

## Invalid or Expired Link

Reject an invalid, expired, or already-used link without creating an account or session. Offer the patient a way to request a new link. Requesting a new link must not make an older link usable again.

## Session and Sign-out

After verification, maintain the signed-in state using the project’s session-based authentication. Signing out invalidates the current session. Protected patient information and booking actions require an authenticated session.

## Doctor Authentication

Doctors register with an email and password. Until email verification succeeds, the pending doctor account is held temporarily in Redis with a **3-day TTL** and is not yet persisted as a verified account in MongoDB. The system sends an account-verification link to the submitted email address.

When the doctor opens a valid, unused, unexpired verification link, the system persists the verified account to MongoDB, consumes the link, and removes the temporary pending-account record from Redis. The doctor then enters the **Verified - Pending admin review** state. After registration, doctors can sign in using either their email/password or a single-use email Magic Link. Successful sign-in starts the project session.

Account verification and professional verification are separate gates. Email verification confirms control of the account; admin approval of the submitted professional profile is described in [doctor.md](./doctor.md). A doctor whose account is verified but whose profile is awaiting admin review must not appear as bookable.

Implementation status: doctor account registration accepts a name, email, and password at `POST /auth/doctor/register`; email verification is completed at `POST /auth/doctor/verify-email`. Unverified doctor account data is held in Redis for three days and persisted as a verified doctor only after a valid single-use email verification token. The configured `DOCTOR_EMAIL_VERIFICATION_URL` must point to the client page that reads the token query parameter and posts it to the verification endpoint. Doctor professional application fields and credential uploads are not part of this registration endpoint yet. Shared password sign-in for eligible roles is `POST /auth/login`; verified super-admins and verified, approved doctors use the same DTO and response shape. Doctor magic-link request and consume endpoints remain `POST /auth/doctor/magic-link/request` and `POST /auth/doctor/magic-link/consume`. Authenticated users can read and update their own basic profile with `GET /auth/me` and `PATCH /auth/me`; they can change their password with `PATCH /auth/me/password` after providing the current password. Password changes revoke all sessions. Password hashes use `@nestjs/authentication`'s scrypt `PasswordHasher`. Mongo session records live in the `sessions` collection and have a seven-day absolute lifetime and one-day idle timeout. Magic links are single-use and email enumeration-safe.

Doctor registration stores the password hash and account details in Redis under a generated account identifier with a three-day TTL. The Nest authentication package stores email verification tokens hashed in MongoDB and atomically consumes them. Successful verification loads the pending Redis record, creates a verified doctor in MongoDB with `pending_admin_review` status, and deletes the Redis record. Registration responses do not reveal whether an email already has an account. Do not replace the Redis pending-account storage with MongoDB or another store.

Until admin approval, appointment and availability management remain disabled. Pending account status UI and requests for more information are not implemented in this backend slice.

## Email Delivery

Use the official NestJS `@nestjs/mail` package for application email. In production, the configured transport uses Google's Gmail SMTP service (`smtp.gmail.com`); use port 587 with STARTTLS or port 465 with implicit TLS. The current configuration authenticates with `SMTP_USER` and `SMTP_PASSWORD` (for Gmail, use an App Password where required). In development, `LogMailTransport` logs message content, including sign-in and verification URLs, so use it only with local logs that are not shipped or shared. Auth emails use `Mailable` classes in `src/common/mail` and templates in `src/common/mail/templates`; the Nest build copies those templates into `dist/common/mail/templates`. Configure the transport and sender through environment-backed settings. Keep SMTP credentials out of source control and logs.

The package is `@nestjs/mail` (NestJS documentation section: Application / Mail), not `@nestjs/email`. Do not add a separate mailer or SMTP library.

## Security Requirements

- Magic Links are single-use and expire after a limited period.
- Store only a non-reversible representation of the link secret where the storage design permits it.
- Do not expose whether an email is registered in public responses.
- Apply request limits to link requests and verification attempts.
- Do not put patient information in the link itself.
- The `super_admin` role is unique in MongoDB. Do not add a path that deletes the super-admin account or changes its role.
- Self-service profile updates only accept a name. Password changes require the current password and revoke all user sessions.
- Services express persistence queries with the shared `AbstractRepository` API; concrete repositories do not define model-specific query methods.
- Doctor passwords must be stored using a secure one-way password hashing method; never store plaintext passwords.
- Doctor sign-in links must be single-use and expire after a limited period.
- DTOs are transformed and validated globally with `class-transformer`, `class-validator`, and Nest's `ValidationPipe` (`whitelist` and `forbidNonWhitelisted`).
- Registration and verification rate limiting is not implemented yet.

## Redis Integration

The selected NestJS integration is `@nestjs/cache-manager` with `cache-manager`, backed by the Redis Keyv adapter `@keyv/redis`. NestJS's caching documentation shows creating a Redis store with `createKeyv()` from `@keyv/redis` and registering it with `CacheModule`. The global cache TTL and pending unverified-account records use **259,200,000 milliseconds (3 days)**.

The Redis microservice transporter documented by NestJS is for Redis Pub/Sub messaging, so it is not the right abstraction for retrieving and expiring pending-account records.

The Redis store package is maintained outside the NestJS ecosystem. Installation of `cache-manager` and `@keyv/redis` was approved. Built-in Node APIs do not implement Redis storage; writing a Redis client directly would bypass the dependency policy and duplicate a client library. Redis configuration is registered globally by `AppConfigModule` using `REDIS_URL`; startup currently requires the Redis endpoint to be configured and available.

Sources:

- [NestJS data caching: TTL and alternative cache stores](https://docs.nestjs.com/data/caching#using-alternative-cache-stores)
- [NestJS Redis microservice transporter](https://docs.nestjs.com/microservices/redis)

## Open Decisions

- Confirm the allowed patient identity fields and email normalization rules.
- Define email delivery failure and retry behavior for verification and magic-link messages.
- Choose the Google SMTP authentication method (OAuth2 XOAUTH2 or an App Password) and configure the sender identity.
- Define cleanup behavior when verification expires or fails; the pending-account TTL is 3 days.
- Set `DOCTOR_EMAIL_VERIFICATION_URL` to the deployed client page that posts the token to the API verification endpoint.
- Decide whether patient pending registrations should use the same temporary-storage pattern; their storage choice is not yet specified.
- Confirm link lifetime, resend limits, and session lifetime.
- Define account recovery if a patient loses access to their email.
- Confirm whether a doctor can change their verified email and whether that requires re-verification.
- Password reset/forgot-password routes are not implemented yet; when added, they are shared auth capabilities rather than role-specific endpoints.
- Confirm the doctor experience and allowed actions while admin review is pending.

## Learned Rules

- Doctors register with email and password, verify the account by email, and can later sign in with either email/password or a Magic Link.
- Email/account verification and admin verification of professional credentials are separate steps; account verification alone does not make a doctor bookable.
- Keep an unverified doctor account in Redis temporarily; after successful email verification, persist it to MongoDB and remove the temporary Redis record.
- Expire pending doctor-account records from Redis after 3 days if the account is not verified.
- Send verification and magic-link email through `@nestjs/mail` using Google's SMTP service; SMTP secrets are environment/secret-manager configuration, never committed.
- Sessions, magic links, and email tokens are persisted in MongoDB through a Mongoose adapter and validated collection schemas; sessions are stored in the shared `sessions` collection.
- Auth flows are organized in separate subfolders under `src/modules/auth`; shared auth configuration, session storage, and mail infrastructure belongs to the auth root/shared folders.
- Super-admin seeding is explicit via `npm run seed:super-admin`; MongoDB's partial unique index permits at most one account, and seeding never overwrites existing credentials.

## Out of Scope for This Flow

- Password-based patient authentication.
- Social login and multi-factor authentication.
