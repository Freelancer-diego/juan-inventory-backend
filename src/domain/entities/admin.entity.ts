export enum AdminRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class Admin {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public role: AdminRole,
    public name?: string,
    public mustChangePassword: boolean = true,
  ) {}
}
