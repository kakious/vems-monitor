import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';

import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { VRChatService } from './vrchat.service';
import { VRChatScraper } from './scraper.job';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [],
    providers: [
        VRChatService,
        VRChatScraper,
        makeGaugeProvider({
            name: 'vems_vrchat_users',
            help: 'Number of users in a VRChat instance',
            labelNames: ['instanceName', 'eventName'],
        }),
        makeGaugeProvider({
            name: 'vems_vrchat_instances',
            help: 'Number of VRChat instances',
            labelNames: ['eventName'],
        }),
        makeGaugeProvider({
            name: 'vems_vrchat_users_total',
            help: 'Total number of users in all VRChat instances',
            labelNames: ['eventName'],
        }),
    ],
})
export class VRChatModule {}
