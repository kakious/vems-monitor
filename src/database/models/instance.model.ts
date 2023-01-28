import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Event } from './event.model';
@Entity()
export class Instance {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Event, (event) => event.instances)
    event: Event;

    @Column()
    instanceName: string;

    @Column()
    worldID: string;

    @Column()
    instanceID: string;

    @Column()
    lastScraped: Date;
}
