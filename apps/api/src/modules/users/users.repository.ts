import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data, include: { role: true } });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where: { ...where, deletedAt: null }, // Hide soft-deleted
      orderBy,
      include: { role: true }
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { 
        role: true,
        auditLogsTargeted: {
          include: { performer: { select: { first_name: true, last_name: true } } },
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }

  async getRoles() {
    return this.prisma.role.findMany();
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
      include: { role: true }
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    // Soft delete
    return this.prisma.user.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async createAuditLog(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({ data });
  }
}
