import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdmissionsRepository {
  constructor(private prisma: PrismaService) {}

  async createInquiry(data: Prisma.AdmissionInquiryCreateInput) {
    return this.prisma.admissionInquiry.create({
      data,
    });
  }

  async findAllInquiries(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AdmissionInquiryWhereInput;
    orderBy?: Prisma.AdmissionInquiryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.admissionInquiry.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { assignee: { select: { first_name: true, last_name: true } } }
    });
  }

  async countInquiries(where?: Prisma.AdmissionInquiryWhereInput) {
    return this.prisma.admissionInquiry.count({ where });
  }

  async findInquiryById(id: string) {
    return this.prisma.admissionInquiry.findUnique({
      where: { id },
      include: { assignee: { select: { first_name: true, last_name: true } } }
    });
  }

  async updateInquiry(id: string, data: Prisma.AdmissionInquiryUpdateInput) {
    return this.prisma.admissionInquiry.update({
      where: { id },
      data,
      include: { assignee: { select: { first_name: true, last_name: true } } }
    });
  }

  async deleteInquiry(id: string) {
    return this.prisma.admissionInquiry.delete({
      where: { id },
    });
  }
}
