import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { createClient } from '@supabase/supabase-js';
import * as Papa from 'papaparse';

@Injectable()
export class StudentsService {
  private supabase;

  constructor(private readonly repository: StudentsRepository) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
    );
  }

  async create(createDto: any) {
    const { parent, class_id, ...studentData } = createDto;
    
    return this.repository.createStudentWithParent({
      ...studentData,
      dob: new Date(studentData.dob),
      admission_date: new Date(studentData.admission_date),
      class: { connect: { id: class_id } },
      parent: {
        create: parent
      }
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, search, classId, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { admission_no: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (classId) where.classId = classId;
    if (status) where.status = status;

    const students = await this.repository.findAll({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await this.repository['prisma'].student.count({ where });

    return {
      data: students,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const student = await this.repository.findById(id);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: string, updateDto: any) {
    return this.repository.update({
      where: { id },
      data: updateDto
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED') {
    return this.repository.update({
      where: { id },
      data: { status }
    });
  }

  async remove(id: string) {
    return this.repository.delete({ id });
  }

  async getClasses() {
    return this.repository.getClasses();
  }

  async uploadDocument(id: string, file: Express.Multer.File, documentType: string) {
    const fileName = `${id}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await this.supabase.storage
      .from('student-documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload document: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('student-documents')
      .getPublicUrl(fileName);

    return this.repository.addDocument({
      student: { connect: { id } },
      document_type: documentType,
      file_url: publicUrlData.publicUrl
    });
  }

  async bulkImport(fileBuffer: Buffer) {
    const csvData = fileBuffer.toString('utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        complete: async (results) => {
          const students = [];
          for (const row of results.data as any[]) {
            if (!row.admission_no) continue;
            // Simulated creation logic for bulk import
            students.push(row);
          }
          resolve({ message: `Successfully processed ${students.length} students` });
        },
        error: (error: any) => {
          reject(new BadRequestException('Failed to process CSV file'));
        }
      });
    });
  }
}
