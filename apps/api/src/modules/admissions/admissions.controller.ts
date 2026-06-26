import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';

@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Public()
  @Post()
  createInquiry(@Body() createDto: any) {
    return this.admissionsService.createInquiry(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Get()
  findAllInquiries(@Query() query: any) {
    return this.admissionsService.findAllInquiries(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Get(':id')
  findInquiryById(@Param('id') id: string) {
    return this.admissionsService.findInquiryById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Patch(':id')
  updateInquiry(@Param('id') id: string, @Body() updateDto: any) {
    return this.admissionsService.updateInquiry(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Delete(':id')
  deleteInquiry(@Param('id') id: string) {
    return this.admissionsService.deleteInquiry(id);
  }
}
