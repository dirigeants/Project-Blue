import { Structure } from '../base/Structure';

import type { RequestOptions } from '@klasa/rest';
import type { APIBanData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from './Guild';
import type { User } from '../User';

/**
 * @see https://discord.com/developers/docs/resources/guild#ban-object
 */
export class Ban extends Structure {

	/**
	 * The user's ID that got banned.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The reason for the ban.
	 * @since 0.0.1
	 */
	public readonly reason: string | null;

	/**
	 * The guild the ban is from.
	 * @since 0.0.1
	 */
	public readonly guild: Guild;

	/**
	 * If the ban has been removed.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIBanData, guild: Guild) {
		super(client);
		// eslint-disable-next-line dot-notation
		this.id = this.client.users['_add'](data.user).id;
		this.reason = data.reason;
		this.guild = guild;
	}

	/**
	 * Deletes the ban. (unbans the user)
	 * @since 0.0.1
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#remove-guild-ban
	 */
	public async delete(requestOptions?: RequestOptions): Promise<this> {
		await this.guild.bans.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	/**
	 * The user.
	 * @since 0.0.1
	 */
	public get user(): User | null {
		return this.client.users.get(this.id) ?? null;
	}

	protected _patch(): this {
		return this;
	}

}
