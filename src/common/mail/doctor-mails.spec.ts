import { describe, expect, it } from 'vitest';
import { DoctorEmailVerificationMail } from './doctor-email-verification.mail';
import { DoctorMagicLinkMail } from './doctor-magic-link.mail';

describe('doctor mailables', () => {
  const expiresAt = new Date('2026-01-01T00:00:00.000Z');

  it('renders the email verification template context', () => {
    expect(new DoctorEmailVerificationMail().render({ url: 'https://tabibi.test/verify', expiresAt })).toEqual({
      subject: 'Verify your Tabibi doctor account', template: 'doctor-email-verification', context: { url: 'https://tabibi.test/verify', expiresAt: expiresAt.toISOString() },
    });
  });

  it('renders the magic link template context', () => {
    expect(new DoctorMagicLinkMail().render({ url: 'https://tabibi.test/magic', expiresAt })).toEqual({
      subject: 'Your Tabibi sign-in link', template: 'doctor-magic-link', context: { url: 'https://tabibi.test/magic', expiresAt: expiresAt.toISOString() },
    });
  });
});
