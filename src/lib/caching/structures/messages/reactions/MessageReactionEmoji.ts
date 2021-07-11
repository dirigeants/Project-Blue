import type { APIEmojiPartial } from '@klasa/dapi-types';
import type { Client } from '../../../../client/Client';

/**
 * @see https://discord.com/developers/docs/resources/emoji#emoji-object
 */
export class MessageReactionEmoji implements APIEmojiPartial {

	/**
	 * The emoji's ID.
	 * @since 0.0.1
	 */
	public readonly id: string | null;

	/**
	 * Emoji name.
	 * @since 0.0.1
	 */
	public readonly name: string | null;

	/**
	 * Whether the emoji is animated.
	 * @since 0.0.1
	 */
	public readonly animated: boolean;

	public constructor(public readonly client: Client, data: APIEmojiPartial) {
		this.id = data.id;
		this.name = data.name;
		this.animated = data.animated ?? false;
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
	 * Defines the JSON.stringify behavior of this structure.
	 * @since 0.0.1
	 */
	public toJSON(): Record<string, unknown> {
		return {
			id: this.id,
			name: this.name,
			animated: this.animated
		};
	}

}
