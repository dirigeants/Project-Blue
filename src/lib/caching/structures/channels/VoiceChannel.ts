import { ChannelType, APIChannelData } from '@klasa/dapi-types';
import { GuildChannel, ChannelModifyOptions } from './GuildChannel';

import type { RequestOptions } from '@klasa/rest';
import { Permissions, PermissionsFlags } from '../../../util/bitfields/Permissions';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export class VoiceChannel extends GuildChannel {

	/**
	 * The type of channel.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	public readonly type = ChannelType.GuildVoice;

	/**
	 * The bitrate (in bits) of the voice channel.
	 * @since 0.0.1
	 */
	public bitrate!: number;

	/**
	 * The user limit of the voice channel.
	 * @since 0.0.1
	 */
	public userLimit!: number;

	/**
	 * If the client can delete the channel.
	 * @since 0.0.1
	 */
	public get deletable(): boolean | null {
		return !this.deleted && this.manageable;
	}

	/**
	 * If the client can manage the channel.
	 * @since 0.0.1
	 */
	public get manageable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has([
			Permissions.FLAGS[PermissionsFlags.Connect],
			Permissions.FLAGS[PermissionsFlags.ViewChannel],
			Permissions.FLAGS[PermissionsFlags.ManageChannels]
		]) ?? null;
	}

	/**
	 * Modifies the channel.
	 * @param data The channel modify options.
	 * @param requestOptions The request options.
	 * @since 0.0.1
	 */
	public modify(data: VoiceChannelModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		return super.modify(data, requestOptions);
	}

	protected _patch(data: APIChannelData): this {
		this.bitrate = data.bitrate as number;
		this.userLimit = data.user_limit as number;
		return super._patch(data);
	}

}

/* eslint-disable camelcase */

export interface VoiceChannelModifyOptions extends ChannelModifyOptions {
	bitrate?: number | null;
	user_limit?: number | null;
	parent_id?: string | null;
}

/* eslint-enable camelcase */
