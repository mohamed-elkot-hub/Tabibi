import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { userModel, UserRepository } from '../common/models/user';
import { Connection } from 'mongoose';
import { UserModule } from './user/user.module';
import configurtion from '../config/configurtion';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configurtion] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService], //  ConfigService
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),

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
    UserModule,
  ],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class MongoDBModule {}
