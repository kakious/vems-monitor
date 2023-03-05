import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as readline from 'readline';
const BASE_URL = 'https://api.vrchat.cloud/api/1/';
@Injectable()
export class VRChatService {
    logger = new Logger(VRChatService.name);
    vrchat: AxiosInstance;
    constructor(private readonly configService: ConfigService) {
        const useCookies = true;
        const username = this.configService.get('VRCHAT_USERNAME');
        const password = this.configService.get('VRCHAT_PASSWORD');

        if (!useCookies) {
            this.handleLogin(username, password).then((data) => {
                console.log(data);
            });
        } else {
            this.vrchat = axios.create({
                baseURL: BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'VEMS Bot/1.0 (kakious@kakio.us)',
                    Cookie: this.configService.get('VRCHAT_COOKIE'),
                },
            });

            this.vrchat.get('auth/user').then((data) => {
                this.logger.debug(`Logged in as ${data.data.displayName}`);
            });
        }
    }

    async getInstances(worldId: string, instanceId: string) {
        const response = await this.vrchat.get(
            `/instances/${worldId}:${instanceId}`,
        );
        return response.data;
    }

    async handleLogin(username: string, password: string) {
        const httpConfig = {
            auth: {
                username: username,
                password: password,
            },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VEMS Bot/1.0 (kakious@kakio.us)',
            },
        };

        const response = await axios.get(`${BASE_URL}auth/user`, httpConfig);
        // if response contains requiresTwoFactorAuth

        if (response.data.requiresTwoFactorAuth) {
            console.log('2FA required');
            console.log(response.headers['set-cookie']);
            httpConfig.headers['Cookie'] = response.headers['set-cookie'];
            //unset the auth header
            delete httpConfig.auth;
            // request the two factor code from the user

            const secondResponse = await axios.post(
                `${BASE_URL}auth/twofactorauth/emailotp/verify`,
                {
                    code: '144924',
                },
                httpConfig,
            );

            if (secondResponse.data.verified) {
                console.log(secondResponse);
                console.log(response.headers['set-cookie']);
                return secondResponse;
            } else {
                console.log('2FA failed');
                return;
            }
        }
    }
}
