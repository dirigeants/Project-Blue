import { DataStore } from './base/DataStore';
import { GuildEmoji } from '../structures/guilds/GuildEmoji';

import type { Client } from '../../Client';
import type { APIEmojiData } from '@klasa/dapi-types';

export class GuildEmojiStore extends DataStore<GuildEmoji, typeof GuildEmoji> {

	public constructor(client: Client) {
		super(client, GuildEmoji);
	}

	/**
	 * Adds a new structure to this DataStore
	 * @param data The data packet to add
	 * @param cache If the data should be cached
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	public add(data: APIEmojiData, cache = true): GuildEmoji {
		const existing = this.get(data.id as string);
		// eslint-disable-next-line dot-notation
		if (existing) return existing['_patch'](data);

		const entry = new this.Holds(this.client, data);
		if (cache) this.set(entry.id, entry);
		return entry;
	}

}