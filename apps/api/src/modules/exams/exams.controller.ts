import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  createExam(@Body() createDto: any) {
    return this.examsService.createExam(createDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get()
  findAllExams(@Query() query: any) {
    return this.examsService.findAllExams(query);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get(':id')
  findExamById(@Param('id') id: string) {
    return this.examsService.findExamById(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  updateExam(@Param('id') id: string, @Body() updateDto: any) {
    return this.examsService.updateExam(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  deleteExam(@Param('id') id: string) {
    return this.examsService.deleteExam(id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Post(':id/schedules')
  addSchedule(@Param('id') id: string, @Body() scheduleDto: any) {
    return this.examsService.addSchedule(id, scheduleDto);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Delete('schedules/:scheduleId')
  removeSchedule(@Param('scheduleId') scheduleId: string) {
    return this.examsService.removeSchedule(scheduleId);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marks')
export class MarksController {
  constructor(private readonly examsService: ExamsService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post()
  enterMarks(@Body() body: { exam_id: string, marks: any[] }, @Request() req: any) {
    return this.examsService.enterMarks(body.exam_id, body.marks, req.user.id);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT')
  @Get()
  findMarks(@Query() query: any) {
    return this.examsService.findMarks(query);
  }
}
