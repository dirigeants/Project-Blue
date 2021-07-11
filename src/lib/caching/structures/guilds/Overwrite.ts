import { Permissions } from '../../../util/bitfields/Permissions';
import { Structure } from '../base/Structure';

import type { APIOverwriteData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { GuildChannel } from '../channels/GuildChannel';
import type { RequestOptions } from '@klasa/rest';

export type OverwriteData = Omit<APIOverwriteData, 'id'>;

/**
 * @see https://discord.com/developers/docs/resources/channel#overwrite-object
 */
export class Overwrite extends Structure {

	/**
	 * A {@link Role} or {@link User} id.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The {@link GuildChannel channel} the overwrite is for.
	 * @since 0.0.1
	 */
	public readonly channel: GuildChannel;

	/**
	 * Either "role" or "member".
	 * @since 0.0.1
	 */
	public type!: 'role' | 'member';

	/**
	 * The allowed permissions in the overwrite.
	 * @since 0.0.1
	 */
	public allow!: Readonly<Permissions>;

	/**
	 * The denied permissions in the overwrite.
	 * @since 0.0.1
	 */
	public deny!: Readonly<Permissions>;

	/**
	 * If the overwrite has been deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIOverwriteData, channel: GuildChannel) {
		super(client);
		this.id = data.id;
		this.type = data.type;
		this.channel = channel;
		this._patch(data);
	}

	/**
	 * Deletes the overwrite.
	 * @param requestOptions The additional request options.
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.channel.permissionOverwrites.remove(this.id, requestOptions);
		return this;
	}

	/**
	 * Modifies the overwrite.
	 * @param options The modify options
	 * @param requestOptions The additional request options.
	 */
	public async modify(options: Partial<OverwriteData>, requestOptions: RequestOptions = {}): Promise<this> {
		const data = {
			type: this.type,
			allow: options.allow ?? this.allow.bitfield,
			deny: options.deny ?? this.deny.bitfield
		};
		await this.channel.permissionOverwrites.add(this.id, data, requestOptions);
		return this._patch(data);
	}

	protected _patch(data: APIOverwriteData | OverwriteData): this {
		this.allow = new Permissions(data.allow).freeze();
		this.deny = new Permissions(data.deny).freeze();
		return this;
	}

}
