import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, MagicLinkHandler } from '@nestjs/authentication';
import type { MagicLink, MagicLinkAccount } from '@nestjs/authentication';
import { Mailer } from '@nestjs/mail';
import { DoctorMagicLinkMail } from '../../../common/mail/doctor-magic-link.mail';
import { UserRepository } from '../../../common/models/user';
import { UserRole } from '../../../common/enums';

@Injectable()
export class DoctorMagicLinkHandler extends MagicLinkHandler {
  constructor(
    private readonly users: UserRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('magicLink', this);
  }

  async send(link: MagicLink): Promise<void> {
    await this.mailer.send(DoctorMagicLinkMail, {
      to: link.email,
      data: { url: link.url, expiresAt: link.expiresAt },
    });
  }

  async resolveUser(email: string): Promise<MagicLinkAccount | null> {
    const user = await this.users.findByEmail(email);
    if (!user || ![UserRole.DOCTOR, UserRole.SUPER_ADMIN].includes(user.role as UserRole) || !user.isVerified) return null;
    return { id: String(user.id), email: user.email };
  }
}
