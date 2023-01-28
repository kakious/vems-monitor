import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VRCDNModule } from './vrcdn/vrcdn.module';
import { TwitchModule } from './twitch/twitch.module';
import { TypeOrmConfigService } from './database/database-config.service';
import config from './config/config';
//Configs
import databaseConfig from './config/database.config';
import { VRChatModule } from './vrchat/vrchat.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            load: [databaseConfig, config],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService,
            inject: [ConfigService],
        }),
        PrometheusModule.register({
            defaultMetrics: {
                enabled: false,
            },
        }),
        ScheduleModule.forRoot(),
        VRCDNModule,
        TwitchModule,
        VRChatModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
