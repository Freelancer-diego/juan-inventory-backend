import { Admin } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { UserNotFoundError } from '../../domain/errors/domain-errors';

export class GetUserById {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(id: string): Promise<Omit<Admin, 'passwordHash'>> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new UserNotFoundError(id);

    const { passwordHash: _, ...view } = admin;
    return view;
  }
}
