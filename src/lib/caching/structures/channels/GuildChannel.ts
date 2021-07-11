import { Routes, RequestOptions } from '@klasa/rest';
import { Channel } from './Channel';
import { OverwriteStore } from '../../stores/OverwriteStore';
import { Permissions, PermissionsFlags } from '../../../util/bitfields/Permissions';
import { GuildChannelInviteStore } from '../../stores/GuildChannelInviteStore';

import type { APIChannelData, APIOverwriteData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from '../guilds/Guild';
import type { GuildMember } from '../guilds/GuildMember';
import type { CategoryChannel } from './CategoryChannel';
import type { Role } from '../guilds/Role';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export abstract class GuildChannel extends Channel {

	/**
	 * The name of the channel (2-100 characters).
	 * @since 0.0.1
	 */
	public name!: string;

	/**
	 * Sorting position of the channel.
	 * @since 0.0.1
	 */
	public position!: number;

	/**
	 * Id of the parent category for a channel (each parent category can contain up to 50 channels).
	 * @since 0.0.1
	 */
	public parentID!: string | null;

	/**
	 * Explicit permission overwrites for members and roles.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#overwrite-object
	 */
	public permissionOverwrites!: OverwriteStore;

	/**
	 * The {@link GuildChannelInviteStore invites} store for the channel.
	 * @since 0.0.3
	 */
	public readonly invites: GuildChannelInviteStore;

	/**
	 * The {@link Guild guild} the channel belongs to.
	 * @since 0.0.1
	 */
	public readonly guild: Guild;

	public constructor(client: Client, data: APIChannelData, guild: Guild | null = null) {
		super(client, data);
		this.guild = guild ?? client.guilds.get(data.guild_id as string) as Guild;

		const filterGuildInvites = this.guild.invites.filter(i => i.channel.id === this.id).keys();
		this.invites = new GuildChannelInviteStore(this, [...filterGuildInvites]);
	}

	/**
	 * The parent {@type CategoryChannel channel} for the channel.
	 * @since 0.0.1
	 */
	public get parent(): CategoryChannel | null {
		return (this.parentID && this.guild.channels.get(this.parentID) as CategoryChannel) || null;
	}

	/**
	 * If the overwrites are synced to the parent channel.
	 * @since 0.0.1
	 */
	public get synced(): boolean | null {
		const { parent } = this;
		if (!parent) return null;
		if (this.permissionOverwrites.size !== parent.permissionOverwrites.size) return false;
		return this.permissionOverwrites.every((value, key) => {
			const overwrite = parent.permissionOverwrites.get(key);
			return overwrite !== undefined && overwrite.deny.equals(value.deny) && overwrite.allow.equals(value.allow);
		});
	}

	/**
	 * If the client can delete the channel.
	 * @since 0.0.1
	 */
	public get deletable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has(Permissions.FLAGS[PermissionsFlags.ManageChannels]) ?? null;
	}

	/**
	 * If the client can view the channel.
	 * @since 0.0.1
	 */
	public get viewable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has(Permissions.FLAGS[PermissionsFlags.ViewChannel]) ?? null;
	}

	/**
	 * If the client can manage the channel.
	 * @since 0.0.1
	 */
	public get manageable(): boolean | null {
		return this.guild.me?.permissionsIn(this).has([Permissions.FLAGS[PermissionsFlags.ViewChannel], Permissions.FLAGS[PermissionsFlags.ManageChannels]]) ?? null;
	}

	/**
	 * Checks what permissions a {@link GuildMember member} or {@link Role role} has in the {@link GuildChannel channel}
	 * @param target The guild member or role you are checking permissions for
	 * @param guildScope If we should take into account guild scoped permissions, or just overwrites
	 */
	public permissionsFor(target: GuildMember | Role, guildScope = true): Readonly<Permissions> {
		return target.permissionsIn(this, guildScope);
	}

	/**
	 * Deletes the channel from the {@link Guild guild}.
	 * @since 0.0.1
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/channel#deleteclose-channel
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.guild.channels.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	/**
	 * Modifies the channel.
	 * @param data The channel modify options.
	 * @param requestOptions The request options.
	 * @since 0.0.1
	 */
	public async modify(data: ChannelModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		const result = await this.client.api.patch(Routes.channel(this.id), { ...requestOptions, data }) as APIChannelData;
		return this._patch(result);
	}

	/**
	 * Syncs the permission overwrites with the parent channel.
	 * @param requestOptions The additional request options.
	 * @since 0.0.1
	 */
	public syncPermissions(requestOptions: RequestOptions = {}): Promise<this> {
		const { parent } = this;
		if (!parent) return Promise.reject(new Error('This channel does not have a parent channel to sync permissions from.'));
		const overwrites = parent.permissionOverwrites.map(({ id, type, allow, deny }) => ({ id, type, allow: allow.bitfield, deny: deny.bitfield }));
		// eslint-disable-next-line camelcase
		return this.modify({ permission_overwrites: overwrites }, requestOptions);
	}

	protected _patch(data: APIChannelData): this {
		this.name = data.name as string;
		this.position = data.position as number;
		this.parentID = data.parent_id as string | null;

		if (!this.permissionOverwrites) this.permissionOverwrites = new OverwriteStore(this.client, this);

		const overwrites = data.permission_overwrites ?? [];
		const existingOverwrites = this.permissionOverwrites.clone();
		this.permissionOverwrites.clear();

		for (const overwrite of overwrites) {
			const existing = existingOverwrites.findValue((ovr) => ovr.id === overwrite.id);

			if (existing) {
				this.permissionOverwrites.set(existing.id, existing);
				existingOverwrites.delete(existing.id);
			}
			// eslint-disable-next-line dot-notation
			this.permissionOverwrites['_add'](overwrite);
		}

		for (const overwrite of existingOverwrites.values()) overwrite.deleted = true;

		return this;
	}

}

/* eslint-disable camelcase */

export interface ChannelModifyOptions {
	name?: string;
	position?: number | null;
	permission_overwrites?: APIOverwriteData[] | null;
}

/* eslint-disable camelcase */
