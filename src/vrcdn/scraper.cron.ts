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

    readonly regions = ['au', 'br', 'eu', 'jp', 'na'];
    runningEvents: Event[] = [];

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
            // check if the event is already in the runningEvents array, use the event.id
            if (!this.runningEvents.find((e) => e.eventID === event.eventID)) {
                // if not, add it to the array
                this.runningEvents.push(event);
            }

            this.logger.debug(
                `Event ${event.name} has stream ${event.vrcdnStreamName}, now checking viewers...`,
            );

            //Check the vrcdn api for the number of viewers
            this.vrcdnService.getViewers(event.vrcdnStreamName).then((data) => {
                // for each region, set the gauge to the number of viewers
                let totalViewers = 0;
                // track what regions we have data for, so we can set the total to 0 for any regions we don't have data for
                const regionsWithData = [];
                data.viewers.forEach((region) => {
                    regionsWithData.push(region.region);
                    this.vrcdnViewersGauge.set(
                        {
                            eventName: event.name,
                            streamName: event.vrcdnStreamName,
                            region: region.region,
                        },
                        region.total,
                    );
                    totalViewers += region.total;
                });

                // set the total to 0 for any regions we don't have data for
                this.regions.forEach((region) => {
                    if (!regionsWithData.includes(region)) {
                        this.vrcdnViewersGauge.set(
                            {
                                eventName: event.name,
                                streamName: event.vrcdnStreamName,
                                region: region,
                            },
                            0,
                        );
                    }
                });

                this.vrcdnViewersGauge.set(
                    {
                        eventName: event.name,
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

        // Check if any event ids are in the runningEvents array that are not in the events array
        // If so, remove them from the runningEvents array and set the gauge to 0 for all regions
        this.runningEvents.forEach((event) => {
            if (!events.find((e) => e.eventID === event.eventID)) {
                this.regions.forEach((region) => {
                    this.vrcdnViewersGauge.set(
                        {
                            eventName: event.name,
                            streamName: event.vrcdnStreamName,
                            region: region,
                        },
                        0,
                    );
                });
                this.vrcdnViewersGauge.set(
                    {
                        eventName: event.name,
                        streamName: event.vrcdnStreamName,
                        region: 'total',
                    },
                    0,
                );
                this.runningEvents = this.runningEvents.filter(
                    (e) => e.eventID !== event.eventID,
                );
            }
        });

        this.logger.debug(
            'Finished VRCDN Scraper Job. Took ' +
                (Date.now() - startTimestamp) +
                'ms',
        );
    }
}
