import type { Mailable } from '@nestjs/mail';

export interface DoctorMagicLinkMailData {
  url: string;
  expiresAt: Date;
}

export class DoctorMagicLinkMail implements Mailable<DoctorMagicLinkMailData> {
  render(data: DoctorMagicLinkMailData) {
    return {
      subject: 'Your Tabibi sign-in link',
      template: 'doctor-magic-link',
      context: { url: data.url, expiresAt: data.expiresAt.toISOString() },
    };
  }
}
