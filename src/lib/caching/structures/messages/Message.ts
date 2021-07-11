/* eslint-disable no-dupe-class-members */
import { APIMessageData, APIMessageActivityData, APIMessageApplicationData, APIMessageReferenceData, ChannelType } from '@klasa/dapi-types';
import { Cache } from '@klasa/cache';
import { Routes, RequestOptions } from '@klasa/rest';
import { Embed } from '../Embed';
import { isSet, TextBasedChannel } from '../../../util/Util';
import { MessageAttachment } from './MessageAttachment';
import { MessageFlags } from '../../../util/bitfields/MessageFlags';
import { MessageMentions } from './MessageMentions';
import { MessageReaction } from './reactions/MessageReaction';
import { MessageReactionStore } from '../../stores/MessageReactionStore';
import { WebhookMessage } from './WebhookMessage';
import { ReactionCollector, ReactionCollectorOptions } from '../../../util/collectors/ReactionCollector';
import { Permissions, PermissionsFlags } from '../../../util/bitfields/Permissions';
import { MessageBuilder, MessageOptions } from './MessageBuilder';

import type { User } from '../User';
import type { Guild } from '../guilds/Guild';
import type { Client } from '../../../client/Client';
import type { GuildMember } from '../guilds/GuildMember';
import type { GuildChannel } from '../channels/GuildChannel';

export class Message extends WebhookMessage<Client> {

	/**
	 * The channel the message was sent in.
	 * @since 0.0.1
	 */
	public readonly channel: TextBasedChannel;

	/**
	 * The guild the message was sent in.
	 * @since 0.0.1
	 */
	public readonly guild: Guild | null;

	/**
	 * Author of the message.
	 * @since 0.0.1
	 */
	public readonly author: User;

	/**
	 * The author's member data, always null if {@link Message#guild} is null.
	 * @since 0.0.1
	 */
	public readonly member: GuildMember | null;

	/**
	 * The mentions.
	 * @since 0.0.1
	 */
	public readonly mentions: MessageMentions;

	/**
	 * The attached files.
	 * @since 0.0.1
	 */
	public readonly attachments: Cache<string, MessageAttachment>;

	/**
	 * When the message was edited (or null if never).
	 * @since 0.0.1
	 */
	public editedTimestamp!: number | null;

	/**
	 * Whether or not this was a TTS message.
	 * @since 0.0.1
	 */
	public tts!: boolean;

	/**
	 * The embedded data.
	 * @since 0.0.1
	 */
	public embeds: Embed[] = [];

	/**
	 * Reactions to the message.
	 * @since 0.0.1
	 */
	public readonly reactions: MessageReactionStore;

	/**
	 * Used for validating a message was sent.
	 * @since 0.0.1
	 */
	public readonly nonce?: string | null;

	/**
	 * Whether or not the message is pinned.
	 * @since 0.0.1
	 */
	public pinned!: boolean;

	/**
	 * Sent with Rich Presence-related chat embeds.
	 * @since 0.0.1
	 */
	public readonly activity: APIMessageActivityData | null;

	/**
	 * Sent with Rich Presence-related chat embeds.
	 * @since 0.0.1
	 */
	public readonly application: APIMessageApplicationData | null;

	/**
	 * Reference data sent with crossposted messages.
	 * @since 0.0.1
	 */
	public readonly reference: APIMessageReferenceData | null;

	/**
	 * Describes extra features of the message.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#message-object-message-flags
	 */
	public flags!: MessageFlags;

	/**
	 * Whether the message is deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIMessageData, guild?: Guild) {
		super(client, data);
		this.attachments = new Cache();
		this.reactions = new MessageReactionStore(client, this);
		this.guild = guild ?? ((data.guild_id && this.client.guilds.get(data.guild_id)) || null);
		this.channel = this.client.channels.get(data.channel_id) as TextBasedChannel;
		// eslint-disable-next-line dot-notation
		this.author = this.client.users['_add'](data.author);
		// eslint-disable-next-line dot-notation
		this.member = data.member && this.guild ? this.guild.members['_add']({ ...data.member, user: data.author }) : null;
		this.mentions = new MessageMentions(this, data.mentions, data.mention_roles, data.mention_channels, data.mention_everyone);

		this.activity = data.activity ?? null;
		this.application = data.application ?? null;
		this.reference = data.message_reference ?? null;

		this._patch(data);
	}

	/**
	 * When the message was sent.
	 * @since 0.0.1
	 */
	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	/**
	 * When the message was edited (or null if never).
	 * @since 0.0.1
	 */
	public get editedAt(): Date | null {
		return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
	}

	/**
	 * If the client can delete the message.
	 * @since 0.0.1
	 */
	public get deletable(): boolean | null {
		if (this.deleted) return false;
		if (!this.guild) return this.editable;
		return this.editable || (this.guild.me?.permissionsIn(this.channel as GuildChannel).has([Permissions.FLAGS[PermissionsFlags.ManageMessages]]) ?? null);
	}

