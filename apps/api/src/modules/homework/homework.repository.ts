import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomeworkRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.HomeworkCreateInput) {
    return this.prisma.homework.create({
      data,
      include: { class: true, subject: true, teacher: true }
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HomeworkWhereInput;
    orderBy?: Prisma.HomeworkOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.homework.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { class: true, subject: true, teacher: true }
    });
  }

  async count(where?: Prisma.HomeworkWhereInput) {
    return this.prisma.homework.count({ where });
  }

  async findById(id: string) {
    return this.prisma.homework.findUnique({
      where: { id },
      include: { class: true, subject: true, teacher: true }
    });
  }

  async update(params: {
    where: Prisma.HomeworkWhereUniqueInput;
    data: Prisma.HomeworkUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.homework.update({
      data,
      where,
      include: { class: true, subject: true, teacher: true }
    });
  }

  async delete(where: Prisma.HomeworkWhereUniqueInput) {
    return this.prisma.homework.delete({
      where,
    });
  }
}
