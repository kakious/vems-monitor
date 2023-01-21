import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';
import { VrcdnService } from './vrcdn.service';
import { VRCDNScraper } from './scraper.cron';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [],
    providers: [VrcdnService, VRCDNScraper],
})
export class VRCDNModule {}
