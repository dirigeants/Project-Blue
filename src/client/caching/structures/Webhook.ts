/* eslint-disable no-dupe-class-members */
import { Snowflake } from '@klasa/snowflake';
import { Routes } from '@klasa/rest';
import { WebhookMessageBuilder, WebhookMessageOptions } from './messages/WebhookMessageBuilder';
import { Structure } from './base/Structure';
import { extender } from '../../../util/Extender';

import type { APIWebhookData, WebhookType, APIMessageData } from '@klasa/dapi-types';
import type { Client } from '../../Client';
import type { WebhookClient } from '../../WebhookClient';
import type { SplitOptions } from './messages/MessageBuilder';
import type { Message } from './Message';
import type { User } from './User';
import type { Guild } from './guilds/Guild';
import type { Channel } from './channels/Channel';

export interface WebhookUpdateData {
	name?: string;
	avatar?: string;
	channelID?: string;
}

export class Webhook extends Structure {

	/**
	 * The id of the webhook
	 */
	public id: string;

	/**
	 * The type of the webhook
	 */
	public type: WebhookType;

	/**
	 * The guildID this webhook is for
	 */
	public guildID?: string;

	/**
	 * The channelID this webhook is for
	 */
	public channelID!: string;

	/**
	 * The "user" of the webhook displayed on the webhook messages
	 */
	public user?: User;

	/**
	 * The name of the webhook
	 */
	public name: string | null = null;

	/**
	 * The avatar used for this webhook
	 */
	public avatar: string | null = null;

	/**
	 * The token for this webhook
	 */
	public token?: string;

	/**
	 * @param client The client to manage this webhook
	 * @param data The webhook data
	 */
	public constructor(client: Client | WebhookClient, data: APIWebhookData) {
		super(client);
		this.id = data.id;
		this.type = data.type;
		this.guildID = data.guild_id;

		this._patch(data);
	}

	public _patch(data: APIWebhookData): this {
		this.token = data.token || this.token;
		this.name = data.name || this.name;
		this.avatar = data.avatar || this.avatar;
		this.channelID = data.channel_id || this.channelID;

		if (data.user) {
			// eslint-disable-next-line dot-notation
			if (this.user) this.user['_patch'](data.user);
			else this.user = new (extender.get('User'))(this.client, data.user);
		}

		return this;
	}

	/**
	 * The guild that this webhook is in
	 */
	get guild(): Guild | null {
		return (this.guildID && (this.client as Client).guilds.get(this.guildID)) || null;
	}

	/**
	 * The channel of this webhook
	 */
	get channel(): Channel | null {
		// todo: This is broken from another change...
		return (this.client as Client).dms.get(this.channelID) || null;
	}

	/**
	 * The timestamp the webhook was created at
	 */
	get createdTimestamp(): number {
		return new Snowflake(this.id).timestamp;
	}

	/**
	 * The time the webhook was created at
	 */
	get createdAt(): Date {
		return new Snowflake(this.id).date;
	}

	/**
	 * Sends a message over the webhook
	 * @param data Message data
	 */
	public async send(data: WebhookMessageOptions, splitOptions?: SplitOptions): Promise<Message[]>
	public async send(data: (message: WebhookMessageBuilder) => WebhookMessageBuilder, splitOptions?: SplitOptions): Promise<Message[]>
	public async send(data: WebhookMessageOptions | ((message: WebhookMessageBuilder) => WebhookMessageBuilder), splitOptions?: SplitOptions): Promise<Message[]> {
		if (!this.token) throw new Error('The token on this webhook is unknown. You cannot send messages.');

		const split = new WebhookMessageBuilder(typeof data === 'function' ? data(new WebhookMessageBuilder()) : data).split(splitOptions);

		const endpoint = Routes.webhookTokened(this.id, this.token);
		const responses = [];

		for (const message of split) responses.push(this.client.api.post(endpoint, message));

		const rawMessages = await Promise.all(responses);

		const MessageConstructor = extender.get('Message');
		return rawMessages.map(msg => new MessageConstructor(this.client, msg as APIMessageData));
	}

	/**
	 * Updates the webhook properties
	 * @param webhookUpdateData Data to update the webhook with
	 */
	public async update({ name, avatar, channelID }: WebhookUpdateData): Promise<this> {
		const updateData = await (channelID || !this.token ?
			// Requires MANAGE_WEBHOOKS permission to update channelID or to update without the token
			// eslint-disable-next-line @typescript-eslint/camelcase
			this.client.api.patch(Routes.webhook(this.id), { data: { name, avatar, channel_id: channelID } }) :
			// Doesn't require any permissions, but you cannot change the channelID
			this.client.api.patch(Routes.webhookTokened(this.id, this.token), { auth: false, data: { name, avatar } }));

		return this._patch(updateData as APIWebhookData);
	}

	/**
	 * Delete this webhook from the api
	 */
	public async delete(): Promise<void> {
		await (this.token ?
			// If we know the webhook token, we can delete it with less permissions
			this.client.api.delete(Routes.webhookTokened(this.id, this.token), { auth: false }) :
			// Requires MANAGE_WEBHOOKS permission
			this.client.api.delete(Routes.webhook(this.id)));
	}

	/**
	 * Returns a {@link Webhook webhook}, this uses the client for the authentication.
	 * @since 0.0.1
	 * @param client The {@link Client client} or {@link WebhookClient webhook client} that will manage the created object.
	 * @param id The {@link Webhook webhook} ID.
	 * @see https://discord.com/developers/docs/resources/webhook#get-webhook
	 */
	public static fetch(client: Client | WebhookClient, id: string): Promise<Webhook>
	/**
	 * Returns a {@link Webhook webhook}, this uses the token passed.
	 * @since 0.0.1
	 * @param client The {@link Client client} or {@link WebhookClient webhook client} that will manage the created object.
	 * @param id The {@link Webhook webhook} ID.
	 * @param token The {@link Webhook webhook}'s token.
	 * @see https://discord.com/developers/docs/resources/webhook#get-webhook-with-token
	 */
	public static fetch(client: Client | WebhookClient, id: string, token: string): Promise<Webhook>;
	public static async fetch(client: Client | WebhookClient, id: string, token?: string): Promise<Webhook> {
		const webhookData = await (token ?
			client.api.get(Routes.webhookTokened(id, token), { auth: false }) :
			client.api.get(Routes.webhook(id)));

		return new this(client, webhookData as APIWebhookData);
	}

}
