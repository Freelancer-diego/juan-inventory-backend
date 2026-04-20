import { randomUUID } from 'crypto';
import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { Hasher } from '../../domain/ports/hasher.interface';
import { DuplicateUserEmailError } from '../../domain/errors/domain-errors';

export class CreateUser {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(
    email: string,
    password: string,
    name?: string,
    mustChangePassword = true,
  ): Promise<Omit<Admin, 'passwordHash'>> {
    const existing = await this.adminRepository.findByEmail(email);
    if (existing) throw new DuplicateUserEmailError(email);

    const passwordHash = await this.hasher.hash(password);
    const admin = new Admin(randomUUID(), email, passwordHash, AdminRole.ADMIN, name, mustChangePassword);
    await this.adminRepository.save(admin);

    const { passwordHash: _, ...view } = admin;
    return view;
  }
}
