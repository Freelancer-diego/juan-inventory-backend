import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Hasher } from '../../domain/ports/hasher.interface';

@Injectable()
export class BcryptService implements Hasher {
  async hash(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
