import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { FeesRepository } from './fees.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeesController],
  providers: [FeesService, FeesRepository],
  exports: [FeesService],
})
export class FeesModule {}
