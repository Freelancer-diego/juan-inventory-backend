import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secreto123!', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: true, description: 'Obliga al usuario a cambiar su contraseña en el primer inicio' })
  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean;
}
