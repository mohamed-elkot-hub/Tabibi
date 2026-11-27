# Admin Flow

## Doctor Application Review

1. Admin opens the queue of doctor applications whose accounts have completed email verification. Unverified registrations are not ready for professional review.
2. Admin reviews the doctor's identity, specialty, clinic information, and submitted credentials.
3. Admin approves or rejects the application and records the decision. Rejections include a reason for the doctor.
4. Approved doctors may activate a public profile and manage availability. Rejected or pending profiles remain unavailable for patient booking. Approval does not replace account/email verification; both gates must be satisfied.

## Account and Issue Management

- Admin can inspect doctor profile details needed for verification and support.
- Admin can review reports and suspend an account when a policy violation is confirmed.
- Admin can receive and resolve technical support tickets submitted by patients or doctors.
- Admin can review doctor cancellation reasons and support patients affected by cancellations.

## Admin Dashboard

The initial operational dashboard may show counts of patients, doctors, pending applications, and appointments. Revenue reporting is excluded while payment scope is deferred.

## Super-Admin Account

- The system permits at most one `super_admin` account. MongoDB enforces this with a unique partial index on the shared `users` collection; startup reports an actionable error if legacy duplicate records prevent index creation.
- Create the account explicitly with `npm run seed:super-admin`. The seed does not create another account if a super-admin already exists. If the configured email differs from the existing account, it fails without changing credentials. Concurrent seed runs are resolved by the database unique index.
- The super-admin signs in through `POST /auth/login` and may read or update their own basic profile and change their own password through `GET/PATCH /auth/me` and `PATCH /auth/me/password`.
- No user deletion endpoint is exposed. Preserve this invariant for any future delete path: a super-admin cannot delete itself or be deleted through the dashboard/API. Self-service does not permit role changes.

## Open Decisions

- Define doctor review criteria and required evidence.
- Define suspension reasons, notice, appeal, and reinstatement behavior.
- Define admin roles and which actions require an audit trail.
- Define support ticket statuses, response expectations, and resolution notifications.
- Define whether admin may edit appointment data or only assist/cancel with a recorded reason.

## Learned Rules

- Admin approval is required before a doctor can be listed as bookable.
- Admin professional verification happens only after the doctor has completed account/email verification.
- Suspending a doctor prevents new bookings; handling already confirmed appointments must be decided and communicated to affected patients.
