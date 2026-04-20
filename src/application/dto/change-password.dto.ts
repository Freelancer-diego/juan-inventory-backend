import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'NuevaClave123!', description: 'Nueva contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
