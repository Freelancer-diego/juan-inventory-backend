import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Hasher } from '../../domain/ports/hasher.interface';
import { UserNotFoundError } from '../../domain/errors/domain-errors';

export class ChangePassword {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(adminId: string, newPassword: string): Promise<void> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) throw new UserNotFoundError(adminId);

    admin.passwordHash = await this.hasher.hash(newPassword);
    admin.mustChangePassword = false;
    await this.adminRepository.update(admin);
  }
}
