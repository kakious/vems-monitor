import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, AuthenticationApi, InstancesApi } from 'vrchat';
@Injectable()
export class VRChatService {
    private readonly authApi: AuthenticationApi;
    private readonly instancesApi: InstancesApi;
    logger = new Logger(VRChatService.name);
    constructor(private readonly configService: ConfigService) {
        const configuration = new Configuration({
            username: this.configService.get('vrchat.username'),
            password: this.configService.get('vrchat.password'),
        });

        this.authApi = new AuthenticationApi(configuration);
        this.instancesApi = new InstancesApi(configuration);
        this.authApi.getCurrentUser().then((resp) => {
            const currentUser = resp.data;
            this.logger.debug(`Logged in as ${currentUser.displayName}`);
        });
    }

    async getInstances(worldId: string, instanceId: string) {
        const response = await this.instancesApi.getInstance(
            worldId,
            instanceId,
        );
        return response.data;
    }
}
