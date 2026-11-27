import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { ConfigService } from '@nestjs/config';
import { AuthorizationModule } from '@nestjs/authorization';
import {
  authenticationStoreModels,
  MongooseAuthenticationStore,
} from './storage/mongoose-authentication.store';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordLoginModule } from './password-login/password-login.module';
import { MagicLinkModule } from './magic-link/magic-link.module';
import { AuthMailModule } from './shared/auth-mail.module';
import { RegistrationModule } from './registration/registration.module';
import { SelfServiceModule } from './self-service/self-service.module';

@Module({
  imports: [
    MongooseModule.forFeature(authenticationStoreModels),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        session: {
          absoluteTtl: '7d',
          idleTtl: '1d',
          cookieName: config.get<boolean>('app.session.secureCookie')
            ? '__Host-sid'
            : 'sid',
          cookie: {
            secure: config.get<boolean>('app.session.secureCookie'),
            sameSite: 'lax',
            path: '/',
          },
          trustedOrigins: config.get<string[]>(
            'app.session.trustedOrigins',
            [],
          ),
        },
        magicLink: {
          url:
            config.get<string>('app.auth.doctorMagicLinkUrl') ??
            'http://localhost:3000/auth/doctor/magic-link/consume',
          ttl: '15m',
          bindToBrowser: false,
          cookie: { secure: config.get<boolean>('app.session.secureCookie') },
        },
        emailVerification: {
          url:
            config.get<string>('app.auth.doctorEmailVerificationUrl') ??
            'http://localhost:3000/auth/doctor/verify-email',
          ttl: '3d',
        },
        allowInMemoryStorage: false,
      }),
      isGlobal: true,
    }),
    AuthorizationModule.forRoot({ isGlobal: true, globalGuard: true }),
    AuthMailModule,
    RegistrationModule,
    PasswordLoginModule,
    MagicLinkModule,
    SelfServiceModule,
  ],
  providers: [MongooseAuthenticationStore],
  exports: [AuthenticationModule],
})
export class AuthModule {}
