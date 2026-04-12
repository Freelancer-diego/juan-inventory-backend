import { Admin } from '../entities/admin.entity';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  save(admin: Admin): Promise<void>;
}
