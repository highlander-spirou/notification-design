import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';

@Injectable()
export class UserDbService {
  constructor(private readonly dbService: DbService) {}

  async getUserById(id: number) {
    return this.dbService.users.findUnique({ where: { id } });
  }

}
