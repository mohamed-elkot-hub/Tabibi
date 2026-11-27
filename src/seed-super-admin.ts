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
    const configuredEmail = config.get<string>('app.superAdmin.email');
    const name = config.get<string>('app.superAdmin.name');
    const password = config.get<string>('app.superAdmin.password');
    if (!configuredEmail || !name || !password) throw new Error('SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME, and SUPER_ADMIN_PASSWORD must be configured.');
    const email = configuredEmail.trim().normalize('NFC').toLowerCase();

    const users = app.get(UserRepository);
    const existingSuperAdmin = await users.findOne({ filter: { role: UserRole.SUPER_ADMIN } });
    if (existingSuperAdmin) {
      if (existingSuperAdmin.email !== email) {
        throw new Error(`A super-admin already exists with email ${existingSuperAdmin.email}; configured email does not match, so no credentials were changed.`);
      }
      console.info(`Super-admin account ${email} already exists; no changes made.`);
      return;
    }
    const existing = await users.findOne({ filter: { email } });
    if (existing) {
      if (existing.role !== UserRole.SUPER_ADMIN) throw new Error('Configured super-admin email is already assigned to a different account role.');
      throw new Error('Configured super-admin email is already assigned to a different account role.');
    }

    const passwordHash = await app.get(PasswordHasher).hash(password);
    try {
      await users.create({ name, email, passwordHash, role: UserRole.SUPER_ADMIN, isVerified: true });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const winner = await users.findOne({ filter: { role: UserRole.SUPER_ADMIN } });
        if (winner) {
          if (winner.email !== email) {
            throw new Error(`A concurrent seed created super-admin ${winner.email}; configured email does not match, so no credentials were changed.`);
          }
          console.info(`Super-admin account ${email} was created by a concurrent seed; no changes made.`);
          return;
        }
      }
      throw error;
    }
    console.info(`Created super-admin account ${email}.`);
  } finally {
    await app.close();
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

void seedSuperAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
