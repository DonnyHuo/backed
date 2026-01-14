import { Module } from '@nestjs/common';
import { CoverService } from './cover.service';

@Module({
  providers: [CoverService],
  exports: [CoverService],
})
export class CoverModule {}
