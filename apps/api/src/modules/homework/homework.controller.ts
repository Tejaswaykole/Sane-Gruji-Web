import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post()
  create(@Body() createDto: any, @Request() req: any) {
    // Determine teacherId. In MVP, user has teacherProfile, but we can just require teacherId in DTO or infer from user
    // For simplicity, we assume teacher_id is sent in createDto, or we could fetch the teacher profile.
    // Let's expect teacher_id in createDto for SUPER_ADMIN, otherwise fetch it. 
    // Actually, createDto.teacher_id is best.
    return this.homeworkService.create(createDto, createDto.teacher_id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get()
  findAll(@Query() query: any) {
    return this.homeworkService.findAll(query);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeworkService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.homeworkService.update(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeworkService.remove(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post(':id/attachment')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.homeworkService.uploadAttachment(id, file);
  }
}
