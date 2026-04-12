import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Admin as AdminModel, AdminDocument } from '../database/mongo/schemas/admin.schema';

@Injectable()
export class MongoAdminRepository implements AdminRepository {
  constructor(
    @InjectModel(AdminModel.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const found = await this.adminModel.findOne({ email }).exec();
    if (!found) return null;
    return new Admin(found._id, found.email, found.passwordHash, found.role as AdminRole);
  }

  async save(admin: Admin): Promise<void> {
    const newAdmin = new this.adminModel({
      _id: admin.id,
      email: admin.email,
      passwordHash: admin.passwordHash,
      role: admin.role,
    });
    await newAdmin.save();
  }
}
