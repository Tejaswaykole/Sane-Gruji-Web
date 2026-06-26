import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post('mark')
  markAttendance(@Body('records') records: any[], @Request() req: any) {
    return this.attendanceService.markAttendance(records, req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Get('class/:classId')
  getClassAttendance(@Param('classId') classId: string, @Query('date') date: string) {
    return this.attendanceService.getClassAttendance(classId, date);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @Get('student/:studentId')
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    return this.attendanceService.getStudentAttendance(studentId, parseInt(month), parseInt(year));
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Get('analytics')
  getAnalytics() {
    return this.attendanceService.getAnalytics();
  }
}
