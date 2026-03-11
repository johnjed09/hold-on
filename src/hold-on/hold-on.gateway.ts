import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { HoldOnService } from './hold-on.service';

@WebSocketGateway({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
})
export class HoldOnGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly holdOnService: HoldOnService) {}

  afterInit() {
    this.holdOnService.time$.subscribe((currentTime) => {
      this.server.emit('timer', currentTime);
    });

    this.holdOnService.timerStop$.subscribe((isStop) => {
      if (isStop) {
        this.server.emit('stop', 'Timer stopped!');
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
}
