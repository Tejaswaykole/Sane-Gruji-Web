import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeachersRepository } from './teachers.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeachersController],
  providers: [TeachersService, TeachersRepository],
  exports: [TeachersService],
})
export class TeachersModule {}
