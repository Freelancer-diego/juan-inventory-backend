import { Body, Controller, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticateAdmin } from '../../../application/use-cases/authenticate-admin.usecase';
import { ChangePassword } from '../../../application/use-cases/change-password.usecase';
import { LoginAdminDto } from '../../../application/dto/login-admin.dto';
import { ChangePasswordDto } from '../../../application/dto/change-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly authenticateAdmin: AuthenticateAdmin,
    private readonly changePassword: ChangePassword,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión como administrador' })
  @ApiResponse({ status: 201, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginAdminDto) {
    try {
      const { id, role, mustChangePassword } = await this.authenticateAdmin.execute(
        loginDto.email,
        loginDto.password,
      );

      const payload = { sub: id, role };
      const access_token = this.jwtService.sign(payload);

      if (mustChangePassword) {
        return { must_change_password: true, access_token };
      }

      return { access_token };
    } catch {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña (primer inicio de sesión)' })
  async changePasswordHandler(@Request() req: any, @Body() dto: ChangePasswordDto) {
    await this.changePassword.execute(req.user.id, dto.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
