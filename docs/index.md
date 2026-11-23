# Tabibi Product Flows

These documents describe the proposed first-release journeys. Decisions confirmed by the product owner are recorded under each flow’s **Learned Rules** section. Unresolved behavior stays under **Open Decisions** until confirmed.

## Core Flows

- [Authentication](./auth.md): patient Magic Link registration/sign-in and session behavior.
- [Doctor](./doctor.md): doctor application, admin review, profile, and availability.
- [Booking](./booking.md): patient search-to-confirmed appointment, cancellation, and conflicts.
- [Admin](./admin.md): doctor review, account actions, and support.

## Main Journey and Dependencies

```text
Patient authentication ─────────────────────────────┐
                                                     v
Doctor registration → Admin approval → Doctor profile and availability
                                      │              │
                                      └──────────────┴→ Patient discovery and booking
                                                         │
                                                         └→ Appointment management and notifications
```

The sequence above is a product-flow dependency map, not a technical module design. Appointment booking relies on an approved active doctor and current availability. Patient-owned booking actions rely on verified identity.

## First-Release Boundary

Core: authentication, doctor approval/profile/availability, doctor discovery, online or in-clinic appointment booking, cancellation handling, and essential notifications.

Deferred: payment-related behavior, pharmacy, labs, home care, community questions, chat/file sharing, telehealth session delivery, verified reviews, and paid profile promotion.

Payment behavior is intentionally left unspecified and is not part of the flows in this release document.

## Documentation Maintenance

- When a flow changes, update its target document (`auth.md`, `booking.md`, `doctor.md`, or `admin.md`) in the same change.
- Record a learned rule in the matching flow document under its **Learned Rules** section; do not create a standalone learned-rules file.
- Update this index only when the flow list, cross-flow dependencies, or release boundary changes.
