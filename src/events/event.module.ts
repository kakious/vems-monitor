import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from '../database/models/instance.model';
import { Event } from '../database/models/event.model';
import { EventController } from './event.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Instance])],
    controllers: [EventController],
    providers: [],
})
export class EventModule {}
