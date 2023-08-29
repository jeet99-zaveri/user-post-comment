import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('send_notification')
  sendNotification(
    @Payload() payload: string,
    @Ctx() context: RmqContext,
  ): void {
    const {
      properties: { headers },
    } = context.getMessage();

    console.log(
      'SEND NOTIFICATION CALLED USING RMQ :: ',
      payload,
      headers['x-version'] === '1.0.0' ? '🐱' : '🐈',
    );
  }
}
