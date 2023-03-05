import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import axios from 'axios';

@Injectable()
export class TwitchService {
    baseURL = 'https://api.twitch.tv/helix';
    axiosInstance: AxiosInstance;

    logger = new Logger(TwitchService.name);
    constructor(private readonly configService: ConfigService) {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'VEMS/1.0.0 (Virtual Event Management System)',
                'Client-ID': this.configService.get('twitch.clientId'),
                Authorization: `Bearer ${this.configService.get(
                    'twitch.bearer',
                )}`,
            },
        });

        this.logger.debug('Twitch Service Initialized');
    }

    async getStream(streamName: string) {
        const response = await this.axiosInstance
            .get(`streams?user_login=${streamName}`)
            .catch((err) => {
                this.logger.error(err);
                throw err;
            });
        const resp = response.data.data[0];
        // if the stream is live, return the stream object, otherwise return null
        return resp ? resp : null;
    }
}
