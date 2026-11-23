import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appOrigin: process.env.APP_ORIGIN,
  database: {
    uri: process.env.MONGO_URI ?? process.env.MONGODB_URI,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  mail: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number.parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },
  auth: {
    doctorEmailVerificationUrl: process.env.DOCTOR_EMAIL_VERIFICATION_URL,
    doctorMagicLinkUrl: process.env.DOCTOR_MAGIC_LINK_URL,
  },
  session: {
    secureCookie: process.env.SESSION_COOKIE_SECURE === 'true',
    trustedOrigins: (process.env.AUTH_TRUSTED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase(),
    name: process.env.SUPER_ADMIN_NAME?.trim(),
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [appConfig],
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('app.redis.url');
        if (!redisUrl) throw new Error('REDIS_URL must be configured.');
        return { stores: [createKeyv(redisUrl)], ttl: 259_200_000 };
      },
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
