import { EventIterator, EventIteratorOptions } from '@klasa/event-iterator';
import { ClientEvents } from '../../util/types/Util';

import type { TextBasedChannel } from '../../util/Util';
import type { Message } from '../../client/caching/structures/Message';

export class MessageIterator extends EventIterator<Message> {
    public constructor(channel: TextBasedChannel, limit: number, options: EventIteratorOptions<Message> = {}) {
        super(channel.client, ClientEvents.MessageCreate, limit, options);
    }
}