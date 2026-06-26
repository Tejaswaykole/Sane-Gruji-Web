import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Student, Parent, Class, StudentDocument } from '@prisma/client';

@Injectable()
export class StudentsRepository {
  constructor(private prisma: PrismaService) {}

  async createStudentWithParent(data: Prisma.StudentCreateInput) {
    return this.prisma.student.create({
      data,
      include: { class: true, parent: true }
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StudentWhereUniqueInput;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.student.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { class: true, parent: true }
    });
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { class: true, parent: true, documents: true }
    });
  }

  async update(params: {
    where: Prisma.StudentWhereUniqueInput;
    data: Prisma.StudentUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.student.update({
      data,
      where,
      include: { class: true, parent: true }
    });
  }

  async delete(where: Prisma.StudentWhereUniqueInput) {
    return this.prisma.student.delete({
      where,
    });
  }

  async addDocument(data: Prisma.StudentDocumentCreateInput) {
    return this.prisma.studentDocument.create({ data });
  }

  async getClasses() {
    return this.prisma.class.findMany({
      orderBy: [{ class_name: 'asc' }, { section: 'asc' }]
    });
  }
}
