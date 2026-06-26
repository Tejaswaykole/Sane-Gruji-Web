import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Post()
  create(@Body() createDto: any) {
    return this.studentsService.create(createDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER', 'TEACHER')
  @Get()
  findAll(@Query() query: any) {
    return this.studentsService.findAll(query);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER', 'TEACHER')
  @Get('classes')
  getClasses() {
    return this.studentsService.getClasses();
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER', 'TEACHER', 'STUDENT', 'PARENT')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.studentsService.update(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.studentsService.updateStatus(id, status);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id') id: string,
    @Body('document_type') documentType: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.studentsService.uploadDocument(id, file, documentType);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'ADMISSION_OFFICER')
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  bulkImport(@UploadedFile() file: Express.Multer.File) {
    return this.studentsService.bulkImport(file.buffer);
  }
}
