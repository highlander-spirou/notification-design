import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class NotificationService {
  constructor(private readonly dbService: DbService) {}

  async getAllNotifications(userId: number) {
    const data = await this.dbService.notification.findMany({
      take: 20,
      orderBy: [{ createdAt: 'desc' }],
      where: { NOT: { publisherId: userId } },
    });
    return data.map((x) => ({
      bodyText: x.bodyText,
      createdAt: x.createdAt,
      notiType: x.type,
    }));
  }

  async createNotification(arg) {
    await this.dbService.notification.create({
      data: arg,
    });
  }
}
