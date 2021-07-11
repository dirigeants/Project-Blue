/* eslint-disable no-dupe-class-members */
import { mergeDefault, RequiredExcept, PartialRequired } from '@klasa/utils';

import type { File, RequestOptions } from '@klasa/rest';
import type { APIEmbedData } from '@klasa/dapi-types';

import { MessageBuilder, AllowedMentions, SplitOptions } from './MessageBuilder';
import { Embed } from '../Embed';

/* eslint-disable camelcase */

export interface WebhookMessageData {
	content?: string;
	embeds?: APIEmbedData[];
	nonce?: string;
	tts?: boolean;
	username?: string;
	avatar_url?: string;
	allowed_mentions?: Required<AllowedMentions>;
}

export interface WebhookMessageOptions extends RequestOptions {
	data?: WebhookMessageData;
}

/* eslint-enable camelcase */

export class WebhookMessageBuilder extends MessageBuilder implements RequiredExcept<WebhookMessageOptions, 'auth' | 'query' | 'headers' | 'reason'> {

	/**
	 * The Webhook Message data to send to the api
	 */
	public data: PartialRequired<WebhookMessageData, 'allowed_mentions'>;

	/**
	 * The files to send to the api
	 */
	public files: File[];

	/**
	 * Webhook messages don't use auth
	 */
	public auth = false;

	/**
	 * @param webhookMessageOptions The options to create the webhook message
	 */
	public constructor({ data = {}, files = [] }: WebhookMessageOptions = {}) {
		super();
		const defaultedData = mergeDefault({
			// eslint-disable-next-line camelcase
			allowed_mentions: {
				parse: [] as ('users' | 'roles' | 'everyone')[],
				roles: [] as string[],
				users: [] as string[]
			}
		} as PartialRequired<WebhookMessageData, 'allowed_mentions'>, data);

		this.data = defaultedData;
		this.files = files;
	}

	/**
	 * WebhookMessages have multiple embeds, use the addEmbed or spliceEmbed methods instead.
	 */
	public setEmbed(): never {
		throw new Error('WebhookMessages have multiple embeds, use the addEmbed or spliceEmbed methods instead.');
	}

	/**
	 * Adds an embed to the webhook message
	 * @param embed The field name
	 */
	public addEmbed(embed: APIEmbedData): this
	public addEmbed(embed: (embed: Embed) => Embed): this
	public addEmbed(embed: APIEmbedData | ((embed: Embed) => Embed)): this {
		if (!this.data.embeds) this.data.embeds = [];
		this.data.embeds.push(typeof embed === 'function' ? embed(new Embed()) : embed);
		return this;
	}

	/**
	 * Deletes and/or inserts embeds by index in the webhook message
	 * @param index The index to start at
	 * @param deleteCount How many fields to delete
	 * @param embed The field name to insert
	 */
	public spliceEmbed(index: number, deleteCount: number, embed?: APIEmbedData): this
	public spliceEmbed(index: number, deleteCount: number, embed?: (embed: Embed) => Embed): this
	public spliceEmbed(index: number, deleteCount: number, embed?: APIEmbedData | ((embed: Embed) => Embed)): this {
		if (!this.data.embeds) this.data.embeds = [];
		if (embed) this.data.embeds.splice(index, deleteCount, typeof embed === 'function' ? embed(new Embed()) : embed);
		else this.data.embeds.splice(index, deleteCount);
		return this;
	}

	/**
	 * Sets the username of the webhook message
	 * @param username The username of the webhook message
	 */
	public setUsername(username?: string): this {
		this.data.username = username;
		return this;
	}

	/**
	 * Sets the avatar of the webhook message
	 * @param avatar The avatar for the webhook message
	 */
	public setAvatar(avatar?: string): this {
		// eslint-disable-next-line camelcase
		this.data.avatar_url = avatar;
		return this;
	}

	/**
	 * Splits the message into multiple messages.
	 * @param options Options to split the message by.
	 */
	public split(options: SplitOptions = {}): RequestOptions[] {
		// If there isn't content, the message can't be split
		if (!this.data.content) return [this];

		const messages = this._split(options);

		// Don't send any possible empty messages, and return the array of RequestOptions
		return messages.filter(mes => mes).map((content, index) => index === 0 ?
			// first message has embed/s and files
			{ data: { ...this.data, content }, files: this.files } :
			// Later messages have neither
			{ data: { ...this.data, content, embeds: null } });
	}

}
