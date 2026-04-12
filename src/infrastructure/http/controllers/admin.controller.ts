import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticateAdmin } from '../../../application/use-cases/authenticate-admin.usecase';
import { LoginAdminDto } from '../../../application/dto/login-admin.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly authenticateAdmin: AuthenticateAdmin,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión como administrador', description: 'Retorna un JWT si las credenciales son válidas.' })
  @ApiResponse({ status: 201, description: 'Login exitoso. Retorna JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginAdminDto) {
    try {
      const { id, role } = await this.authenticateAdmin.execute(loginDto.email, loginDto.password);
      
      const payload = { sub: id, role: role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
