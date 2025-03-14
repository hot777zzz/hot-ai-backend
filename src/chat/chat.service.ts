import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatResponse {
  id: string;
  choices: {
    delta?: {
      content?: string;
    };
    message?: {
      role: string;
      content: string;
    };
  }[];
}

@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  async *sendMessage(message: string): AsyncGenerator<ChatResponse> {
    const options = {
      method: 'POST',
      headers: {
        Authorization: this.configService.get<string>('DEER_API_KEY') || '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'DeerAPI/1.0.0 (https://api.deerapi.com)',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
        stream: true,
      }),
    };

    try {
      const response = await fetch(
        'https://api.deerapi.com/v1/chat/completions',
        options,
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as ChatResponse;
            yield parsed;
          } catch (e) {
            console.error('JSON解析错误:', e);
          }
        }
      }
    } catch (err) {
      throw new Error('消息发送失败: ' + err);
    }
  }
}
