import { Cache } from '@klasa/cache';

import type { Message } from './Message';
import type { APIMessageMentionChannelData, APIChannelData, APIMessageMentionData } from '@klasa/dapi-types';
import type { User } from '../User';
import type { Guild } from '../guilds/Guild';

export class MessageMentions {

	/**
	 * The {@link Message} the mentions belong to.
	 * @since 0.0.1
	 */
	public readonly message: Message;

	/**
	 * Users specifically mentioned in the message.
	 * @since 0.0.1
	 */
	public readonly users: Cache<string, User>;

	/**
	 * Roles specifically mentioned in the message.
	 * @since 0.0.1
	 */
	public readonly roles: Cache<string, string>;

	/**
	 * Channels specifically mentioned in the message.
	 * @since 0.0.1
	 */
	public readonly channels: Cache<string, APIChannelData>;

	/**
	 * Whether the message mentions everyone.
	 * @since 0.0.1
	 */
	public readonly everyone: boolean;

	public constructor(message: Message, users: APIMessageMentionData[], roles: string[], channels: APIMessageMentionChannelData[], everyone: boolean) {
		this.message = message;
		this.users = new Cache();
		this.roles = new Cache();
		this.channels = new Cache();

		if (users) {
			for (const mention of users) {
				// eslint-disable-next-line dot-notation
				const user = this.message.client.users['_add'](mention);
				this.users.set(user.id, user);

				if (mention.member) {
					// eslint-disable-next-line dot-notation
					(this.message.guild as Guild).members['_add']({ ...mention.member, user });
				}
			}
		}

		// Just for now why there is no role store setup
		if (roles) for (const role of roles) this.roles.set(role, role);
		if (channels) for (const mention of channels) this.channels.set(mention.id, mention);

		this.everyone = Boolean(everyone);
	}

	public toJSON(): Record<string, unknown> {
		return {
			message: this.message.id,
			users: [...this.users.keys()],
			roles: [...this.roles.keys()],
			channels: [...this.channels.keys()],
			everyone: this.everyone
		};
	}

}
