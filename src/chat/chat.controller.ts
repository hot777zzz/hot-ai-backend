import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponse } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() body: { message: string }): Promise<ChatResponse> {
    return this.chatService.sendMessage(body.message);
  }
}
