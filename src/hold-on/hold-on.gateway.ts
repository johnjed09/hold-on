import {
  ConnectedSocket,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HoldOnService } from './hold-on.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fe-hold-on.onrender.com',
    ],
  },
})
export class HoldOnGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly holdOnService: HoldOnService) {}

  afterInit() {
    this.holdOnService.time$.subscribe((currentTime) => {
      if (currentTime > 0) {
        this.server.emit('timer', currentTime);
      }
    });

    this.holdOnService.timerStop$.subscribe((isStop) => {
      this.server.emit('stop', isStop);
    });

    this.holdOnService.holdList$.subscribe((holdList) => {
      this.server.emit('holdList', holdList);
      if (holdList.length == 0) {
        this.holdOnService.stop();
      }
    });
  }

  @SubscribeMessage('start')
  handleStart() {
    this.holdOnService.start();
  }

  @SubscribeMessage('stop')
  handleStop() {
    this.holdOnService.stop();
  }

  // TODO: Unit testing
  @SubscribeMessage('someone_hold')
  handleSomeoneHold(@ConnectedSocket() client: Socket) {
    this.holdOnService.someoneHold(client.id);
  }

  // TODO: Unit testing
  @SubscribeMessage('someone_release')
  handleSomeoneRelease(@ConnectedSocket() client: Socket) {
    this.holdOnService.someoneRelease(client.id);
  }
}
