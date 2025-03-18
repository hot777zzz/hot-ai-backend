import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('use')
  async sendMessage(@Body('message') message: string) {
    if (!message) {
      throw new HttpException('消息不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.chatService.sendMessage(message);
    return result;
  }
}
