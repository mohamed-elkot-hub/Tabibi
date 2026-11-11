import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UserService } from '../user/user.service.js';
import { RegisterDoctorDto } from './dto/register-doctor.dto.js';
import { toPublicUser } from './auth.mapper.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async registerDoctor(dto: RegisterDoctorDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('Email already registered')
    }

    const doctor = await this.users.createDoctor({
      name: dto.name,
      email: dto.email,
      password: await this.passwordHasher.hash(dto.password),
      phone: dto.phone,
      specialty: dto.specialty,
      licenseNumber: dto.licenseNumber,
    })

    return toPublicUser(doctor);
  }

  async validateCredentials(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);

    const valid = await this.passwordHasher.verify(dto.password, user?.password);
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');

    if (this.passwordHasher.needsRehash(user.password)) {
      await this.users.updatePassword(
        String(user._id),
        await this.passwordHasher.hash(dto.password),
      );
    }

    return toPublicUser(user);
  }
}