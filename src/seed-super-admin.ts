import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PasswordHasher } from '@nestjs/authentication';
import { AppModule } from './app.module';
import { UserRepository } from './common/models/user';
import { UserRole } from './common/enums';

async function seedSuperAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const config = app.get(ConfigService);
    const email = config.get<string>('app.superAdmin.email');
    const name = config.get<string>('app.superAdmin.name');
    const password = config.get<string>('app.superAdmin.password');
    if (!email || !name || !password) throw new Error('SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME, and SUPER_ADMIN_PASSWORD must be configured.');

    const users = app.get(UserRepository);
    const existing = await users.findOne({ filter: { email } });
    if (existing) {
      if (existing.role !== UserRole.SUPER_ADMIN) throw new Error('Configured super-admin email is already assigned to a different account role.');
      console.info(`Super-admin account ${email} already exists; no changes made.`);
      return;
    }

    const passwordHash = await app.get(PasswordHasher).hash(password);
    await users.create({ name, email, passwordHash, role: UserRole.SUPER_ADMIN, isVerified: true });
    console.info(`Created super-admin account ${email}.`);
  } finally {
    await app.close();
  }
}

void seedSuperAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
