import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamsRepository } from './exams.repository';

@Injectable()
export class ExamsService {
  constructor(private readonly repository: ExamsRepository) {}

  // --- Exams ---
  async createExam(data: any) {
    return this.repository.createExam({
      name: data.name,
      exam_type: data.exam_type,
      academic_year: data.academic_year,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      status: data.status || 'DRAFT'
    });
  }

  async findAllExams(query: any = {}) {
    const { page = 1, limit = 10, search, status, sortBy = 'start_date', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) where.status = status;

    const exams = await this.repository.findAllExams({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await this.repository.countExams(where);

    return {
      data: exams,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findExamById(id: string) {
    const exam = await this.repository.findExamById(id);
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async updateExam(id: string, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.exam_type) updateData.exam_type = data.exam_type;
    if (data.academic_year) updateData.academic_year = data.academic_year;
    if (data.start_date) updateData.start_date = new Date(data.start_date);
    if (data.end_date) updateData.end_date = new Date(data.end_date);
    if (data.status) updateData.status = data.status;

    return this.repository.updateExam(id, updateData);
  }

  async deleteExam(id: string) {
    return this.repository.deleteExam(id);
  }

  // --- Schedules ---
  async addSchedule(examId: string, data: any) {
    return this.repository.addSchedule(examId, data);
  }

  async removeSchedule(scheduleId: string) {
    return this.repository.removeSchedule(scheduleId);
  }

  // --- Marks ---
  private calculateGrade(obtained: number, total: number): string {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  async enterMarks(examId: string, marksData: any[], userId: string) {
    const results = [];
    for (const mark of marksData) {
      const grade = this.calculateGrade(Number(mark.marks_obtained), Number(mark.total_marks));
      const res = await this.repository.upsertMark({
        exam_id: examId,
        student_id: mark.student_id,
        subject_id: mark.subject_id,
        marks_obtained: Number(mark.marks_obtained),
        total_marks: Number(mark.total_marks),
        grade,
        remarks: mark.remarks,
        entered_by: userId
      });
      results.push(res);
    }
    return results;
  }

  async findMarks(query: any) {
    const { examId, classId, subjectId, studentId } = query;
    const where: any = {};
    if (examId) where.exam_id = examId;
    if (subjectId) where.subject_id = subjectId;
    if (studentId) where.student_id = studentId;
    if (classId) where.student = { class_id: classId };

    return this.repository.findMarks(where);
  }
}
