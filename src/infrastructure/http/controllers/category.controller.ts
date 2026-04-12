import { Body, Controller, Get, Post, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCategory } from '../../../application/use-cases/create-category.usecase';
import { GetAllCategories } from '../../../application/use-cases/get-all-categories.usecase';
import { CreateCategoryDto } from '../../../application/dto/create-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminRole } from '../../../domain/entities/admin.entity';

@ApiTags('Categorías')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategory: CreateCategory,
    private readonly getAllCategories: GetAllCategories,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría', description: 'Registra una categoría en el sistema. Requiere rol ADMIN.' })
  @ApiResponse({ status: 201, description: 'La categoría ha sido creada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido (Requiere ADMIN).' })
  @ApiResponse({ status: 409, description: 'La categoría ya existe.' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    await this.createCategory.execute(createCategoryDto.id, createCategoryDto.name);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías', description: 'Retorna la lista completa de categorías disponibles.' })
  @ApiResponse({ status: 200, description: 'Lista de categorías retornada exitosamente.' })
  async findAll() {
    return this.getAllCategories.execute();
  }
}