	/**
	 * If the client can edit the message.
	 * @since 0.0.1
	 */
	public get editable(): boolean {
		return !this.deleted && (this.author === this.client.user);
	}

	/**
	 * If the client can pin the message.
	 * @since 0.0.1
	 */
	public get pinnable(): boolean | null {
		if (this.deleted) return false;
		if (!this.guild) return true;
		return this.guild.me?.permissionsIn(this.channel as GuildChannel).has([Permissions.FLAGS[PermissionsFlags.ManageMessages]]) ?? null;
	}

	/**
	 * If the client can react to the message.
	 * @since 0.0.1
	 */
	public get reactable(): boolean | null {
		if (this.deleted) return false;
		if (!this.guild) return true;
		return this.guild.me?.permissionsIn(this.channel as GuildChannel).has([Permissions.FLAGS[PermissionsFlags.AddReactions]]) ?? null;
	}

	/**
	 * The link to the message
	 * @since 0.0.4
	 */
	get link(): string {
		return `https://discord.com/channels/${this.guild ? this.guild.id : '@me'}/${this.channel.id}/${this.id}`;
	}

	/**
	 * Awaits a group of messages.
	 * @since 0.0.1
	 * @param options The options to control what you receive.
	 */
	public awaitReactions(options: ReactionCollectorOptions): Promise<Cache<string, MessageReaction>> {
		return new ReactionCollector(this, options).collect();
	}

	/**
	 * Crosspost the message.
	 * @since 0.0.4
	 */
	public crosspost(): Promise<this> {
		if (this.channel.type !== ChannelType.GuildNews) return Promise.reject(new Error('Messages can only be crossposted if they are posted in a news channels.'));
		return this.channel.crosspost(this.id) as Promise<this>;
	}

	/**
	 * Edits the message.
	 * @param data The {@link MessageBuilder builder} to send.
	 * @since 0.0.2
	 * @see https://discord.com/developers/docs/resources/channel#edit-message
	 * @example
	 * message.edit(new MessageBuilder()
	 *     .setContent('Ping!')
	 *     .setEmbed(new Embed().setDescription('From an embed!')));
	 */
	public edit(data: MessageOptions): Promise<Message>;
	/**
	 * Edits the message.
	 * @param data A callback with a {@link MessageBuilder builder} as an argument.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#edit-message
	 * @example
	 * message.edit(builder => builder
	 *     .setContent('Ping!')
	 *     .setEmbed(embed => embed.setDescription('From an embed!')));
	 */
	public edit(data: (message: MessageBuilder) => MessageBuilder | Promise<MessageBuilder>): Promise<Message>;
	/**
	 * Edits the message.
	 * @param data The {@link MessageBuilder builder} to send.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#edit-message
	 */
	public async edit(data: MessageOptions | ((message: MessageBuilder) => MessageBuilder | Promise<MessageBuilder>)): Promise<Message> {
		data = typeof data === 'function' ? await data(new MessageBuilder()) : data;
		const apiData = await this.client.api.patch(Routes.channelMessage(this.channel.id, this.id), data) as APIMessageData;
		return this._patch(apiData) as Message;
	}

	/**
	 * Deletes the message.
	 * @param requestOptions The additional request options.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#delete-message
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.channel.messages.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	/**
	 * Defines the toString behavior of messages.
	 * @since 0.0.4
	 */
	public toString(): string {
		return this.content;
	}

	/**
	 * Pins the message to the channel
	 * @since 0.0.4
	 */
	public async pin(): Promise<this> {
		await this.channel.pins.add(this.id);
		return this;
	}

	/**
	 * Unpins the message to the channel
	 * @since 0.0.4
	 */
	public async unpin(): Promise<this> {
		await this.channel.pins.remove(this.id);
		return this;
	}

	protected _patch(data: Partial<APIMessageData>): this {
		if (isSet(data, 'content')) this.content = data.content;
		if (isSet(data, 'edited_timestamp')) this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp).getTime() : null;
		if (isSet(data, 'tts')) this.tts = data.tts;

		if (data.reactions) {
			this.reactions.clear();
			for (const reaction of data.reactions) {
				const messageReaction = new MessageReaction(this.client, reaction, this);
				this.reactions.set(messageReaction.id, messageReaction);
			}
		}

		if (data.attachments) for (const attachment of data.attachments) this.attachments.set(attachment.id, new MessageAttachment(attachment));
		if (data.embeds) for (const embed of data.embeds) this.embeds.push(new Embed(embed));

		if (isSet(data, 'pinned')) {
			this.pinned = data.pinned;

			if (this.pinned) this.channel.pins.set(this.id);
			else this.channel.pins.delete(this.id);
		}

		if (isSet(data, 'flags')) this.flags = new MessageFlags(data.flags);
		return this;
	}

}
