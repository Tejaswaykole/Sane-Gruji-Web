import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamsRepository {
  constructor(private prisma: PrismaService) {}

  async createExam(data: Prisma.ExamCreateInput) {
    return this.prisma.exam.create({
      data,
    });
  }

  async findAllExams(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ExamWhereInput;
    orderBy?: Prisma.ExamOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.exam.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async countExams(where?: Prisma.ExamWhereInput) {
    return this.prisma.exam.count({ where });
  }

  async findExamById(id: string) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            subject: true,
            class: true
          }
        }
      }
    });
  }

  async updateExam(id: string, data: Prisma.ExamUpdateInput) {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async deleteExam(id: string) {
    return this.prisma.exam.delete({
      where: { id },
    });
  }

  // --- Schedules ---
  async addSchedule(examId: string, data: any) {
    return this.prisma.examSchedule.create({
      data: {
        exam_id: examId,
        subject_id: data.subject_id,
        class_id: data.class_id,
        exam_date: new Date(data.exam_date),
        start_time: data.start_time,
        end_time: data.end_time,
        room: data.room
      }
    });
  }

  async removeSchedule(id: string) {
    return this.prisma.examSchedule.delete({ where: { id } });
  }

  // --- Marks ---
  async upsertMark(data: any) {
    return this.prisma.mark.upsert({
      where: {
        exam_id_student_id_subject_id: {
          exam_id: data.exam_id,
          student_id: data.student_id,
          subject_id: data.subject_id
        }
      },
      update: {
        marks_obtained: data.marks_obtained,
        total_marks: data.total_marks,
        grade: data.grade,
        remarks: data.remarks,
        entered_by: data.entered_by
      },
      create: {
        exam_id: data.exam_id,
        student_id: data.student_id,
        subject_id: data.subject_id,
        marks_obtained: data.marks_obtained,
        total_marks: data.total_marks,
        grade: data.grade,
        remarks: data.remarks,
        entered_by: data.entered_by
      }
    });
  }

  async findMarks(where: Prisma.MarkWhereInput) {
    return this.prisma.mark.findMany({
      where,
      include: {
        student: true,
        subject: true,
        exam: true
      }
    });
  }
}
