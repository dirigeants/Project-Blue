import { APIChannelData, ChannelType } from '@klasa/dapi-types';
import { GuildTextChannel } from './GuildTextChannel';

import type { ChannelModifyOptions } from './GuildChannel';
import type { RequestOptions } from '@klasa/rest';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export class TextChannel extends GuildTextChannel {

	/**
	 * The type of channel.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	public readonly type = ChannelType.GuildText;

	/**
	 * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the
	 * permission `MANAGE_MESSAGES` or `MANAGE_CHANNEL`, are unaffected.
	 * @since 0.0.1
	 */
	public rateLimitPerUser!: number;

	/**
	 * Modifies the channel.
	 * @param data The channel modify options.
	 * @param requestOptions The request options.
	 * @since 0.0.1
	 */
	public modify(data: TextChannelModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		return super.modify(data, requestOptions);
	}

	protected _patch(data: APIChannelData): this {
		this.rateLimitPerUser = data.rate_limit_per_user as number;
		return super._patch(data);
	}

}

/* eslint-disable camelcase */

export interface TextChannelModifyOptions extends ChannelModifyOptions {
	type?: ChannelType.GuildText | ChannelType.GuildNews;
	topic?: string | null;
	nsfw?: boolean | null;
	rate_limit_per_user?: number | null;
	parent_id?: string | null;
}

/* eslint-enable camelcase */
