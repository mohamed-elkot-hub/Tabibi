import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../../interfaces';
import { AbstractRepository } from '../abstract.repository';
import { User } from './user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<IUser> {
  constructor(@InjectModel(User.name) userModel: Model<IUser>) {
    super(userModel);
  }
}
