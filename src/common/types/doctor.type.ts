import { HydratedDocument } from 'mongoose';
import { IDoctor } from '../interfaces';
import { Doctor } from '../models/doctor';

export type DoctorDocument = HydratedDocument<Doctor>;
