import { Body, Controller, Param, Post, UseGuards, SetMetadata, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSale } from '../../../application/use-cases/create-sale.usecase';
import { ValidateSale } from '../../../application/use-cases/validate-sale.usecase';
import { GetAllSales } from '../../../application/use-cases/get-all-sales.usecase';
import { CreateSaleDto } from '../../../application/dto/create-sale.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminRole } from '../../../domain/entities/admin.entity';

@ApiTags('Ventas')
@Controller('sales')
export class SaleController {
  constructor(
    private readonly createSale: CreateSale,
    private readonly validateSale: ValidateSale,
    private readonly getAllSales: GetAllSales,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta', description: 'Crea una orden de venta en estado PENDIENTE.' })
  @ApiResponse({ status: 201, description: 'La venta ha sido registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async create(@Body() createSaleDto: CreateSaleDto) {
    await this.createSale.execute(createSaleDto.id, createSaleDto.items, createSaleDto.customerName, createSaleDto.customerPhone, createSaleDto.saleCode, createSaleDto.orderSummary);
  }

  @Post(':id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar una venta', description: 'Verifica stock, confirma la venta y descuenta el inventario. Requiere rol ADMIN.' })
  @ApiParam({ name: 'id', description: 'ID de la venta a validar', example: 'sale-123456' })
  @ApiResponse({ status: 201, description: 'Venta validada exitosamente. Stock descontado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido (Requiere ADMIN).' })
  @ApiResponse({ status: 400, description: 'Error de validación (estado incorrecto, stock insuficiente, etc.).' })
  @ApiResponse({ status: 404, description: 'Venta o producto no encontrado.' })
  async validate(@Param('id') id: string) {
    await this.validateSale.execute(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las ventas', description: 'Retorna todas las ventas. Requiere rol ADMIN.' })
  @ApiResponse({ status: 200, description: 'Lista de ventas retornada.' })
  async findAll() {
    return this.getAllSales.execute();
  }
}
