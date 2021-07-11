import { ChannelType, APIMessageData, APIChannelFollowResult } from '@klasa/dapi-types';
import { Routes, RequestOptions } from '@klasa/rest';
import { GuildTextChannel } from './GuildTextChannel';

import type { ChannelModifyOptions } from './GuildChannel';
import type { Message } from '../messages/Message';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export class NewsChannel extends GuildTextChannel {

	/**
	 * The type of channel.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	public readonly type = ChannelType.GuildNews;

	/**
	 * Crossposts a Message in the channel.
	 * @param messageID The ID of the {@link Message message} that should be crossposted.
	 * @since 0.0.1
	 */
	public async crosspost(messageID: string): Promise<Message> {
		const messageData = await this.client.api.post(Routes.crosspostMessage(this.id, messageID)) as APIMessageData;
		// eslint-disable-next-line dot-notation
		return this.messages['_add'](messageData);
	}

	/*
	 * Subscribes a channel to crossposted messages from the channel.
	 * @param channel The {@link GuildTextChannel channel} that should follow this NewsChannel.
	 * @since 0.0.4
	 */
	public async follow(channel: GuildTextChannel): Promise<APIChannelFollowResult> {
		// eslint-disable-next-line camelcase
		return this.client.api.post(Routes.followChannel(this.id), { data: { webhook_channel_id: channel.id } }) as Promise<APIChannelFollowResult>;
	}

	/**
	 * Modifies the channel.
	 * @param data The channel modify options.
	 * @param requestOptions The request options.
	 * @since 0.0.1
	 */
	public modify(options: NewsChannelModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		return super.modify(options, requestOptions);
	}

}

/* eslint-disable camelcase */

export interface NewsChannelModifyOptions extends ChannelModifyOptions {
	type?: ChannelType.GuildNews | ChannelType.GuildText;
	topic?: string | null;
	nsfw?: boolean;
	parent_id?: string | null;
}

/* eslint-enable camelcase */
