import { Admin } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';

const SYSTEM_EMAILS = ['admin@example.com'];

export class GetAllUsers {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(): Promise<Omit<Admin, 'passwordHash'>[]> {
    const admins = await this.adminRepository.findAll();
    return admins
      .filter((a) => !SYSTEM_EMAILS.includes(a.email))
      .map(({ passwordHash: _, ...view }) => view);
  }
}
