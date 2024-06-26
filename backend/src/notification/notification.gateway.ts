import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DbService } from 'src/db/db.service';
import { NotificationService } from 'src/notification/notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer() io: Server;

  constructor(
    private readonly NotificationService: NotificationService,
    private readonly dbService: DbService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`${client.id} connected`);
    const userId = client.handshake.query.userId;
    if (userId) {
      const { role } = await this.dbService.user.findFirstOrThrow({
        where: { id: +userId },
        select: { role: true },
      });
      if (role === 'admin') {
        client.join(['user', 'permission', 'database', 'record']);
      } else {
        client.join(['database', 'record']);
      }
    } else {
      this.io
        .to(client.id)
        .emit('socket-error', { message: 'User ID not provided' });
    }
  }

  @SubscribeMessage('all-notifications')
  async deliverAllNotifications(client: Socket, userId: number): Promise<void> {
    if (userId) {
      const notifications =
        await this.NotificationService.getAllNotifications(userId);
      this.io.to(client.id).emit('all-notifications', notifications);
    } else {
      this.io
        .to(client.id)
        .emit('socket-error', { message: 'User ID not provided' });
    }
  }

  @SubscribeMessage('new-notification')
  broadcastNewNotifications(client: Socket, payload): void {
    const arg = {
      bodyText: payload.bodyText,
      createdAt: payload.createdAt,
      type: payload.notiType,
      publisherId: +payload.publisherId,
    };
    this.NotificationService.createNotification(arg);

    client.broadcast.to(arg.type).emit('new-notification', payload);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }
}
