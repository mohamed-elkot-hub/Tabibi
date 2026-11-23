import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../abstract.repository';
import { Session } from './session.schema';

@Injectable()
export class SessionRepository extends AbstractRepository<Session> {
  constructor(@InjectModel(Session.name) sessionModel: Model<Session>) {
    super(sessionModel);
  }
}
