# Booking Flow

## Goal

Let a patient book an available appointment with an approved doctor, either online or at the clinic.

## Patient Journey

1. The patient searches or browses public doctor profiles.
2. The patient opens a doctor profile and selects **Online** or **In clinic**.
3. The system shows slots available for that doctor and appointment type. Clinic bookings show the clinic location. Online bookings identify the appointment as online.
4. The patient selects a slot and provides their name, email, and reason for the visit.
5. The patient verifies ownership of the email through the Magic Link flow in [auth.md](./auth.md).
6. The system checks that the selected slot is still available and suitable for the patient and doctor. If it is, the system confirms the appointment immediately and gives it a booking reference.
7. The patient sees a confirmation with the doctor, appointment type, date and time, location or online details, and booking reference. The system sends appointment details by email.
8. The patient can view the appointment from their account and request cancellation. Ownership must be verified before appointment details or cancellation controls are available.

## Slot Conflict

Availability must be checked again when the patient submits the booking, because another patient may have taken the slot while this patient was verifying their email. Only one request may claim the same remaining capacity. If the slot is no longer available, do not confirm the appointment; show that it is unavailable and return the patient to the available slots.

The doctor defines appointment availability and capacity. The project research mentions a possible limit on how many patients can book at once, but does not define whether that means a shared queue or concurrent bookings. Capacity rules remain an open decision; do not assume that every slot has capacity for multiple patients.

## Doctor Cancellation

If a doctor cancels an appointment, the doctor supplies a cancellation reason. The system notifies the patient and suggests alternative available appointments. **Proposed behavior:** the patient chooses whether to accept an alternative; the system does not silently move the booking to another time. Confirm this policy before implementation.

## Patient Cancellation

The patient requests cancellation from an authenticated account, and the system records the cancellation. The cancellation deadline, whether a doctor must be notified or approve it, and any rescheduling behavior remain open decisions.

## Learned Rules

- Confirm a booking immediately when the selected slot is available and suitable for both the patient and the doctor.
- Support both online and in-clinic appointment types.

## Open Decisions

- What is the slot capacity model: one patient per slot, or a doctor-configured queue/capacity?
- Is a slot held while email verification is pending? If so, for how long, and what happens when the hold expires?
- Which online meeting method is used, and when is its joining information sent?
- What are the patient cancellation deadline and rescheduling rules?
- Should booking details be sent only by email, or also in-app?

## Out of Scope for This Flow

- Payment collection, refunds, commissions, doctor subscriptions, and paid profile promotion.
- Pharmacy orders, lab tests, home care, public community, and telehealth session delivery beyond recording an online appointment.
- Chat and file sharing.
