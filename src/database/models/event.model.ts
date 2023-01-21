import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Instance } from './instance.model';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    eventID: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column()
    vrcdnStreamName?: string;

    @Column()
    twitchStreamName?: string;

    @OneToMany(() => Instance, (instance) => instance.event)
    instances: Instance[];
}
