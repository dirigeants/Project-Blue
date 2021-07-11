/* eslint-disable no-dupe-class-members */
import { mergeDefault, RequiredExcept, PartialRequired } from '@klasa/utils';

import { Embed } from '../Embed';

import type { File, RequestOptions } from '@klasa/rest';
import type { APIEmbedData } from '@klasa/dapi-types';

/* eslint-disable camelcase */

export interface MessageData {
	content?: string | null;
	embed?: APIEmbedData | null;
	nonce?: number | string;
	tts?: boolean;
	allowed_mentions?: Required<AllowedMentions>;
}

export interface AllowedMentions {
	parse?: ('users' | 'roles' | 'everyone')[];
	roles?: string[];
	users?: string[];
}

export interface MessageOptions extends RequestOptions {
	data?: MessageData;
}

export interface SplitOptions {
	maxLength?: number;
	char?: string;
	prepend?: string;
	append?: string;
}

/* eslint-enable camelcase */

export class MessageBuilder implements RequiredExcept<MessageOptions, 'auth' | 'query' | 'headers' | 'reason'> {

	/**
	 * The Message data to send to the api
	 */
	public data: PartialRequired<MessageData, 'allowed_mentions'>;

	/**
	 * The files to send to the api
	 */
	public files: File[];

	/**
	 * @param messageOptions The options to create this
	 */
	public constructor({ data = {}, files = [] }: MessageOptions = {}) {
		const defaultedData = mergeDefault({
			// eslint-disable-next-line camelcase
			allowed_mentions: {
				parse: [] as ('users' | 'roles' | 'everyone')[],
				roles: [] as string[],
				users: [] as string[]
			}
		} as PartialRequired<MessageData, 'allowed_mentions'>, data);

		this.data = defaultedData;
		this.files = files || [];
	}

	/**
	 * Sets content of the message
	 * @param content The content to set
	 */
	public setContent(content?: string | null): this {
		this.data.content = content;
		return this;
	}

	/**
	 * Sets the embed of the message
	 * @param embed The embed to set
	 */
	public setEmbed(embed?: APIEmbedData | null): this
	public setEmbed(embed?: (embed: Embed) => Embed): this
	public setEmbed(embed?: APIEmbedData | null | ((embed: Embed) => Embed)): this {
		this.data.embed = typeof embed === 'function' ? embed(new Embed()) : embed;
		return this;
	}

	/**
	 * Sets the nonce of the message
	 * @param nonce The nonce to set
	 */
	public setNonce(nonce?: number | string): this {
		this.data.nonce = nonce;
		return this;
	}

	/**
	 * Sets if the message should be tts
	 * @param tts The tts of this message
	 */
	public setTTS(tts: boolean): this {
		this.data.tts = tts;
		return this;
	}

	/**
	 * Allows Everyone and Here mentions to ping
	 */
	public parseEveryone(): this {
		this.data.allowed_mentions.parse.push('everyone');
		return this;
	}

	/**
	 * Allows User mentions to ping
	 * @param ids user ids you want to mention
	 * @example
	 * messageBuilder.parseUsers();
	 * // All users will be mentionable.
	 * @example
	 * messageBuilder.parseUsers('167383252271628289', '242043489611808769')
	 * // Only those two users will be mentioned even if you mention other users in your message.
	 */
	public parseUsers(...ids: string[]): this {
		if (ids.length) this.data.allowed_mentions.users.push(...ids);
		else this.data.allowed_mentions.parse.push('users');
		return this;
	}

	/**
	 * Allows Role mentions to ping
	 * @param ids role ids you want to mention
	 * @example
	 * messageBuilder.parseRoles();
	 * // All roles will be mentionable.
	 * @example
	 * messageBuilder.parseRoles('339959033937264641', '339947394726625300')
	 * // Only those two roles will be mentioned even if you mention other roles in your message.
	 */
	public parseRoles(...ids: string[]): this {
		if (ids.length) this.data.allowed_mentions.roles.push(...ids);
		else this.data.allowed_mentions.parse.push('roles');
		return this;
	}

	/**
	 * Adds a message attachment to the message
	 * @param file The attachment
	 */
	public addFile(file: File): this {
		this.files.push(file);
		return this;
	}

	/**
	 * Splices a message attachment to the message
	 * @param index The index to splice at
	 * @param deleteCount The number of attachments to delete
	 * @param file The attachment to add
	 */
	public spliceFile(index: number, deleteCount: number, file?: File): this {
		if (file) this.files.splice(index, deleteCount, file);
		else this.files.splice(index, deleteCount);
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
			{ data: { ...this.data, content, embed: null } });
	}

	/**
	 * Internal shared method to split the content by.
	 * @param param0 Options to split the content.
	 */
	protected _split({ maxLength = 2000, char = '\n', prepend = '', append = '' }: SplitOptions = {}): string[] {
		if (!this.data.content) return [];

		const text = this.data.content;
		const splitText = text.length <= maxLength ? [text] : text.split(char);
		const messages = [];

		if (splitText.some(chunk => chunk.length > maxLength)) throw new RangeError('A split message chunk is too big');

		// The current message we are building until we are just under maxLength
		let msg = '';
		for (const chunk of splitText) {
			// If adding the current chunk will make the message too long, push what we have and start the next message
			if (msg && (msg.length + char.length + chunk.length + append.length > maxLength)) {
				messages.push(msg + append);
				msg = prepend;
			}
			// Add the split char and the current chunk to our current message
			msg += (msg && msg !== prepend ? char : '') + chunk;
		}
		// Push the last message we had when we ran out of chunks
		messages.push(msg);

		return messages;
	}

}
