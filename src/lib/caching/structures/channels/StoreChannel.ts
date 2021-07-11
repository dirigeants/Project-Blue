import { ChannelType, APIChannelData } from '@klasa/dapi-types';
import { GuildChannel, ChannelModifyOptions } from './GuildChannel';

import type { RequestOptions } from '@klasa/rest';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export class StoreChannel extends GuildChannel {

	/**
	 * The type of channel.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	public readonly type = ChannelType.GuildStore;

	/**
	 * Whether or not the channel is nsfw.
	 * @since 0.0.1
	 */
	public nsfw!: boolean;

	/**
	 * Modifies the channel.
	 * @param data The channel modify options.
	 * @param requestOptions The request options.
	 * @since 0.0.1
	 */
	public modify(options: StoreChannelModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		return super.modify(options, requestOptions);
	}

	protected _patch(data: APIChannelData): this {
		this.nsfw = data.nsfw as boolean;
		return super._patch(data);
	}

}

/* eslint-disable camelcase */

export interface StoreChannelModifyOptions extends ChannelModifyOptions {
	nsfw?: boolean | null;
	parent_id?: string | null;
}

/* eslint-enable camelcase */
