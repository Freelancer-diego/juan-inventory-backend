import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Hasher } from '../../domain/ports/hasher.interface';

export class AuthenticateAdmin {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(email: string, password: string): Promise<{ id: string; role: AdminRole; mustChangePassword: boolean }> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) throw new Error('Invalid credentials');

    const isValid = await this.hasher.compare(password, admin.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    return { id: admin.id, role: admin.role, mustChangePassword: admin.mustChangePassword };
  }
}
