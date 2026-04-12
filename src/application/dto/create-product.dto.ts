import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'prod-001', description: 'ID único del producto' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Laptop Gamer', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1500.00, description: 'Precio unitario del producto' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 50, description: 'Cantidad disponible en stock' })
  @IsNumber()
  @IsPositive()
  stock: number;

  @ApiProperty({ example: '/products/laptop.png', description: 'URL de la imagen del producto', required: false })
  @IsString()
  image: string;

  @ApiProperty({ example: 'cat-ferreteria', description: 'ID de la categoría del producto' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
