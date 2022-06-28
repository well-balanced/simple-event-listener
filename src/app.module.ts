import { Module } from '@nestjs/common';
import { EventModule } from 'event/event.module';
import { ReviewModule } from 'review/review.module';
import { UserModule } from 'user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ReviewModule, EventModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
