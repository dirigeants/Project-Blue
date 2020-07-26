import { Routes, RequestOptions } from '@klasa/rest';
import { DataStore } from './base/DataStore';
import { extender } from '../../util/Extender';

import type { APIInviteData } from '@klasa/dapi-types';
import type { Invite } from '../structures/Invite';
import type { Client } from '../../client/Client';

/**
 * The store for {@link Invite invites}.
 * @since 0.0.1
 */
export class InviteStore extends DataStore<Invite> {

	/**
	 * Builds the store.
	 * @since 0.0.1
	 * @param client The {@link Client client} this store belongs to.
	 */
	public constructor(client: Client) {
		super(client, extender.get('Invite'), client.options.cache.limits.invites);
	}

	/**
	 * Deletes an invite given its code.
	 * @since 0.0.1
	 * @param code The {@link Invite#code invite code}.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/invite#delete-invite
	 */
	public async remove(code: string, requestOptions: RequestOptions = {}): Promise<Invite> {
		const entry = await this.client.api.delete(Routes.invite(code), requestOptions) as APIInviteData;
		const guild = entry.guild ? this.client.guilds.get(entry.guild.id) : null;
		const channel = this.client.channels.get(entry.channel.id);
		return new this.Holds(this.client, entry, channel, guild);
	}

	/**
	 * Returns a {@link Invite invite} with optionally their metadata.
	 * @since 0.0.1
	 * @param code The {@link Invite#code invite code}.
	 * @see https://discord.com/developers/docs/resources/invite#get-invite
	 */
	public async fetch(code: string, options: InviteStoreFetchOptions = {}): Promise<Invite> {
		const entry = await this.client.api.get(Routes.invite(code), { query: Object.entries(options) }) as APIInviteData;
		return this._add(entry);
	}

	/**
	 * Adds a new structure to this DataStore
	 * @param data The data packet to add
	 * @param cache If the data should be cached
	 */
	protected _add(data: APIInviteData): Invite {
		const existing = this.get(data.code);
		// eslint-disable-next-line dot-notation
		if (existing) return existing['_patch'](data);

		const guild = data.guild ? this.client.guilds.get(data.guild.id) : null;
		const channel = this.client.channels.get(data.channel.id);
		const entry = new this.Holds(this.client, data, channel, guild);
		if (this.client.options.cache.enabled) this.set(entry.id, entry);
		return entry;
	}

}

/* eslint-disable camelcase */

/**
 * The options for {@link InviteStore#fetch}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/invite#get-invite-get-invite-url-parameters
 */
export interface InviteStoreFetchOptions {
	/**
	 * Whether the invite should contain approximate member counts.
	 * @since 0.0.1
	 * @default false
	 */
	with_counts?: boolean;
}

/* eslint-enable camelcase */
