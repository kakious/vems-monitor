import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
    TypeOrmModuleOptions,
    TypeOrmOptionsFactory,
} from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            ...this.configService.getOrThrow<TypeOrmModuleOptions>('database', {
                infer: true,
            }),
            migrations: [],
        };
    }
}
