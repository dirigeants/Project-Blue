import { DataStore } from './base/DataStore';
import { Channel } from '../structures/channels/Channel';
import { extender } from '../../../util/Extender';

import type { APIChannelData } from '@klasa/dapi-types';
import type { Client } from '../../Client';

export class ChannelStore extends DataStore<Channel> {

	public constructor(client: Client) {
		super(client, extender.get('Channel'));
	}

	/**
	 * Adds a new structure to this DataStore
	 * @param data The data packet to add
	 * @param cache If the data should be cached
	 */
	public add(data: APIChannelData, cache = true): Channel {
		const existing = this.get(data.id);
		// eslint-disable-next-line dot-notation
		if (existing) return existing['_patch'](data);

		const entry = Channel.create(this.client, data);
		if (cache) this.set(entry.id, entry);
		return entry;
	}

}
