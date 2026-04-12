import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, SetMetadata, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CreateProduct } from '../../../application/use-cases/create-product.usecase';
import { GetAllProducts } from '../../../application/use-cases/get-all-products.usecase';
import { GetProductById } from '../../../application/use-cases/get-product-by-id.usecase';
import { UpdateProduct } from '../../../application/use-cases/update-product.usecase';
import { DeleteProduct } from '../../../application/use-cases/delete-product.usecase';
import { CreateProductDto } from '../../../application/dto/create-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminRole } from '../../../domain/entities/admin.entity';
import { CloudinaryService } from '../../services/cloudinary.service';

@ApiTags('Productos')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProduct: CreateProduct,
    private readonly getAllProducts: GetAllProducts,
    private readonly getProductById: GetProductById,
    private readonly updateProduct: UpdateProduct,
    private readonly deleteProduct: DeleteProduct,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Subir imagen de producto', description: 'Sube una imagen a Cloudinary y retorna la URL segura. Solo JPG, PNG y WEBP. Máximo 5 MB.' })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente. Retorna { url: string }.' })
  @ApiResponse({ status: 400, description: 'Archivo inválido (tipo o tamaño).' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const url = await this.cloudinaryService.uploadImage(file);
    return { url };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto', description: 'Registra un producto en el inventario con su stock inicial. Requiere rol ADMIN.' })
  @ApiResponse({ status: 201, description: 'El producto ha sido creado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido (Requiere ADMIN).' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.createProduct.execute(
      createProductDto.id,
      createProductDto.name,
      createProductDto.price,
      createProductDto.stock,
      createProductDto.image,
      createProductDto.categoryId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Consultar todos los productos', description: 'Retorna la lista completa de productos.' })
  @ApiResponse({ status: 200, description: 'Lista de productos retornada exitosamente.' })
  async findAll() {
    return this.getAllProducts.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar producto por ID', description: 'Busca un producto por su identificador único.' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.getProductById.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los datos de un producto (nombre, precio, stock). Requiere rol ADMIN.' })
  @ApiParam({ name: 'id', description: 'ID del producto a actualizar' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido (Requiere ADMIN).' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
    return this.updateProduct.execute(
      id,
      updateProductDto.name,
      updateProductDto.price,
      updateProductDto.stock,
      updateProductDto.image,
      updateProductDto.categoryId,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [AdminRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar producto', description: 'Elimina un producto del inventario. Requiere rol ADMIN.' })
  @ApiParam({ name: 'id', description: 'ID del producto a eliminar' })
  @ApiResponse({ status: 204, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido (Requiere ADMIN).' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteProduct.execute(id);
  }
}
