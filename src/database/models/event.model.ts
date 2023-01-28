import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Instance } from './instance.model';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    eventID: string;

    @Column()
    name: string;

    @Column({
        nullable: true,
        type: 'text',
    })
    description: string;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column({
        nullable: true,
    })
    vrcdnStreamName?: string;

    @Column({
        nullable: true,
    })
    twitchStreamName?: string;

    @OneToMany(() => Instance, (instance) => instance.event)
    instances: Instance[];
}
