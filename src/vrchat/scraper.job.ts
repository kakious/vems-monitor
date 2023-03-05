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
import { VRChatService } from './vrchat.service';
import { Gauge } from 'prom-client';

@Injectable()
export class VRChatScraper {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectMetric('vems_vrchat_users')
        private readonly vrchatUsers: Gauge<string>,
        @InjectMetric('vems_vrchat_instances')
        private readonly vrchatInstances: Gauge<string>,
        @InjectMetric('vems_vrchat_users_total')
        private readonly vrchatTotalUsers: Gauge<string>,
        private readonly vrchatService: VRChatService,
    ) { }

    private readonly logger = new Logger(VRChatScraper.name);
    // array of currently running events
    runningEvents: Event[] = [];

    @Interval('vrchat', 45000)
    async handleCron() {
        const startTimestamp = Date.now();
        this.logger.debug('Running VRChat Scraper Job');
        //Check the events db for events that have a vrcdnStreamName and are running
        const events = await this.eventRepository.find({
            where: {
                startTime: LessThanOrEqual(new Date()),
                endTime: MoreThanOrEqual(new Date()),
            },
            relations: ['instances'],
        });

        //For each event, print the event name and vrcdnStreamName
        await events.forEach(async (event) => {
            // return if the event has no instances
            if (!event.instances) return;

            // check if the event is already in the runningEvents array, use the event.id
            if (!this.runningEvents.find((e) => e.eventID === event.eventID)) {
                // if not, add it to the array
                this.runningEvents.push(event);
            }

            let totalUsers = 0;
            let totalInstances = 0;

            // for each instance, get the number of users
            await event.instances.forEach(async (instance) => {
                this.logger.debug(
                    `Event ${event.name} has instance ${instance.instanceID}, now checking users...`,
                );
                totalInstances++;
                const vrchatUsers = await this.vrchatService.getInstances(
                    instance.worldID,
                    instance.instanceID,
                );

                // If the instance is live, set the gauge to the number of users
                if (vrchatUsers) {
                    this.vrchatUsers.set(
                        {
                            eventName: event.name,
                            instanceName: instance.instanceName,
                        },
                        vrchatUsers.n_users,
                    );
                    totalUsers += vrchatUsers.n_users;
                }

                // If the instance is not live, set the gauge to 0
                else {
                    this.vrchatUsers.set(
                        {
                            eventName: event.name,
                            instanceName: instance.instanceName,
                        },
                        0,
                    );
                }

                this.logger.debug(
                    `Event ${event.name} has instance ${instance.instanceName} with ${vrchatUsers.n_users} users`,
                );
            });

            this.vrchatTotalUsers.set({ eventName: event.name }, totalUsers);
            this.vrchatInstances.set({ eventName: event.name }, totalInstances);
        });

        this.logger.debug(
            'Finished VRChat Scraper Job. Took ' +
            (Date.now() - startTimestamp) +
            'ms',
        );
    }
}
