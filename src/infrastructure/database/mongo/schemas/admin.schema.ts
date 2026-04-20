import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRole } from '../../../../domain/entities/admin.entity';

export type AdminDocument = Admin & Document;

@Schema({ collection: 'admins' })
export class Admin {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: AdminRole, default: AdminRole.ADMIN })
  role: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: true, default: true })
  mustChangePassword: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
