import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoticesService } from './notices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  createNotice(@Body() createDto: any, @Request() req: any) {
    return this.noticesService.createNotice(createDto, req.user.id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post(':id/attachment')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.noticesService.uploadAttachment(id, file);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'ADMISSION_OFFICER')
  @Get()
  findAllNotices(@Query() query: any, @Request() req: any) {
    // Pass user context for role-based filtering
    return this.noticesService.findAllNotices(query, {
      role: req.user.role,
      id: req.user.id
    });
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'ADMISSION_OFFICER')
  @Get(':id')
  findNoticeById(@Param('id') id: string) {
    return this.noticesService.findNoticeById(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  updateNotice(@Param('id') id: string, @Body() updateDto: any) {
    return this.noticesService.updateNotice(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  deleteNotice(@Param('id') id: string) {
    return this.noticesService.deleteNotice(id);
  }
}
