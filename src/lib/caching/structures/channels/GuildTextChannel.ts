/* eslint-disable no-dupe-class-members */
import { GuildChannel } from './GuildChannel';
import { MessageStore } from '../../stores/MessageStore';
import { MessageCollector, MessageCollectorOptions } from '../../../util/collectors/MessageCollector';
import { Permissions, PermissionsFlags } from '../../../util/bitfields/Permissions';
import { Typing } from '../Typing';
import { ChannelPinsStore } from '../../stores/ChannelPinsStore';

import type { Cache } from '@klasa/cache';
import type { APIChannelData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from '../guilds/Guild';
import type { GuildTextBasedChannel } from '../../../util/Util';
import type { Message } from '../messages/Message';
import type { MessageBuilder, MessageOptions, SplitOptions } from '../messages/MessageBuilder';

export interface SendOptions {
	split?: SplitOptions;
	cache?: boolean;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export abstract class GuildTextChannel extends GuildChannel {

	/**
	 * The message store for the channel.
	 * @since 0.0.1
	 */
	public readonly messages: MessageStore;

	/**
	 * The pins store for the channel.
	 * @since 0.0.4
	 */
	public readonly pins: ChannelPinsStore;

	/**
	 * The typing handler for the channel.
	 * @since 0.0.1
	 */
	public readonly typing: Typing;

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
	 * The id of the last message sent in the channel (may not point to an existing or valid message).
	 * @since 0.0.1
	 */
	public lastMessageID!: string | null;

	/**
	 * When the last pinned message was pinned in the channel.
	 * @since 0.0.1
	 */
	public lastPinTimestamp!: string | null;

	public constructor(client: Client, data: APIChannelData, guild: Guild | null) {
		super(client, data, guild);
		this.messages = new MessageStore(client, this as unknown as GuildTextBasedChannel);
		this.typing = new Typing(this);

		this.pins = new ChannelPinsStore(this, []);
	}

	/**
	 * If the client can send message attachments in the channel.
	 * @since 0.0.1
	 */
	public get attachable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has([
			Permissions.FLAGS[PermissionsFlags.ViewChannel],
			Permissions.FLAGS[PermissionsFlags.SendMessages],
			Permissions.FLAGS[PermissionsFlags.AttachFiles]
		]) ?? null;
	}

	/**
	 * If the client can send messages in the channel.
	 * @since 0.0.1
	 */
	public get postable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has([Permissions.FLAGS[PermissionsFlags.ViewChannel], Permissions.FLAGS[PermissionsFlags.SendMessages]]) ?? null;
	}

	/**
	 * If the client can send message embeds in the channel.
	 * @since 0.0.1
	 */
	public get embedable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has([
			Permissions.FLAGS[PermissionsFlags.ViewChannel],
			Permissions.FLAGS[PermissionsFlags.SendMessages],
			Permissions.FLAGS[PermissionsFlags.EmbedLinks]
		]) ?? null;
	}

	/**
	 * Awaits a group of messages.
	 * @since 0.0.1
	 * @param options The options to control what you receive
	 */
	public awaitMessages(options: MessageCollectorOptions): Promise<Cache<string, Message>> {
		return new MessageCollector(this, options).collect();
	}

	/**
	 * Sends a message to the channel.
	 * @param data The {@link MessageBuilder builder} to send.
	 * @param options The split options for the message.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#create-message
	 * @example
	 * channel.messages.add(new MessageBuilder()
	 *     .setContent('Ping!')
	 *     .setEmbed(new Embed().setDescription('From an embed!')));
	 */
	public send(data: MessageOptions, options?: SplitOptions): Promise<Message[]>;
	/**
	 * Sends a message to the channel.
	 * @param data A callback with a {@link MessageBuilder builder} as an argument.
	 * @param options The split options for the message.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#create-message
	 * @example
	 * channel.messages.add(builder => builder
	 *     .setContent('Ping!')
	 *     .setEmbed(embed => embed.setDescription('From an embed!')));
	 */
	public send(data: (message: MessageBuilder) => MessageBuilder | Promise<MessageBuilder>, options?: SplitOptions): Promise<Message[]>;
	public async send(data: MessageOptions | ((message: MessageBuilder) => MessageBuilder | Promise<MessageBuilder>), options: SplitOptions = {}): Promise<Message[]> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return this.messages.add(data, options);
	}

	protected _patch(data: APIChannelData): this {
		this.topic = data.topic ?? null;
		this.nsfw = data.nsfw as boolean;
		this.lastMessageID = data.last_message_id ?? null;
		this.lastPinTimestamp = data.last_pin_timestamp ?? null;
		return super._patch(data);
	}

}
