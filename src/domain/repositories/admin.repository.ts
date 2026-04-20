import { Admin } from '../entities/admin.entity';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  findAll(): Promise<Admin[]>;
  save(admin: Admin): Promise<void>;
  update(admin: Admin): Promise<void>;
  delete(id: string): Promise<void>;
}
