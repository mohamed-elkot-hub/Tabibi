import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'sessions', versionKey: false })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ type: Date, required: true })
  lastActiveAt: Date;

  @Prop({ type: String, enum: ['pending', 'verified'] })
  mfa?: 'pending' | 'verified';

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.set('autoCreate', false);
SessionSchema.set('autoIndex', false);
