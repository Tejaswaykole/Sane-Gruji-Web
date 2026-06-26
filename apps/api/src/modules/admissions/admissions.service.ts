import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionsRepository } from './admissions.repository';

@Injectable()
export class AdmissionsService {
  constructor(private readonly repository: AdmissionsRepository) {}

  async createInquiry(data: any) {
    return this.repository.createInquiry({
      student_name: data.student_name,
      parent_name: data.parent_name,
      phone: data.phone,
      email: data.email,
      grade_applying: data.grade_applying,
      message: data.message,
      source: data.source || 'WEBSITE',
      status: 'NEW'
    });
  }

  async findAllInquiries(query: any = {}) {
    const { page = 1, limit = 10, search, status, grade_applying, assigned_to } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { student_name: { contains: search, mode: 'insensitive' } },
        { parent_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    if (status) where.status = status;
    if (grade_applying) where.grade_applying = grade_applying;
    if (assigned_to) where.assigned_to = assigned_to;

    const inquiries = await this.repository.findAllInquiries({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.repository.countInquiries(where);

    return {
      data: inquiries,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findInquiryById(id: string) {
    const inquiry = await this.repository.findInquiryById(id);
    if (!inquiry) throw new NotFoundException('Admission inquiry not found');
    return inquiry;
  }

  async updateInquiry(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.remarks) updateData.remarks = data.remarks;
    if (data.assigned_to) updateData.assignee = { connect: { id: data.assigned_to } };

    return this.repository.updateInquiry(id, updateData);
  }

  async deleteInquiry(id: string) {
    return this.repository.deleteInquiry(id);
  }
}
