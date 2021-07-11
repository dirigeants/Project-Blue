import { Structure } from './base/Structure';
import { isSet } from '../../util/Util';
import { Client } from '../../client/Client';

import type { APIUserData, APIUserFlags, PremiumType } from '@klasa/dapi-types';
import type { ImageURLOptions } from '@klasa/rest';
import type { DMChannel } from './channels/DMChannel';

/**
 * @see https://discord.com/developers/docs/resources/user#user-object
 */
export class User<T = Client> extends Structure<T> {

	/**
	 * The user's ID.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The user's username, not unique across the platform.
	 * @since 0.0.1
	 */
	public username!: string;

	/**
	 * The user's 4-digit discord-tag.
	 * @since 0.0.1
	 */
	public discriminator!: string;

	/**
	 * The user's avatar hash.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/reference#image-formatting
	 */
	public avatar!: string | null;

	/**
	 * Whether or not the user belongs to an OAuth2 application.
	 * @since 0.0.1
	 */
	public bot!: boolean;

	/**
	 * Whether or not the user is an Official Discord System user (part of the urgent message system).
	 * @since 0.0.1
	 */
	public system?: boolean;

	/**
	 * Whether or not the user has two factor enabled on their account.
	 * @since 0.0.1
	 */
	public mfaEnabled?: boolean;

	/**
	 * The user's chosen language option.
	 * @since 0.0.1
	 */
	public locale?: string;

	/**
	 * Whether or not the email on the user's account has been verified.
	 * @since 0.0.1
	 */
	public verified?: boolean;

	/**
	 * The user's email.
	 * @since 0.0.1
	 */
	public email?: string | null;

	/**
	 * The flags on a user's account.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
	 */
	public flags?: APIUserFlags;

	/**
	 * The type of Nitro subscription on a user's account.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/user#user-object-premium-types
	 */
	public premiumType?: PremiumType;

	/**
	 * The public flags on a user's account.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
	 */
	public publicFlags?: APIUserFlags;

	/**
	 * The id for the last message received from the user
	 * @since 0.0.3
	 */
	public lastMessageID: string | null = null;

	public constructor(client: T, data: APIUserData) {
		super(client);
		this.id = data.id;
		this._patch(data);
	}

	/**
	 * Gets an existing DMChannel from the cache.
	 * @since 0.0.1
	 */
	public get channel(): DMChannel | null {
		if (!(this.client instanceof Client)) throw new Error('DMs can only be opened by bot clients.');
		return this.client.dms.findValue(dm => dm.recipients.includes(this as unknown as User<Client>)) ?? null;
	}

	/**
	 * Returns the user's username and discriminator.
	 * @since 0.0.1
	 */
	public get tag(): string {
		return `${this.username}#${this.discriminator}`;
	}

	/**
	 * Gets or Fetches a DM channel for the user.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/user#create-dm
	 */
	public async openDM(): Promise<DMChannel> {
		if (!(this.client instanceof Client)) throw new Error('DMs can only be opened by bot clients.');
		const existing = this.client.dms.findValue(dm => dm.recipients.includes(this as unknown as User<Client>));
		if (existing) return Promise.resolve(existing);
		return this.client.dms.add(this.id);
	}

	/**
	 * Closes a DM channel for the user if one exists.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#deleteclose-channel
	 */
	public closeDM(): Promise<DMChannel | null> {
		const existing = this.channel;
		return existing ? existing.delete() : Promise.resolve(null);
	}

	/**
	 * Returns the users avatar url.
	 * @param options The image size, format and other options.
	 */
	public avatarURL(options?: ImageURLOptions): string | null {
		if (!this.avatar || !(this.client instanceof Client)) return null;
		return this.client.api.cdn.userAvatar(this.id, this.avatar, options);
	}

	/**
	 * Returns the user's avatar url or the default discord avatar url if they don't have a avatar.
	 * @param options The image size, format and other options.
	 */
	public displayAvatarURL(options?: ImageURLOptions): string | null {
		if (!(this.client instanceof Client)) return null;
		return this.avatar ?
			this.avatarURL(options) :
			this.defaultAvatarURL;
	}

	/**
	 * Returns the default discord avatar url for the user's discriminator.
	 */
	public get defaultAvatarURL(): string | null {
		if (!(this.client instanceof Client)) return null;
		return this.client.api.cdn.defaultAvatar(Number(this.discriminator) % 5);
	}

	/**
	 * Defines toString behavior for users.
	 * @since 0.0.1
	 */
	public toString(): string {
		return `<@${this.id}>`;
	}

	protected _patch(data: APIUserData): this {
		this.username = data.username;
		this.discriminator = data.discriminator;
		this.avatar = data.avatar;
		this.bot = data.bot ?? false;
		if (isSet(data, 'system')) this.system = data.system;
		if (isSet(data, 'mfa_enabled')) this.mfaEnabled = data.mfa_enabled;
		if (isSet(data, 'locale')) this.locale = data.locale;
		if (isSet(data, 'verified')) this.verified = data.verified;
		if (isSet(data, 'email')) this.email = data.email;
		if (isSet(data, 'flags')) this.flags = data.flags;
		if (isSet(data, 'premium_type')) this.premiumType = data.premium_type;
		if (isSet(data, 'public_flags')) this.publicFlags = data.public_flags;

		return this;
	}

}
