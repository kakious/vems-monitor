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
import { TwitchService } from './twitch.service';
import { Gauge } from 'prom-client';

@Injectable()
export class TwitchScraper {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectMetric('vems_twitch_viewers')
        private readonly twitchViewersGauge: Gauge<string>,
        private readonly twitchService: TwitchService,
    ) {}

    private readonly logger = new Logger(TwitchScraper.name);
    // array of currently running events
    runningEvents: Event[] = [];

    @Interval('twitch', 60000)
    async handleCron() {
        const startTimestamp = Date.now();
        this.logger.debug('Running Twitch Scraper Job');
        //Check the events db for events that have a vrcdnStreamName and are running
        const events = await this.eventRepository.find({
            where: {
                twitchStreamName: Not(IsNull()),
                startTime: LessThanOrEqual(new Date()),
                endTime: MoreThanOrEqual(new Date()),
            },
        });

        //For each event, print the event name and vrcdnStreamName
        events.forEach(async (event) => {
            // check if the event is already in the runningEvents array
            if (!this.runningEvents.find((e) => e.eventID === event.eventID)) {
                // if not, add it to the array
                this.runningEvents.push(event);
            }

            this.logger.debug(
                `Event ${event.name} has stream ${event.twitchStreamName}, now checking viewers...`,
            );
            const twitchStream = await this.twitchService.getStream(
                event.twitchStreamName,
            );

            // If the stream is live, set the gauge to the number of viewers
            if (twitchStream) {
                this.twitchViewersGauge.set(
                    {
                        streamName: event.twitchStreamName,
                        eventName: event.name,
                    },
                    twitchStream.viewer_count,
                );

                this.logger.debug(
                    `Event ${event.name} has ${twitchStream.viewer_count} viewers`,
                );
            } else {
                // If the stream is not live, set the gauge to 0
                this.twitchViewersGauge.set(
                    {
                        streamName: event.twitchStreamName,
                        eventName: event.name,
                    },
                    0,
                );
                this.logger.debug(`Event ${event.name} is not live`);
            }
        });

        // Check if any event ids are in the runningEvents array that are not in the events array
        // If so, remove them from the runningEvents array and set the gauge to 0
        this.runningEvents.forEach((event) => {
            if (!events.find((e) => e.eventID === event.eventID)) {
                this.logger.debug(
                    `Event ${event.name} is no longer running, setting viewers to 0`,
                );
                this.twitchViewersGauge.set(
                    {
                        streamName: event.twitchStreamName,
                        eventName: event.name,
                    },
                    0,
                );
                this.runningEvents = this.runningEvents.filter(
                    (e) => e.eventID !== event.eventID,
                );
            }
        });

        this.logger.debug(
            'Finished Twitch Scraper Job. Took ' +
                (Date.now() - startTimestamp) +
                'ms',
        );
    }
}
