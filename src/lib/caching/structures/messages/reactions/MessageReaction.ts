import { MessageReactionEmoji } from './MessageReactionEmoji';
import { Structure } from '../../base/Structure';
import { MessageReactionUserStore } from '../../../stores/MessageReactionUserStore';

import type { APIReactionData } from '@klasa/dapi-types';
import type { Message } from '../Message';
import type { Client } from '../../../../client/Client';

/**
 * @see https://discord.com/developers/docs/resources/channel#reaction-object
 */
export class MessageReaction extends Structure {

	/**
	 * The reaction ID.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * Whether or not the current user reacted using this emoji.
	 * @since 0.0.1
	 */
	public me!: boolean;

	/**
	 * Times this emoji has been used to react.
	 * @since 0.0.1
	 */
	public count!: number;

	/**
	 * Emoji information.
	 * @since 0.0.1
	 */
	public readonly emoji: MessageReactionEmoji;

	/**
	 * The users that reacted to this emoji.
	 * @since 0.0.1
	 */
	public readonly users: MessageReactionUserStore;

	/**
	 * The {@link Message message} instance the reaction is tied to.
	 * @since 0.0.1
	 */
	public readonly message: Message;

	public constructor(client: Client, data: APIReactionData, message: Message) {
		super(client);
		this.id = data.emoji.id ?? data.emoji.name as string;
		this.message = message;
		this.emoji = new MessageReactionEmoji(client, data.emoji);
		this.users = new MessageReactionUserStore(this);
		this._patch(data);
	}

	/**
	 * The emoji as shown in Discord.
	 * @since 0.0.1
	 */
	public toString(): string {
		return this.emoji.toString();
	}

	/**
	 * Defines the JSON.stringify behavior of message reactions.
	 * @since 0.0.1
	 */
	public toJSON(): Record<string, unknown> {
		return {
			me: this.me,
			count: this.count,
			emoji: this.emoji.toJSON()
		};
	}

	protected _patch(data: APIReactionData): this {
		this.me = data.me;
		this.count = data.count;
		return this;
	}

}
