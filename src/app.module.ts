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

//Configs
import databaseConfig from './config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService,
            inject: [ConfigService],
        }),
        PrometheusModule.register(),
        ScheduleModule.forRoot(),
        VRCDNModule,
        TwitchModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
