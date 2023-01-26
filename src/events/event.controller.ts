import { Controller } from '@nestjs/common';

@Controller({
    path: 'events',
    version: '1',
})
export class EventController {
    constructor() {}
}
