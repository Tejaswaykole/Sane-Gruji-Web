import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HomeworkRepository } from './homework.repository';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class HomeworkService {
  private supabase;

  constructor(private readonly repository: HomeworkRepository) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }

  async create(createDto: any, teacherId: string) {
    return this.repository.create({
      title: createDto.title,
      description: createDto.description,
      due_date: new Date(createDto.due_date),
      status: createDto.status || 'DRAFT',
      class: { connect: { id: createDto.class_id } },
      subject: { connect: { id: createDto.subject_id } },
      teacher: { connect: { id: teacherId } }
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, search, status, classId, teacherId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (status) where.status = status;
    if (classId) where.class_id = classId;
    if (teacherId) where.teacher_id = teacherId;

    const homeworks = await this.repository.findAll({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await this.repository.count(where);

    return {
      data: homeworks,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const hw = await this.repository.findById(id);
    if (!hw) throw new NotFoundException('Homework not found');
    return hw;
  }

  async update(id: string, updateDto: any) {
    const data: any = {};
    if (updateDto.title) data.title = updateDto.title;
    if (updateDto.description) data.description = updateDto.description;
    if (updateDto.due_date) data.due_date = new Date(updateDto.due_date);
    if (updateDto.status) data.status = updateDto.status;
    if (updateDto.class_id) data.class = { connect: { id: updateDto.class_id } };
    if (updateDto.subject_id) data.subject = { connect: { id: updateDto.subject_id } };

    return this.repository.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.repository.delete({ id });
  }

  async uploadAttachment(id: string, file: Express.Multer.File) {
    const fileName = `${id}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await this.supabase.storage
      .from('homework-files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload attachment: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('homework-files')
      .getPublicUrl(fileName);

    return this.repository.update({
      where: { id },
      data: { attachment_url: publicUrlData.publicUrl }
    });
  }
}
