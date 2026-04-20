import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '../../../domain/entities/admin.entity';
import { CreateUser } from '../../../application/use-cases/create-user.usecase';
import { GetAllUsers } from '../../../application/use-cases/get-all-users.usecase';
import { GetUserById } from '../../../application/use-cases/get-user-by-id.usecase';
import { UpdateUser } from '../../../application/use-cases/update-user.usecase';
import { DeleteUser } from '../../../application/use-cases/delete-user.usecase';
import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../../application/dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata('roles', [AdminRole.ADMIN])
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getAllUsers: GetAllUsers,
    private readonly getUserById: GetUserById,
    private readonly updateUser: UpdateUser,
    private readonly deleteUser: DeleteUser,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario administrador' })
  async create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto.email, dto.password, dto.name, dto.mustChangePassword ?? true);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  async findAll() {
    return this.getAllUsers.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async findOne(@Param('id') id: string) {
    return this.getUserById.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUser.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUser.execute(id);
  }
}
