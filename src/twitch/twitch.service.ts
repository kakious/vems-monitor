import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import axios from 'axios';

@Injectable()
export class TwitchService {
    baseURL = 'https://api.twitch.tv/helix';
    axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'VEMS/1.0.0 (Virtural Event Management System)',
            },
        });
    }
}
