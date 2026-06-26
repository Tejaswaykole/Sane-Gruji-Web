import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  createFee(@Body() createDto: any) {
    return this.feesService.createFee(createDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get()
  findAllFees(@Query() query: any, @Request() req: any) {
    // Pass user context for role-based filtering
    return this.feesService.findAllFees(query, req.user);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get(':id')
  findFeeById(@Param('id') id: string) {
    return this.feesService.findFeeById(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  updateFee(@Param('id') id: string, @Body() updateDto: any) {
    return this.feesService.updateFee(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.feesService.updateStatus(id, status);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  deleteFee(@Param('id') id: string) {
    return this.feesService.deleteFee(id);
  }
}
