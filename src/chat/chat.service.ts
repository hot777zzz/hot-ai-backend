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

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('开始读取响应流...');
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('响应流读取完成');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') {
            console.log('收到结束标记');
            return;
          }

          try {
            const parsed = JSON.parse(data) as ChatResponse;
            console.log('解析到响应:', parsed.choices[0]?.delta?.content);
            yield parsed;
          } catch (e) {
            console.error('JSON解析错误:', e, '原始数据:', data);
            throw e;
          }
        }
      }
    } catch (err) {
      console.error('请求处理错误:', err);
      throw err;
    }
  }
}
