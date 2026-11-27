import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import {
  FileTemplateEngine,
  LogMailTransport,
  MailModule,
  SmtpTransport,
} from '@nestjs/mail';
import { DoctorEmailVerificationMail } from '../../../common/mail/doctor-email-verification.mail';
import { DoctorMagicLinkMail } from '../../../common/mail/doctor-magic-link.mail';

@Module({
  imports: [
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('app.nodeEnv') === 'production';
        const user = config.get<string>('app.mail.user');
        const password = config.get<string>('app.mail.password');
        const port = config.get<number>('app.mail.port', 587);

        if (!isProduction) {
          return {
            transport: new LogMailTransport(),
            from: config.get<string>('app.mail.from') || 'Tabibi <no-reply@localhost>',
        templates: new FileTemplateEngine({ dir: join(__dirname, '../../../common/mail/templates') }),
          };
        }

        if (!user || !password) {
          throw new Error('SMTP_USER and SMTP_PASSWORD are required in production.');
        }

        return {
          transport: new SmtpTransport({
            host: config.get<string>('app.mail.host', 'smtp.gmail.com'),
            port,
            secure: port === 465,
            ...(port === 465 ? {} : { startTls: 'required' as const }),
            auth: { user, pass: password },
          }),
          from: config.get<string>('app.mail.from') || user,
          templates: new FileTemplateEngine({ dir: join(__dirname, '../../../common/mail/templates') }),
        };
      },
    }),
  ],
  providers: [DoctorEmailVerificationMail, DoctorMagicLinkMail],
  exports: [MailModule],
})
export class AuthMailModule {}
