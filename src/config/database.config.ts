import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', () => {
    const conf: TypeOrmModuleOptions = {
        type: 'mysql',
        autoLoadEntities: true,
        host: process.env['DATABASE_HOST'] || '',
        port: parseInt(process.env['DATABASE_PORT'] || ''),
        username: process.env['DATABASE_USER'] || '',
        password: process.env['DATABASE_PASSWORD'] || '',
        database: process.env['DATABASE_NAME'] || '',
        logging: process.env['DATABASE_LOGGING'] === 'true',
        migrationsRun: process.env['DATABASE_MIGRATIONS_RUN'] === 'true',
        synchronize:
            process.env['DEV_OVERRIDE_DATABASE_SYNCHRONIZE'] === 'true',
    };
    return conf;
});
