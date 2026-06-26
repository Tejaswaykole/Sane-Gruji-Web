import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeUsers,
      recentNotices,
      pendingFees
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.class.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.notice.findMany({ 
        where: { status: 'PUBLISHED' }, 
        orderBy: { publish_date: 'desc' }, 
        take: 5 
      }),
      this.prisma.fee.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      })
    ]);

    // Simple attendance calculation for today
    const today = new Date();
    today.setHours(0,0,0,0);
    const [totalPresent, totalAttendance] = await Promise.all([
      this.prisma.attendance.count({ where: { attendance_date: { gte: today }, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { attendance_date: { gte: today } } })
    ]);
    const attendanceToday = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

    return {
      kpis: {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeUsers,
        attendanceToday,
        pendingFeesAmount: pendingFees._sum.amount || 0
      },
      widgets: {
        recentNotices
      }
    };
  }

  async getPrincipalDashboard() {
    return this.getAdminDashboard();
  }

  async getAdmissionOfficerDashboard() {
    const [newInquiries, contacted, interested, closed, recentInquiries] = await Promise.all([
      this.prisma.admissionInquiry.count({ where: { status: 'NEW' } }),
      this.prisma.admissionInquiry.count({ where: { status: 'CONTACTED' } }),
      this.prisma.admissionInquiry.count({ where: { status: 'INTERESTED' } }),
      this.prisma.admissionInquiry.count({ where: { status: 'CLOSED' } }),
      this.prisma.admissionInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
    ]);

    return {
      kpis: { newInquiries, contacted, interested, closed },
      widgets: { recentInquiries }
    };
  }

  async getTeacherDashboard(userId: string) {
    // Find teacher profile
    const teacher = await this.prisma.teacher.findUnique({ where: { user_id: userId } });
    if (!teacher) return {};

    const [assignedClasses, homeworkAssigned, recentNotices] = await Promise.all([
      this.prisma.class.count({ where: { teacher_id: teacher.id } }),
      this.prisma.homework.count({ where: { teacher_id: teacher.id } }),
      this.prisma.notice.findMany({ 
        where: { status: 'PUBLISHED', OR: [{ target_roles: { has: 'TEACHER' } }, { target_roles: { has: 'EVERYONE' } }] },
        orderBy: { publish_date: 'desc' },
        take: 5
      })
    ]);

    return {
      kpis: { assignedClasses, homeworkAssigned },
      widgets: { recentNotices }
    };
  }

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) return {};

    const [pendingHomework, feeSummary, recentNotices] = await Promise.all([
      this.prisma.homework.count({ where: { class_id: student.class_id, status: 'PUBLISHED' } }),
      this.prisma.fee.aggregate({
        where: { student_id: student.id, status: { in: ['PENDING', 'OVERDUE'] } },
        _sum: { amount: true }
      }),
      this.prisma.notice.findMany({ 
        where: { status: 'PUBLISHED', OR: [{ target_roles: { has: 'STUDENT' } }, { target_roles: { has: 'EVERYONE' } }] },
        orderBy: { publish_date: 'desc' },
        take: 5
      })
    ]);

    return {
      kpis: {
        pendingHomework,
        pendingFeesAmount: feeSummary._sum.amount || 0
      },
      widgets: { recentNotices }
    };
  }

  async getParentDashboard(userId: string) {
    const parent = await this.prisma.parent.findUnique({ 
      where: { user_id: userId },
      include: { children: true }
    });
    if (!parent || parent.children.length === 0) return {};

    const childIds = parent.children.map(c => c.id);
    const classIds = parent.children.map(c => c.class_id).filter(Boolean) as string[];

    const [pendingHomework, feeSummary, recentNotices] = await Promise.all([
      this.prisma.homework.count({ where: { class_id: { in: classIds }, status: 'PUBLISHED' } }),
      this.prisma.fee.aggregate({
        where: { student_id: { in: childIds }, status: { in: ['PENDING', 'OVERDUE'] } },
        _sum: { amount: true }
      }),
      this.prisma.notice.findMany({ 
        where: { status: 'PUBLISHED', OR: [{ target_roles: { has: 'PARENT' } }, { target_roles: { has: 'EVERYONE' } }] },
        orderBy: { publish_date: 'desc' },
        take: 5
      })
    ]);

    return {
      kpis: {
        childrenCount: childIds.length,
        pendingHomework,
        pendingFeesAmount: feeSummary._sum.amount || 0
      },
      widgets: { recentNotices }
    };
  }

  async searchGlobal(query: string) {
    if (!query || query.length < 2) return { students: [], teachers: [], notices: [] };

    const [students, teachers, notices] = await Promise.all([
      this.prisma.student.findMany({
        where: {
          OR: [
            { first_name: { contains: query, mode: 'insensitive' } },
            { last_name: { contains: query, mode: 'insensitive' } },
            { admission_no: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      this.prisma.teacher.findMany({
        where: {
          OR: [
            { first_name: { contains: query, mode: 'insensitive' } },
            { last_name: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      this.prisma.notice.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' }
        },
        take: 5
      })
    ]);

    return { students, teachers, notices };
  }

  async getReports() {
    // Generate basic tabulated data for reports page
    const studentsByClass = await this.prisma.class.findMany({
      include: {
        _count: { select: { students: true } }
      }
    });

    const feesByStatus = await this.prisma.fee.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: true
    });

    const inquiriesByStatus = await this.prisma.admissionInquiry.groupBy({
      by: ['status'],
      _count: true
    });

    return {
      studentsByClass,
      feesByStatus,
      inquiriesByStatus
    };
  }
}
