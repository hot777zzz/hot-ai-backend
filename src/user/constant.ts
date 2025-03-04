export const jwtConstants = {
  secret: 'your-secret-key', // 建议使用环境变量存储
  expiresIn: '24h',
};

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
