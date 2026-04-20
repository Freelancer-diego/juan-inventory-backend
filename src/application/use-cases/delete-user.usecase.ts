import { AdminRepository } from '../../domain/repositories/admin.repository';
import { UserNotFoundError } from '../../domain/errors/domain-errors';

export class DeleteUser {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(id: string): Promise<void> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new UserNotFoundError(id);
    await this.adminRepository.delete(id);
  }
}
