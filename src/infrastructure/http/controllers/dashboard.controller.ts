import { BadRequestException, Controller, Get, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetDashboardData } from '../../../application/use-cases/get-dashboard-data.usecase';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminRole } from '../../../domain/entities/admin.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardData: GetDashboardData) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Datos del dashboard',
    description:
      'KPIs, tendencia de ventas, alertas de stock y productos más vendidos. ' +
      'Acepta filtros opcionales de fecha (from / to en formato YYYY-MM-DD). ' +
      'Sin parámetros devuelve los últimos 30 días. Requiere rol ADMIN.',
  })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Datos calculados exitosamente.' })
  @ApiResponse({ status: 400, description: 'Fechas con formato inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async get(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(`${from}T00:00:00.000Z`);
      if (isNaN(fromDate.getTime())) {
        throw new BadRequestException(`Parámetro 'from' inválido: "${from}". Use formato YYYY-MM-DD.`);
      }
    }

    if (to) {
      toDate = new Date(`${to}T23:59:59.999Z`);
      if (isNaN(toDate.getTime())) {
        throw new BadRequestException(`Parámetro 'to' inválido: "${to}". Use formato YYYY-MM-DD.`);
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException(`'from' no puede ser posterior a 'to'.`);
    }

    return this.getDashboardData.execute(fromDate, toDate);
  }
}
