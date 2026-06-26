import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Post()
  create(@Body() createDto: any) {
    return this.teachersService.create(createDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER', 'TEACHER')
  @Get()
  findAll(@Query() query: any) {
    return this.teachersService.findAll(query);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER', 'TEACHER', 'STUDENT', 'PARENT')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.teachersService.update(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'RESIGNED') {
    return this.teachersService.updateStatus(id, status);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
