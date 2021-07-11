import { Routes, RequestOptions } from '@klasa/rest';
import { URL } from 'url';

import type { APIGuildWidgetData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from './Guild';
import type { GuildBasedChannel } from '../../../util/Util';

/**
 * @see https://discord.com/developers/docs/resources/guild#guild-widget-object
 */
export class GuildWidget {

	/**
	 * The {@link Client client} the widget belongs to.
	 * @since 0.0.1
	 */
	public readonly client: Client;

	/**
	 * The {@link Guild guild} the widget belongs to.
	 * @since 0.0.1
	 */
	public readonly guild: Guild;

	/**
	 * Whether the widget is enabled, it will be null in the initial state.
	 * @since 0.0.1
	 */
	public enabled!: boolean | null;

	/**
	 * The widget {@link Channel channel} ID.
	 * @since 0.0.1
	 */
	public channelID!: string | null;

	public constructor(data: WidgetData, guild: Guild) {
		this.client = guild.client;
		this.guild = guild;
		this._patch(data);
	}

	/**
	 * The widget {@link Channel channel}.
	 * @since 0.0.1
	 */
	public get channel(): GuildBasedChannel | null {
		return this.channelID ? this.guild.channels.get(this.channelID) ?? null : null;
	}

	/**
	 * Returns a PNG image URL representing the image widget of the guild.
	 * @since 0.0.1
	 * @param options The options for the widget image.
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-image
	 */
	public getImageURL(options?: WidgetImageOptions): string {
		const path = Routes.guildWidgetImage(this.guild.id);
		const url = new URL(`https://discord.com/api${path}`);
		if (options) for (const [key, value] of Object.entries(options)) url.searchParams.append(key, value);
		return url.toString();
	}

	/**
	 * Returns the updated {@link Guild guild} widget.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-widget
	 */
	public async fetch(): Promise<this> {
		const entry = await this.client.api.get(Routes.guildWidget(this.guild.id)) as APIGuildWidgetData;
		return this._patch(entry);
	}

	/**
	 * Modifies the {@link Guild guild}'s widget.
	 * @since 0.0.1
	 * @param data The new data for the widget.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#modify-guild-widget
	 */
	public async modify(data: APIGuildWidgetData, requestOptions: RequestOptions = {}): Promise<this> {
		const updated = await this.client.api.patch(Routes.guildWidget(this.guild.id), { ...requestOptions, data }) as APIGuildWidgetData;
		return this._patch(updated);
	}

	public toJSON(): boolean {
		return !!this.enabled;
	}

	protected _patch(data: WidgetData): this {
		this.enabled = data.enabled;
		this.channelID = data.channel_id;
		return this;
	}

}

interface WidgetData extends Omit<APIGuildWidgetData, 'enabled'> {
	enabled: boolean | null;
}

/**
 * The options for the widget image.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-image-query-string-params
 */
export interface WidgetImageOptions {
	/**
	 * Style of the widget image returned.
	 * @since 0.0.1
	 * @default WidgetStyle.Shield
	 */
	style?: WidgetStyle;
}

/**
 * The widget style options.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options
 */
export enum WidgetStyle {
	/**
	 * shield style widget with Discord icon and guild members online count
	 * @since 0.0.1
	 * @see https://discord.com/api/guilds/81384788765712384/widget.png?style=shield
	 */
	Shield = 'shield',

	/**
	 * large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget
	 * @since 0.0.1
	 * @see https://discord.com/api/guilds/81384788765712384/widget.png?style=banner1
	 */
	Banner1 = 'banner1',

	/**
	 * smaller widget style with guild icon, name and online count. Split on the right with Discord logo
	 * @since 0.0.1
	 * @see https://discord.com/api/guilds/81384788765712384/widget.png?style=banner2
	 */
	Banner2 = 'banner2',

	/**
	 * large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right
	 * @since 0.0.1
	 * @see https://discord.com/api/guilds/81384788765712384/widget.png?style=banner3
	 */
	Banner3 = 'banner3',

	/**
	 * large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget and a "JOIN MY SERVER" button at the bottom
	 * @since 0.0.1
	 * @see https://discord.com/api/guilds/81384788765712384/widget.png?style=banner4
	 */
	Banner4 = 'banner4'
}
