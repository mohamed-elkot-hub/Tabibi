import type { Mailable } from '@nestjs/mail';

export interface DoctorEmailVerificationMailData {
  url: string;
  expiresAt: Date;
}

export class DoctorEmailVerificationMail implements Mailable<DoctorEmailVerificationMailData> {
  render(data: DoctorEmailVerificationMailData) {
    return {
      subject: 'Verify your Tabibi doctor account',
      template: 'doctor-email-verification',
      context: { url: data.url, expiresAt: data.expiresAt.toISOString() },
    };
  }
}
