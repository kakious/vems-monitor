import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';
import { VrcdnService } from './vrcdn.service';
import { VRCDNScraper } from './scraper.cron';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [],
    providers: [
        VrcdnService,
        VRCDNScraper,
        makeGaugeProvider({
            name: 'vems_vrcdn_viewers',
            help: 'Number of viewers on a VRCDN stream',
            labelNames: ['streamName', 'region', 'eventName'],
        }),
    ],
})
export class VRCDNModule {}
