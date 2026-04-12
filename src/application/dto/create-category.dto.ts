import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'cat-ferreteria', description: 'ID único de la categoría' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Ferreteria', description: 'Nombre de la categoría' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
