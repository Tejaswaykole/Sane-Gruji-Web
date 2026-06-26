import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceRepository {
  constructor(private prisma: PrismaService) {}

  async markDailyAttendance(data: any[]) {
    // Bulk upsert using transactions
    return this.prisma.$transaction(
      data.map(record => 
        this.prisma.attendance.upsert({
          where: {
            student_id_attendance_date: {
              student_id: record.student_id,
              attendance_date: new Date(record.attendance_date)
            }
          },
          update: {
            status: record.status,
            remarks: record.remarks,
            marked_by: record.marked_by
          },
          create: {
            student_id: record.student_id,
            class_id: record.class_id,
            attendance_date: new Date(record.attendance_date),
            status: record.status,
            remarks: record.remarks,
            marked_by: record.marked_by
          }
        })
      )
    );
  }

  async getAttendanceByClassAndDate(class_id: string, date: Date) {
    return this.prisma.attendance.findMany({
      where: {
        class_id,
        attendance_date: date
      },
      include: {
        student: {
          select: { id: true, first_name: true, last_name: true, admission_no: true }
        }
      }
    });
  }

  async getStudentAttendance(student_id: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendance.findMany({
      where: {
        student_id,
        attendance_date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { attendance_date: 'asc' }
    });
  }

  async getAnalytics() {
    const total = await this.prisma.attendance.count();
    const present = await this.prisma.attendance.count({ where: { status: 'PRESENT' } });
    const absent = await this.prisma.attendance.count({ where: { status: 'ABSENT' } });
    const late = await this.prisma.attendance.count({ where: { status: 'LATE' } });
    const leave = await this.prisma.attendance.count({ where: { status: 'LEAVE' } });

    // Mock low attendance alerts for now
    const alerts = [
      { student_name: "Charlie Brown", class: "Grade 10-A", percentage: 68, status: "CRITICAL" },
      { student_name: "David Miller", class: "Grade 9-B", percentage: 72, status: "WARNING" }
    ];

    return {
      total,
      present,
      absent,
      late,
      leave,
      present_pct: total ? ((present / total) * 100).toFixed(1) : "0.0",
      absent_pct: total ? ((absent / total) * 100).toFixed(1) : "0.0",
      late_pct: total ? ((late / total) * 100).toFixed(1) : "0.0",
      leave_pct: total ? ((leave / total) * 100).toFixed(1) : "0.0",
      alerts
    };
  }
}
