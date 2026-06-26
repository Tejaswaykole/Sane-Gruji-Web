import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('SUPER_ADMIN')
  @Get('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Roles('PRINCIPAL')
  @Get('principal')
  getPrincipalDashboard() {
    return this.dashboardService.getPrincipalDashboard();
  }

  @Roles('ADMISSION_OFFICER')
  @Get('admission-officer')
  getAdmissionOfficerDashboard() {
    return this.dashboardService.getAdmissionOfficerDashboard();
  }

  @Roles('TEACHER')
  @Get('teacher')
  getTeacherDashboard(@Request() req: any) {
    return this.dashboardService.getTeacherDashboard(req.user.id);
  }

  @Roles('STUDENT')
  @Get('student')
  getStudentDashboard(@Request() req: any) {
    return this.dashboardService.getStudentDashboard(req.user.id);
  }

  @Roles('PARENT')
  @Get('parent')
  getParentDashboard(@Request() req: any) {
    return this.dashboardService.getParentDashboard(req.user.id);
  }

  @Get('search')
  searchGlobal(@Query('q') q: string) {
    return this.dashboardService.searchGlobal(q);
  }

  @Roles('SUPER_ADMIN', 'PRINCIPAL')
  @Get('reports')
  getReports() {
    return this.dashboardService.getReports();
  }
}
