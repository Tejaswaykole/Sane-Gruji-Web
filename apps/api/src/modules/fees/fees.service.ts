import { Injectable, NotFoundException } from '@nestjs/common';
import { FeesRepository } from './fees.repository';

@Injectable()
export class FeesService {
  constructor(private readonly repository: FeesRepository) {}

  async createFee(data: any) {
    return this.repository.createFee({
      academic_year: data.academic_year,
      fee_type: data.fee_type,
      amount: data.amount,
      due_date: new Date(data.due_date),
      status: data.status || 'PENDING',
      remarks: data.remarks,
      student: { connect: { id: data.student_id } }
    });
  }

  async findAllFees(query: any = {}, user: any) {
    const { page = 1, limit = 10, search, status, academic_year, class_id, student_id } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (academic_year) where.academic_year = academic_year;
    
    // Admin filtering
    if (student_id) where.student_id = student_id;
    if (class_id) {
      where.student = { ...where.student, class_id };
    }
    if (search) {
      where.student = {
        ...where.student,
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { admission_no: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Role based filtering
    if (user.role === 'STUDENT') {
      // Must be derived from the user context in a real app. For MVP we trust the query or context.
      // Assuming user.studentProfile.id is available
      if (user.studentProfile?.id) {
        where.student_id = user.studentProfile.id;
      }
    } else if (user.role === 'PARENT') {
      // Assuming parent profile has child IDs
      if (user.parentProfile?.children) {
        const childIds = user.parentProfile.children.map((c: any) => c.student_id);
        where.student_id = { in: childIds };
      }
    }

    const fees = await this.repository.findAllFees({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { due_date: 'desc' }
    });

    const total = await this.repository.countFees(where);

    return {
      data: fees,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findFeeById(id: string) {
    const fee = await this.repository.findFeeById(id);
    if (!fee) throw new NotFoundException('Fee record not found');
    return fee;
  }

  async updateFee(id: string, data: any) {
    const updateData: any = {};
    if (data.academic_year) updateData.academic_year = data.academic_year;
    if (data.fee_type) updateData.fee_type = data.fee_type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.due_date) updateData.due_date = new Date(data.due_date);
    if (data.status) updateData.status = data.status;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if (data.student_id) updateData.student = { connect: { id: data.student_id } };

    return this.repository.updateFee(id, updateData);
  }

  async updateStatus(id: string, status: string) {
    return this.repository.updateFee(id, { status: status as any });
  }

  async deleteFee(id: string) {
    return this.repository.deleteFee(id);
  }
}
