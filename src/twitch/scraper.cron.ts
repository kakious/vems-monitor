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

@Injectable()
export class TwitchScraper {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) {}

    private readonly logger = new Logger(TwitchScraper.name);

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
        events.forEach((event) => {
            console.log(event);
        });

        this.logger.debug(
            'Finished Twitch Scraper Job. Took ' +
                (Date.now() - startTimestamp) +
                'ms',
        );
    }
}
