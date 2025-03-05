import { Injectable, UnauthorizedException } from '@nestjs/common';

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
  async sendMessage(message: string): Promise<ChatResponse> {
    const options = {
      method: 'POST',
      headers: {
        Authorization: process.env.DEEPSEEK_API_KEY || '', // 从环境变量获取 API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: message }],
        stream: false,
        max_tokens: 512,
        stop: null,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
      }),
    };

    try {
      const response = await fetch(
        'https://api.siliconflow.cn/v1/chat/completions',
        options,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 响应错误:', errorText);
        throw new Error('API 调用失败');
      }

      const data = await response.json();
      console.log('API 响应成功:', data);
      return data as ChatResponse;
    } catch (err) {
      console.error('发送消息失败:', err);
      throw new Error('消息发送失败' + err);
    }
  }
}
