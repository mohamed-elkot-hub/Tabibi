# Doctor Flow

## Doctor Registration and Two Verification Layers

1. The doctor registers with an email and password and submits identity and professional details, including specialty, clinic/address, fee, appointment duration, and required credentials.
2. The system sends an account-verification email link. Until the doctor verifies the email, the account is **Unverified** and the application is not sent for admin review.
3. After email verification, the account becomes **Verified - Pending admin review**. This is account verification only; the doctor is not yet approved to practice on the platform.
4. Admin checks the professional profile and credentials, then approves or rejects the application. Rejection includes a reason and next steps.
5. If approved, the doctor becomes **Approved** and can complete their public profile and configure appointment availability.
6. The doctor appears to patients and becomes bookable only when the account is email-verified, admin-approved, and active.

Doctors can later sign in with either email/password or an email Magic Link. See [auth.md](./auth.md) for sign-in behavior.

## Implemented Backend Slice

- Doctor registration is available through `POST /auth/doctor/register`; account details remain in Redis with a three-day TTL until the email verification flow at `POST /auth/doctor/verify-email` succeeds.
- Registration currently accepts account identity and password only; professional application fields and credential uploads remain to be defined and implemented.
- Doctor password sign-in and single-use magic-link sign-in require a verified doctor record.
- Verified, pending-review doctors remain non-bookable.
- `GET /admin/doctors/pending` lists verified applications awaiting review.
- `PATCH /admin/doctors/:doctorId/approve` atomically transitions only a verified pending doctor to approved; only a signed-in super-admin may call it.
- The super-admin account is created by the explicit `npm run seed:super-admin` command using `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_NAME`, and `SUPER_ADMIN_PASSWORD`. Seeding is idempotent and does not change existing credentials.
- Doctor registration and email verification are implemented using the Redis pending-account cache and the Nest authentication package's hashed, single-use email verification tokens; see [auth.md](./auth.md).

## Verification States

| State | Meaning | Patient visibility / booking |
|---|---|---|
| Unverified | Email ownership has not been confirmed | Hidden; cannot be booked |
| Verified - Pending admin review | Account is verified; professional credentials await admin review | Hidden; cannot be booked |
| Rejected | Admin declined the application | Hidden; cannot be booked |
| Approved | Admin accepted the professional application | May become visible after the doctor activates a complete profile and availability |
| Suspended | Admin disabled the doctor account | Hidden; cannot accept new bookings |

## Availability Setup

1. The doctor configures dates, working hours, appointment duration, and availability for online and in-clinic visits.
2. For in-clinic visits, the doctor provides the location shown to patients.
3. For online visits, the doctor marks the relevant availability as online. The meeting mechanism is an open decision in [booking.md](./booking.md).
4. The doctor updates or closes future availability. Existing confirmed appointments must remain visible and must not be silently removed when availability changes.

## Doctor Dashboard

- View and manage the public profile and approval status.
- View upcoming, completed, and cancelled appointments.
- See each appointment’s patient-provided visit reason where access is authorized.
- Cancel an appointment with a required cancellation reason; the patient is notified and offered alternatives according to [booking.md](./booking.md).
- Contact admin about a technical or account issue.

## Assistant Access

Assistant access is listed as optional in the project research. Do not provide assistant accounts in the first flow until permissions, visibility, and account ownership are defined.

## Open Decisions

- Which credentials are mandatory, how they are reviewed, and what appears publicly.
- Whether a doctor may offer both appointment types and whether those types have separate schedules or fees.
- Whether doctors can set capacity greater than one for a time slot.
- Whether doctors can edit an appointment after confirmation, and what changes require patient consent.
- Whether the first release includes a doctor dashboard beyond profile and appointment management.

## Learned Rules

- A doctor profile is not bookable until it has been approved by admin and made active.
- Doctors can offer online appointments, in-clinic appointments, or both; their configured availability determines what patients can select.
- Doctor onboarding has two verification layers: account/email verification first, then admin verification of the professional profile and credentials.
- Doctors support email/password and Magic Link sign-in after registration.
