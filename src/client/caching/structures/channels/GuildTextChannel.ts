/* eslint-disable no-dupe-class-members */
import { Routes } from '@klasa/rest';
import { GuildChannel } from './GuildChannel';
import { MessageStore } from '../../../caching/stores/MessageStore';
import { MessageBuilder, MessageOptions, SplitOptions } from '../messages/MessageBuilder';
import { Message } from '../Message';

import type { APIChannelData, APIMessageData } from '@klasa/dapi-types';
import type { Guild } from '../guilds/Guild';
import type { Client } from '../../../Client';

export interface SendOptions {
	split?: SplitOptions;
	cache?: boolean;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export abstract class GuildTextChannel extends GuildChannel {

	/**
	 * The message store for this channel.
	 * @since 0.0.1
	 */
	public readonly messages: MessageStore;

	/**
	 * The channel topic (0-1024 characters).
	 * @since 0.0.1
	 */
	public topic!: string | null;

	/**
	 * Whether or not the channel is nsfw.
	 * @since 0.0.1
	 */
	public nsfw!: boolean;

	/**
	 * The id of the last message sent in this channel (may not point to an existing or valid message).
	 * @since 0.0.1
	 */
	public lastMessageID!: string | null;

	/**
	 * When the last pinned message was pinned.
	 * @since 0.0.1
	 */
	public lastPinTimestamp!: string | null;

	public constructor(client: Client, data: APIChannelData, guild: Guild | null) {
		super(client, data, guild);
		this.messages = new MessageStore(client);
	}

	/**
	 * Sends a message to the channel.
	 * @param data The {@link MessageBuilder builder} to send.
	 * @since 0.0.1
	 */
	public async send(data: MessageOptions, options: SendOptions): Promise<Message[]>
	public async send(data: (message: MessageBuilder) => MessageBuilder, options: SendOptions): Promise<Message[]>
	public async send(data: MessageOptions | ((message: MessageBuilder) => MessageBuilder), options: SendOptions = {}): Promise<Message[]> {
		const split = (typeof data === 'function' ? data(new MessageBuilder()) : new MessageBuilder(data)).split(options.split);

		const endpoint = Routes.channelMessages(this.id);
		const responses = [];

		for (const message of split) responses.push(this.client.api.post(endpoint, message));

		const rawMessages = await Promise.all(responses);

		// eslint-disable-next-line dot-notation
		return rawMessages.map(msg => this.messages['_add'](msg as APIMessageData, options.cache));
	}

	protected _patch(data: APIChannelData): this {
		this.topic = data.topic ?? null;
		this.nsfw = data.nsfw as boolean;
		this.lastMessageID = data.last_message_id ?? null;
		this.lastPinTimestamp = data.last_pin_timestamp ?? null;
		return super._patch(data);
	}

}
