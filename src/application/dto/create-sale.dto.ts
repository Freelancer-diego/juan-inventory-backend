import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty({ example: 'prod-001', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Cantidad vendida' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 1500.00, description: 'Precio unitario al momento de la venta' })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ example: 3000.00, description: 'Subtotal (cantidad * precio)' })
  @IsNumber()
  @IsPositive()
  subtotal: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'sale-123456', description: 'ID único de la venta' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '573001234567', description: 'Teléfono del cliente' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ type: [SaleItemDto], description: 'Lista de ítems de la venta' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({ example: 'VTA-230326-K7M2', description: 'Código legible único de la venta para identificación rápida' })
  @IsString()
  @IsNotEmpty()
  saleCode: string;

  @ApiProperty({ example: '2x Laptop Gamer ($3.000.000)\n1x Mouse ($120.000)', description: 'Resumen textual de los ítems del pedido' })
  @IsString()
  orderSummary: string;
}
