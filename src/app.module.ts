import { Module } from '@nestjs/common';
import { EventModule } from 'event/event.module';
import { ReviewModule } from 'review/review.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ReviewModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
