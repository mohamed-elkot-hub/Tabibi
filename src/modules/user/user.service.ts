import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../models/user/user.repository.js';
import { DoctorRepository } from '../../models/doctor/doctor.repository.js';

export interface CreateDoctor{
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialty: string;
  licenseNumber: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly doctorRepository: DoctorRepository,
  ) {}


  async createDoctor(data: CreateDoctor) {

    const licenseTaken = await this.doctorRepository.getOne({
      licenseNumber: data.licenseNumber,
    });
    if (licenseTaken) {
      throw new ConflictException('License number already registered');
    }

    return this.doctorRepository.create(data);
  }

  findByEmail(email: string) {
    return this.userRepository.getOne({ email }, '+password');
  }

  findById(id: string) {
    return this.userRepository.getOne({ _id: id } as any);
  }

  updatePassword(id: string, hashedPassword: string) {
    return this.userRepository.updateOne({ _id: id } as any, { password: hashedPassword });
  }
}