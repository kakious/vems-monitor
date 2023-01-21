import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import axios from 'axios';
import { vrcdnViewersDTO } from './dto/vrcdnViewers.dto';
@Injectable()
export class VrcdnService {
    baseURL = 'https://api.vrcdn.live/v1';
    axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'VEMS/1.0.0 (Virtural Event Management System)',
            },
        });
    }

    async getViewers(streamName: string): Promise<vrcdnViewersDTO> {
        const { data } = await this.axiosInstance.get(`/viewers/${streamName}`);
        return data;
    }
}
