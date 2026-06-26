import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController, MarksController } from './exams.controller';
import { ExamsRepository } from './exams.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController, MarksController],
  providers: [ExamsService, ExamsRepository],
  exports: [ExamsService],
})
export class ExamsModule {}
