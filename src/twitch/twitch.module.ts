import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';
import { TwitchService } from './twitch.service';
import { TwitchScraper } from './scraper.cron';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [],
    providers: [
        TwitchService,
        TwitchScraper,
        makeGaugeProvider({
            name: 'vems_twitch_viewers',
            help: 'Number of viewers on a Twitch stream',
            labelNames: ['streamName', 'eventName'],
        }),
    ],
})
export class TwitchModule {}
