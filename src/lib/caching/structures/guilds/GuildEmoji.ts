import { Structure } from '../base/Structure';

import type { APIEmojiData } from '@klasa/dapi-types';
import type { RequestOptions } from '@klasa/rest';
import type { Guild } from './Guild';
import type { Client } from '../../../client/Client';

/**
 * @see https://discord.com/developers/docs/resources/emoji#emoji-object
 */
export class GuildEmoji extends Structure {

	/**
	 * The emoji's ID.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The emoji's name (null only in reaction emoji objects).
	 * @since 0.0.1
	 */
	public name!: string | null;

	/**
	 * The roles the emoji is whitelisted to.
	 * @since 0.0.1
	 */
	public roleIDs!: string[];

	/**
	 * User that created the emoji.
	 * @since 0.0.1
	 */
	public userID!: string | null;

	/**
	 * Whether or not the emoji must be wrapped in colons.
	 * @since 0.0.1
	 */
	public requireColons!: boolean | null;

	/**
	 * Whether or not the emoji is managed.
	 * @since 0.0.1
	 */
	public managed!: boolean | null;

	/**
	 * Whether the emoji is animated.
	 * @since 0.0.1
	 */
	public animated!: boolean | null;

	/**
	 * Whether or not the emoji can be used, may be false due to loss of Server Boosts.
	 * @since 0.0.1
	 */
	public available!: boolean;

	/**
	 * The guild the emoji is from.
	 * @since 0.0.1
	 */
	public readonly guild: Guild;

	/**
	 * Whether the emoji is deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIEmojiData, guild: Guild) {
		super(client);
		this.id = data.id as string;
		this.guild = guild;
		this._patch(data);
	}

	/**
	 * The identifier to be used for API requests.
	 * @since 0.0.1
	 */
	public get identifier(): string {
		return this.id ?? encodeURIComponent(this.name as string);
	}

	/**
	 * The emoji as shown in Discord.
	 * @since 0.0.1
	 */
	public toString(): string {
		return this.id ? `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>` : this.name as string;
	}

	/**
	 * Deletes an emoji from the {@link Guild guild}.
	 * @since 0.0.1
	 * @param emojiID The {@link GuildEmoji guild emoji} ID.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/emoji#create-guild-emoji
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.guild.emojis.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	protected _patch(data: APIEmojiData): this {
		this.animated = data.animated ?? null;
		this.managed = data.managed ?? null;
		this.name = data.name;
		this.requireColons = data.require_colons ?? null;
		this.roleIDs = data.roles ?? [];
		this.userID = data.user?.id ?? null;
		this.available = data.available ?? true;
		return this;
	}

}
