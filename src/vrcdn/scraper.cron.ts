import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../database/models/event.model';
import {
    IsNull,
    LessThanOrEqual,
    MoreThanOrEqual,
    Not,
    Repository,
} from 'typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { VrcdnService } from './vrcdn.service';

@Injectable()
export class VRCDNScraper {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectMetric('vems_vrcdn_viewers')
        private readonly vrcdnViewersGauge: Gauge<string>,
        private readonly vrcdnService: VrcdnService,
    ) {}

    private readonly logger = new Logger(VRCDNScraper.name);

    @Interval('vrcdn', 15000)
    async handleCron() {
        const startTimestamp = Date.now();
        this.logger.debug('Running VRCDN Scraper Job');
        //Check the events db for events that have a vrcdnStreamName and are running
        const events = await this.eventRepository.find({
            where: {
                vrcdnStreamName: Not(IsNull()),
                startTime: LessThanOrEqual(new Date()),
                endTime: MoreThanOrEqual(new Date()),
            },
        });

        //For each event, print the event name and vrcdnStreamName
        events.forEach((event) => {
            this.logger.debug(
                `Event ${event.name} has stream ${event.vrcdnStreamName}, now checking viewers...`,
            );

            //Check the vrcdn api for the number of viewers
            this.vrcdnService.getViewers(event.vrcdnStreamName).then((data) => {
                // for each region, set the gauge to the number of viewers
                let totalViewers = 0;
                data.viewers.forEach((region) => {
                    this.vrcdnViewersGauge.set(
                        {
                            streamName: event.vrcdnStreamName,
                            region: region.region,
                        },
                        region.total,
                    );
                    totalViewers += region.total;
                });
                this.vrcdnViewersGauge.set(
                    {
                        streamName: event.vrcdnStreamName,
                        region: 'total',
                    },
                    totalViewers,
                );

                this.logger.debug(
                    `Event ${event.name} has ${totalViewers} viewers`,
                );
            });
        });

        this.logger.debug(
            'Finished VRCDN Scraper Job. Took ' +
                (Date.now() - startTimestamp) +
                'ms',
        );
    }
}
