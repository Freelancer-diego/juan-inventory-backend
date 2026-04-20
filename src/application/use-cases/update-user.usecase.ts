import { Admin } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Hasher } from '../../domain/ports/hasher.interface';
import { UserNotFoundError, DuplicateUserEmailError } from '../../domain/errors/domain-errors';

export class UpdateUser {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(
    id: string,
    data: { name?: string; email?: string; password?: string },
  ): Promise<Omit<Admin, 'passwordHash'>> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new UserNotFoundError(id);

    if (data.email && data.email !== admin.email) {
      const emailTaken = await this.adminRepository.findByEmail(data.email);
      if (emailTaken) throw new DuplicateUserEmailError(data.email);
      admin.email = data.email;
    }

    if (data.name !== undefined) admin.name = data.name;

    if (data.password) admin.passwordHash = await this.hasher.hash(data.password);

    await this.adminRepository.update(admin);

    const { passwordHash: _, ...view } = admin;
    return view;
  }
}
