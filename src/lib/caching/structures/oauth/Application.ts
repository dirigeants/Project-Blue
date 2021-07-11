import { Routes, ImageURLOptions } from '@klasa/rest';
import { Team } from './Team';

import type { APIOauthData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from '../guilds/Guild';
import type { User } from '../User';

/**
 * @see https://discord.com/developers/docs/topics/oauth2#get-current-application-information-response-structure
 */
export class Application {

	/**
	 * The id of the app.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The name of the app.
	 * @since 0.0.1
	 */
	public name: string;

	/**
	 * The icon hash of the app.
	 * @since 0.0.1
	 */
	public icon?: string;

	/**
	 * The description of the app.
	 * @since 0.0.1
	 */
	public description: string;

	/**
	 * An array of rpc origin urls, if rpc is enabled.
	 * @since 0.0.1
	 */
	public rpcOrigins: string[];

	/**
	 * When false only app owner can join the app's bot to guilds.
	 * @since 0.0.1
	 */
	public botPublic: boolean;

	/**
	 * When true the app's bot will only join upon completion of the full oauth2 code grant flow.
	 * @since 0.0.1
	 */
	public botRequireCodeGrant: boolean;

	/**
	 * Partial user object containing info on the owner of the application.
	 * @since 0.0.1
	 */
	public owner: User;

	/**
	 * If the application is a game sold on Discord, this field will be the summary field for the store page of its primary sku.
	 * @since 0.0.1
	 */
	public summary: string;

	/**
	 * The base64 encoded key for the GameSDK's GetTicket.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/game-sdk/applications#get-ticket
	 */
	public verifyKey: string;

	/**
	 * If the application belongs to a team, this will be a list of the members of that team.
	 * @since 0.0.1
	 */
	public team: Team | null;

	/**
	 * If the application is a game sold on Discord, this field will be the guild to which it has been linked.
	 * @since 0.0.1
	 */
	public guildID: string | null;

	/**
	 * If the application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists.
	 * @since 0.0.1
	 */
	public primarySkuID: string | null;

	/**
	 * If the application is a game sold on Discord, this field will be the URL slug that links to the store page.
	 * @since 0.0.1
	 */
	public slug: string | null;

	/**
	 * If the application is a game sold on Discord, this field will be the hash of the image on store embeds.
	 * @since 0.0.1
	 */
	public coverImage: string | null;

	public constructor(public readonly client: Client, data: APIOauthData) {
		this.id = data.id;
		this.name = data.name;
		this.icon = data.icon;
		this.description = data.description;
		this.rpcOrigins = data.rpc_origins ?? [];
		this.botPublic = data.bot_public;
		this.botRequireCodeGrant = data.bot_require_code_grant;
		// eslint-disable-next-line dot-notation
		this.owner = this.client.users['_add'](data.owner);
		this.summary = data.summary;
		this.verifyKey = data.verify_key;
		this.team = data.team ? new Team(client, data.team) : null;
		this.guildID = data.guild_id ?? null;
		this.primarySkuID = data.primary_sku_id ?? null;
		this.slug = data.slug ?? null;
		this.coverImage = data.cover_image ?? null;
	}

	/**
	 * The guild for the application if applicable.
	 * @since 0.0.4
	 */
	public get guild(): Guild | null {
		return this.guildID !== null ? this.client.guilds.get(this.guildID) ?? null : null;
	}

	/**
	 * Returns the application icon url if available.
	 * @param options The image size, format, and other image url options.
	 */
	public iconURL(options?: ImageURLOptions): string | null {
		return this.icon ? this.client.api.cdn.appIcon(this.id, this.icon, options) : null;
	}

	/**
	 * Returns an {@link Application application}.
	 * @since 0.0.1
	 * @param client The {@link Client client} that will manage the created object.
	 * @see https://discord.com/developers/docs/topics/oauth2#get-current-application-information
	 */
	public static async fetch(client: Client): Promise<Application> {
		const data = await client.api.get(Routes.oauthApplication()) as APIOauthData;
		return new this(client, data);
	}

}
