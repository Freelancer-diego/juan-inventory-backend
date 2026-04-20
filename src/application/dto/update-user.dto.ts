import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'juan@example.com', description: 'Correo electrónico' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'NuevaClave123!', description: 'Nueva contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
