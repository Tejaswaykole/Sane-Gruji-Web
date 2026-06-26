import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';

@Injectable()
export class AttendanceService {
  constructor(private readonly repository: AttendanceRepository) {}

  async markAttendance(records: any[], userId: string) {
    const data = records.map(r => ({
      ...r,
      marked_by: userId
    }));
    return this.repository.markDailyAttendance(data);
  }

  async getClassAttendance(classId: string, dateStr: string) {
    const date = new Date(dateStr);
    return this.repository.getAttendanceByClassAndDate(classId, date);
  }

  async getStudentAttendance(studentId: string, month: number, year: number) {
    return this.repository.getStudentAttendance(studentId, month, year);
  }

  async getAnalytics() {
    return this.repository.getAnalytics();
  }
}
