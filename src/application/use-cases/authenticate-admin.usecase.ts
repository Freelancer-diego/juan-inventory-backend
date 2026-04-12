import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Hasher } from '../../domain/ports/hasher.interface';

export class AuthenticateAdmin {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(email: string, password: string): Promise<{ id: string; role: AdminRole }> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      console.log('Admin not found for email:', email);
      throw new Error('Invalid credentials');
    }

    const isValid = await this.hasher.compare(password, admin.passwordHash);
    console.log('Password valid:', isValid);
    if (!isValid) {
      console.log('Invalid password');
      throw new Error('Invalid credentials');
    }

    return { id: admin.id, role: admin.role };
  }
}
