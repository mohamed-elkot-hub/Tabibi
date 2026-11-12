import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const config = app.get(ConfigService);
  const sessionSecret =config.get<string>('sessionSecret');
  const mongoUri = config.get<string>('database.uri');
  if (!mongoUri) {
    throw new Error('MongoDB URI is missing');
  }
  if (!sessionSecret) {
    throw new Error('session secrets are missing');
  }
  app.use(
    session({
    name:'tabibi.side',
    secret:sessionSecret,

      resave: false,
      saveUninitialized: false,

      store:MongoStore.create({
        mongoUrl:mongoUri,
        collectionName:'sessions',
        ttl: 60 * 60 * 24 * 7,
      }),

      cookie:{
      httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'lax',
        maxAge:1000*60*60*24*7,
      }
  }))
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
