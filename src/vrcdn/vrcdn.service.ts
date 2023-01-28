import { Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import axios from 'axios';
import { vrcdnViewersDTO } from './dto/vrcdnViewers.dto';
@Injectable()
export class VrcdnService {
    private readonly baseURL = 'https://api.vrcdn.live/v1';
    private readonly axiosInstance: AxiosInstance;
    logger = new Logger(VrcdnService.name);

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'VEMS/1.0.0 (Virtual Event Management System)',
            },
        });

        this.logger.debug('VRCDN Service Initialized');
    }

    async getViewers(streamName: string): Promise<vrcdnViewersDTO> {
        const data = await this.axiosInstance
            .get(`/viewers/${streamName}`)
            .catch((err) => {
                this.logger.error(err);
                throw err;
            });
        return data.data;
    }
}
