import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body() body: { message: string },
    @Res() response: Response & { flush: () => void },
  ) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    try {
      for await (const chunk of this.chatService.sendMessage(body.message)) {
        response.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      response.write('data: [DONE]\n\n');
    } catch (error: unknown) {
      if (error instanceof Error) {
        response.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      } else {
        response.write(`data: ${JSON.stringify({ error: '未知错误' })}\n\n`);
      }
    } finally {
      response.end();
    }
  }
}
