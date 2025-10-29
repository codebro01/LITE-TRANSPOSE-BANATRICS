import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const NeonProvider = {
  provide: 'NEON_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new Pool({
      connectionString: config.get<string>('DATABASE_URL'),
      ssl: {
        rejectUnauthorized: false, // Neon requires SSL
      },
    });
  },
};
