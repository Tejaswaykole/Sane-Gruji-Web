import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeesRepository {
  constructor(private prisma: PrismaService) {}

  async createFee(data: Prisma.FeeCreateInput) {
    return this.prisma.fee.create({
      data,
    });
  }

  async findAllFees(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FeeWhereInput;
    orderBy?: Prisma.FeeOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.fee.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { 
        student: { 
          select: { id: true, first_name: true, last_name: true, admission_no: true, class: { select: { class_name: true, section: true } } } 
        } 
      }
    });
  }

  async countFees(where?: Prisma.FeeWhereInput) {
    return this.prisma.fee.count({ where });
  }

  async findFeeById(id: string) {
    return this.prisma.fee.findUnique({
      where: { id },
      include: { 
        student: { 
          select: { id: true, first_name: true, last_name: true, admission_no: true, class: { select: { class_name: true, section: true } } } 
        } 
      }
    });
  }

  async updateFee(id: string, data: Prisma.FeeUpdateInput) {
    return this.prisma.fee.update({
      where: { id },
      data,
    });
  }

  async deleteFee(id: string) {
    return this.prisma.fee.delete({
      where: { id },
    });
  }
}
