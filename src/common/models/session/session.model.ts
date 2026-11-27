import { Session, SessionSchema } from './session.schema';

export const sessionModel = {
  name: Session.name,
  collection: 'sessions',
  schema: SessionSchema,
};
