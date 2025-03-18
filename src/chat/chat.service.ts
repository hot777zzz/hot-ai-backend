import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatResponse {
  id: string;
  choices: {
    message?: {
      role: string;
      content: string;
    };
  }[];
}

@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(message: string): Promise<any> {
    if (!message) {
      throw new Error('消息不能为空');
    }

    const apiKey = this.configService.get<string>('DEER_API_KEY');
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
      }),
    };

    try {
      console.log('正在发送请求到 DeerAPI...消息内容:', message);
      const response = await fetch(
        'https://api.deerapi.com/v1/chat/completions',
        options,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API 请求失败: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = (await response.json()) as ChatResponse;
      console.log('收到API响应:', result);

      return {
        code: 200,
        message: '请求成功',
        data: result,
      };
    } catch (err) {
      console.error('请求处理错误:', err);
      throw err;
    }
  }
}
