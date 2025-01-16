import { ConfigService } from '@nestjs/config';

const config = new ConfigService();
export const deploymentConstants = {
  'cconvert-frontend': config.get('CCONVERT_FRONTEND'),
  'cconvert-local': config.get('CCONVERT_LOCAL'),
  port: config.get('PORT'),
};
