import { Injectable, NotFoundException } from '@nestjs/common';
import { TeachersRepository } from './teachers.repository';

@Injectable()
export class TeachersService {
  constructor(private readonly repository: TeachersRepository) {}

  async create(createDto: any) {
    return this.repository.create({
      ...createDto,
      dob: new Date(createDto.dob),
      joining_date: new Date(createDto.joining_date)
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { employee_id: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const teachers = await this.repository.findAll({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await this.repository['prisma'].teacher.count({ where });

    return {
      data: teachers,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const teacher = await this.repository.findById(id);
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async update(id: string, updateDto: any) {
    const data = { ...updateDto };
    if (data.dob) data.dob = new Date(data.dob);
    if (data.joining_date) data.joining_date = new Date(data.joining_date);

    return this.repository.update({
      where: { id },
      data
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'RESIGNED') {
    return this.repository.update({
      where: { id },
      data: { status }
    });
  }

  async remove(id: string) {
    return this.repository.delete({ id });
  }
}
