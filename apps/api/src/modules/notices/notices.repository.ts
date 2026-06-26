import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NoticesRepository {
  constructor(private prisma: PrismaService) {}

  async createNotice(data: Prisma.NoticeCreateInput) {
    return this.prisma.notice.create({
      data,
      include: { creator: { select: { first_name: true, last_name: true } } }
    });
  }

  async findAllNotices(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NoticeWhereInput;
    orderBy?: Prisma.NoticeOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.notice.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { creator: { select: { first_name: true, last_name: true } } }
    });
  }

  async countNotices(where?: Prisma.NoticeWhereInput) {
    return this.prisma.notice.count({ where });
  }

  async findNoticeById(id: string) {
    return this.prisma.notice.findUnique({
      where: { id },
      include: { creator: { select: { first_name: true, last_name: true } } }
    });
  }

  async updateNotice(id: string, data: Prisma.NoticeUpdateInput) {
    return this.prisma.notice.update({
      where: { id },
      data,
      include: { creator: { select: { first_name: true, last_name: true } } }
    });
  }

  async deleteNotice(id: string) {
    return this.prisma.notice.delete({
      where: { id },
    });
  }
}
