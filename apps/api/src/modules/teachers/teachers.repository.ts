import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeachersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TeacherCreateInput) {
    return this.prisma.teacher.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TeacherWhereInput;
    orderBy?: Prisma.TeacherOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.teacher.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { subjects: { include: { subject: true } }, classes: { include: { class: true } }, user: true }
    });
  }

  async findById(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: { subjects: { include: { subject: true } }, classes: { include: { class: true } }, user: true }
    });
  }

  async update(params: {
    where: Prisma.TeacherWhereUniqueInput;
    data: Prisma.TeacherUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.teacher.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.TeacherWhereUniqueInput) {
    return this.prisma.teacher.delete({
      where,
    });
  }
}
