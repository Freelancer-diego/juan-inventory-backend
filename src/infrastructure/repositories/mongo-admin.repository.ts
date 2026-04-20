import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { DuplicateUserEmailError } from '../../domain/errors/domain-errors';
import { Admin as AdminModel, AdminDocument } from '../database/mongo/schemas/admin.schema';

@Injectable()
export class MongoAdminRepository implements AdminRepository {
  constructor(
    @InjectModel(AdminModel.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  private toDomain(doc: AdminDocument): Admin {
    return new Admin(doc._id, doc.email, doc.passwordHash, doc.role as AdminRole, doc.name ?? undefined, doc.mustChangePassword ?? true);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const found = await this.adminModel.findOne({ email }).exec();
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<Admin | null> {
    const found = await this.adminModel.findById(id).exec();
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Admin[]> {
    const docs = await this.adminModel.find().exec();
    return docs.map((d) => this.toDomain(d));
  }

  async save(admin: Admin): Promise<void> {
    try {
      const newAdmin = new this.adminModel({
        _id: admin.id,
        email: admin.email,
        passwordHash: admin.passwordHash,
        role: admin.role,
        name: admin.name,
        mustChangePassword: admin.mustChangePassword,
      });
      await newAdmin.save();
    } catch (err: any) {
      if (err?.code === 11000) throw new DuplicateUserEmailError(admin.email);
      throw err;
    }
  }

  async update(admin: Admin): Promise<void> {
    try {
      await this.adminModel
        .findByIdAndUpdate(admin.id, {
          email: admin.email,
          passwordHash: admin.passwordHash,
          role: admin.role,
          name: admin.name,
          mustChangePassword: admin.mustChangePassword,
        })
        .exec();
    } catch (err: any) {
      if (err?.code === 11000) throw new DuplicateUserEmailError(admin.email);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    await this.adminModel.findByIdAndDelete(id).exec();
  }
}
