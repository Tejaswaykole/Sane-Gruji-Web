import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  create(@Body() createDto: any, @Request() req: any) {
    return this.usersService.create(createDto, req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Request() req: any) {
    return this.usersService.update(id, updateDto, req.user.userId);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', @Request() req: any) {
    return this.usersService.updateStatus(id, status, req.user.userId);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('password') password: string, @Request() req: any) {
    return this.usersService.resetPassword(id, password, req.user.userId);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.remove(id, req.user.userId);
  }
}
