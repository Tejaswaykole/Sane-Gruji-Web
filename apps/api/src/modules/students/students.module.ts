import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, PrismaService],
  exports: [StudentsService],
})
export class StudentsModule {}
