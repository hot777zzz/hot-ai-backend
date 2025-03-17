import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body('message') message: string,
    @Res() response: Response & { flush: () => void },
  ) {
    if (!message) {
      response.write(`data: ${JSON.stringify({ error: '消息不能为空' })}\n\n`);
      response.end();
      return;
    }

    console.log('收到请求:', message);

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    try {
      for await (const chunk of this.chatService.sendMessage(message)) {
        response.write(`data: ${JSON.stringify(chunk)}\n\n`);
        response.flush();
      }
      response.write('data: [DONE]\n\n');
    } catch (error: unknown) {
      console.error('处理请求时出错:', error);
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
