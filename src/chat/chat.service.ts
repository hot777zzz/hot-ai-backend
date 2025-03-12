import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(message: string): Promise<ChatResponse> {
    const options = {
      method: 'POST',
      headers: {
        Authorization: this.configService.get<string>('DEER_API_KEY') || '', // 从环境变量获取 API key
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'DeerAPI/1.0.0 (https://api.deerapi.com)',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        stream: false,
      }),
    };

    try {
      const response = await fetch(
        'https://api.deerapi.com/v1/chat/completions',
        options,
      );
      console.log(response);
      const data = (await response.json()) as ChatResponse;
      return data;
    } catch (err) {
      throw new Error('消息发送失败' + err);
    }
  }
}
