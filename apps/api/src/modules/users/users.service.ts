import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createDto: any, performerId: string) {
    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    
    const user = await this.usersRepository.create({
      first_name: createDto.first_name,
      last_name: createDto.last_name,
      email: createDto.email,
      phone: createDto.phone,
      password_hash: hashedPassword,
      role: { connect: { id: createDto.roleId } }
    });

    await this.usersRepository.createAuditLog({
      action: 'USER_CREATED',
      performer: { connect: { id: performerId } },
      target: { connect: { id: user.id } },
      details: { email: user.email, roleId: createDto.roleId }
    });

    return user;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, search, roleId, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    const users = await this.usersRepository.findAll({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { [sortBy]: sortOrder }
    });

    // We also need total count for pagination
    const total = await this.usersRepository['prisma'].user.count({ where: { ...where, deletedAt: null } });

    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getRoles() {
    return this.usersRepository.getRoles();
  }

  async update(id: string, updateDto: any, performerId: string) {
    const user = await this.usersRepository.update({
      where: { id },
      data: updateDto
    });

    await this.usersRepository.createAuditLog({
      action: 'USER_UPDATED',
      performer: { connect: { id: performerId } },
      target: { connect: { id: user.id } },
      details: updateDto
    });

    return user;
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', performerId: string) {
    const user = await this.usersRepository.update({
      where: { id },
      data: { status }
    });

    await this.usersRepository.createAuditLog({
      action: 'STATUS_CHANGED',
      performer: { connect: { id: performerId } },
      target: { connect: { id: user.id } },
      details: { new_status: status }
    });

    return user;
  }

  async resetPassword(id: string, newPassword: string, performerId: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.usersRepository.update({
      where: { id },
      data: { password_hash: hashedPassword }
    });

    await this.usersRepository.createAuditLog({
      action: 'PASSWORD_RESET',
      performer: { connect: { id: performerId } },
      target: { connect: { id } },
      details: {}
    });

    return { message: 'Password reset successfully' };
  }

  async remove(id: string, performerId: string) {
    if (id === performerId) {
      throw new ForbiddenException('You cannot delete yourself');
    }
    
    await this.usersRepository.delete({ id });
    
    await this.usersRepository.createAuditLog({
      action: 'USER_DELETED',
      performer: { connect: { id: performerId } },
      target: { connect: { id } },
      details: { type: 'SOFT_DELETE' }
    });

    return { message: 'User deleted successfully' };
  }
}
