import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from '../http/controllers/admin.controller';
import { MongoDatabaseModule } from '../database/mongo/mongo.module';
import { AuthenticateAdmin } from '../../application/use-cases/authenticate-admin.usecase';
import { ChangePassword } from '../../application/use-cases/change-password.usecase';
import { MongoAdminRepository } from '../repositories/mongo-admin.repository';
import { BcryptService } from '../services/bcrypt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Admin, AdminSchema } from '../database/mongo/schemas/admin.schema';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    MongoDatabaseModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [
    JwtStrategy,
    MongoAdminRepository,
    BcryptService,
    {
      provide: AuthenticateAdmin,
      useFactory: (repo: MongoAdminRepository, hasher: BcryptService) =>
        new AuthenticateAdmin(repo, hasher),
      inject: [MongoAdminRepository, BcryptService],
    },
    {
      provide: ChangePassword,
      useFactory: (repo: MongoAdminRepository, hasher: BcryptService) =>
        new ChangePassword(repo, hasher),
      inject: [MongoAdminRepository, BcryptService],
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
