import { Injectable, NotFoundException } from '@nestjs/common';
import { NoticesRepository } from './notices.repository';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class NoticesService {
  private supabase;

  constructor(private readonly repository: NoticesRepository) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
  }

  async createNotice(data: any, userId: string) {
    return this.repository.createNotice({
      title: data.title,
      content: data.content,
      category: data.category,
      target_roles: data.target_roles || [],
      target_classes: data.target_classes || [],
      publish_date: data.publish_date ? new Date(data.publish_date) : null,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      status: data.status || 'DRAFT',
      creator: { connect: { id: userId } }
    });
  }

  async uploadAttachment(noticeId: string, file: Express.Multer.File) {
    const notice = await this.repository.findNoticeById(noticeId);
    if (!notice) throw new NotFoundException('Notice not found');

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${noticeId}-${Date.now()}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from('notice-files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('notice-files')
      .getPublicUrl(fileName);

    return this.repository.updateNotice(noticeId, {
      attachment_url: publicUrlData.publicUrl
    });
  }

  async findAllNotices(query: any = {}, user: any) {
    const { page = 1, limit = 10, search, category, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (category) where.category = category;
    if (status) where.status = status;

    // Role-based visibility
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'PRINCIPAL' && user.role !== 'ADMISSION_OFFICER') {
      where.status = 'PUBLISHED';
      
      const roleFilters = [];
      // Role match or EVERYONE
      roleFilters.push({ target_roles: { hasSome: [user.role, 'EVERYONE'] } });
      
      // If student or parent, also check target_classes if available in context
      // For MVP, we'll allow seeing if role matches or if target_classes is empty (meaning all classes)
      // We assume `target_roles` check is sufficient for general visibility.
      
      where.AND = [
        {
          OR: roleFilters
        }
      ];
    }

    const notices = await this.repository.findAllNotices({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { publish_date: 'desc' }
    });

    const total = await this.repository.countNotices(where);

    return {
      data: notices,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findNoticeById(id: string) {
    const notice = await this.repository.findNoticeById(id);
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async updateNotice(id: string, data: any) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.category) updateData.category = data.category;
    if (data.target_roles) updateData.target_roles = data.target_roles;
    if (data.target_classes) updateData.target_classes = data.target_classes;
    if (data.publish_date) updateData.publish_date = new Date(data.publish_date);
    if (data.expiry_date) updateData.expiry_date = new Date(data.expiry_date);
    if (data.status) updateData.status = data.status;

    return this.repository.updateNotice(id, updateData);
  }

  async deleteNotice(id: string) {
    return this.repository.deleteNotice(id);
  }
}
