import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [DbModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
