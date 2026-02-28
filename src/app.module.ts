import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HoldOnGateway } from './hold-on/hold-on.gateway';
import { HoldOnService } from './hold-on/hold-on.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, HoldOnService, HoldOnGateway],
})
export class AppModule {}
