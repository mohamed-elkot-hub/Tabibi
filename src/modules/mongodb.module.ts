import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { userModel, UserCollection, UserRepository } from '../common/models/user';
import { DoctorRepository } from '../common/models/doctor';
import { Connection } from 'mongoose';
import { UserModule } from './user/user.module';
import { sessionModel, SessionCollection, SessionRepository } from '../common/models/session';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService], //  ConfigService
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.database.uri'),
        autoCreate: false,
        autoIndex: false,

        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('connected'));
          connection.on('open', () => console.log('open'));
          connection.on('disconnected', () => console.log('disconnected'));
          connection.on('reconnected', () => console.log('reconnected'));
          connection.on('disconnecting', () => console.log('disconnecting'));

          return connection;
        },
      }),
    }),
    MongooseModule.forFeatureAsync([userModel]),
    MongooseModule.forFeature([sessionModel]),
    UserModule,
  ],
  providers: [UserRepository, UserCollection, DoctorRepository, SessionCollection, SessionRepository],
  exports: [UserRepository, UserCollection, DoctorRepository, SessionCollection, SessionRepository, MongooseModule],
})
export class MongoDBModule {}
