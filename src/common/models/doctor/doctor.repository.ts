import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDoctor, IUser } from '../../interfaces';
import { AbstractRepository } from '../abstract.repository';
import { Doctor } from './doctor.schema';
@Injectable()
export class DoctorRepository extends AbstractRepository<IDoctor> {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<IDoctor>,
  ) {
    super(doctorModel);
  }
}
