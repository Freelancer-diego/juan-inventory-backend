import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Correo electrónico del administrador' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'Contraseña del administrador' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
