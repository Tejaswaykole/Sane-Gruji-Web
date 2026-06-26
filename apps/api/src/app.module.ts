import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';

@Module({
  imports: [AuthModule, UsersModule, StudentsModule, TeachersModule, AttendanceModule, HomeworkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
