import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { ExamsModule } from './modules/exams/exams.module';
import { NoticesModule } from './modules/notices/notices.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { FeesModule } from './modules/fees/fees.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [AuthModule, UsersModule, StudentsModule, TeachersModule, AttendanceModule, HomeworkModule, ExamsModule, NoticesModule, AdmissionsModule, FeesModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
