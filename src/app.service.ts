import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): object {
        return {
            service: 'VEMS Monitoring Service',
            version: '1.0.0',
        };
    }
}
