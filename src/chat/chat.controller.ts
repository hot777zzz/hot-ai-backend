import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Get,
  Query,
  Headers,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';
import { ChatResponse, ChatStreamChunk, ApiResponse } from './chat.service';
import { Public } from '../user/constant';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('use')
  async sendMessage(
    @Body('message') message: string,
  ): Promise<ApiResponse<ChatResponse>> {
    if (!message) {
      throw new HttpException('消息不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.chatService.sendMessage(message);
    return result;
  }

  @Public()
  @Get('stream')
  async streamMessageGet(
    @Query('message') message: string,
    @Query('token') token: string,
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!message) {
      throw new HttpException('消息不能为空', HttpStatus.BAD_REQUEST);
    }

    // 验证身份认证
    if (!this.validateAuth(token, authHeader)) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        code: HttpStatus.UNAUTHORIZED,
        message: '未授权',
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await this.chatService.streamMessage(
        message,
        (chunk: ChatStreamChunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }

  @Post('stream')
  async streamMessagePost(
    @Body('message') message: string,
    @Body('token') bodyToken: string,
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!message) {
      throw new HttpException('消息不能为空', HttpStatus.BAD_REQUEST);
    }

    // 验证身份认证
    if (!this.validateAuth(bodyToken, authHeader)) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        code: HttpStatus.UNAUTHORIZED,
        message: '未授权',
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await this.chatService.streamMessage(
        message,
        (chunk: ChatStreamChunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }

  // 验证token或Authorization header
  private validateAuth(token?: string, authHeader?: string): boolean {
    if (token) {
      // 验证URL中的token参数
      return true; // 简化示例，实际应用中需要验证token有效性
    } else if (authHeader) {
      // 验证Authorization header
      const bearerToken = authHeader.split(' ')[1];
      return !!bearerToken; // 简化示例，实际应用中需要验证token有效性
    }
    return false;
  }
}
