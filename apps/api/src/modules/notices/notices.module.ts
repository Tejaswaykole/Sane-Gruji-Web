import { Module } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { NoticesRepository } from './notices.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NoticesController],
  providers: [NoticesService, NoticesRepository],
  exports: [NoticesService],
})
export class NoticesModule {}
