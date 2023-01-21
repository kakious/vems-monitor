import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';
import { TwitchService } from './twitch.service';
import { TwitchScraper } from './scraper.cron';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [],
    providers: [TwitchService, TwitchScraper],
})
export class TwitchModule {}
