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

// 流式响应的数据块类型
export interface ChatStreamChunk {
  id: string;
  model: string;
  choices: {
    delta?: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(message: string): Promise<ApiResponse<ChatResponse>> {
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

  async streamMessage(
    message: string,
    onChunk: (chunk: ChatStreamChunk) => void,
  ): Promise<void> {
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
        Accept: 'text/event-stream',
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
      console.log('正在发送流式请求到 DeerAPI...消息内容:', message);
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const parsedData = JSON.parse(data) as ChatStreamChunk;
              onChunk(parsedData);
            } catch (e) {
              console.error('解析响应数据失败:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('流式请求处理错误:', err);
      throw err;
    }
  }
}
