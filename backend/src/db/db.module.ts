import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { UserDbService } from './dbUser.service';

@Module({
  providers: [DbService, UserDbService],
  exports: [DbService, UserDbService], // Export the service to use it in other modules
})
export class DbModule {}
