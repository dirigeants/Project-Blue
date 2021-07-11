import { Routes, RequestOptions } from '@klasa/rest';
import { Structure } from '../base/Structure';
import { Permissions, PermissionsFlags } from '../../../util/bitfields/Permissions';

import type { APIRoleData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { Guild } from './Guild';
import type { GuildChannel } from '../channels/GuildChannel';

/**
 * @see https://discord.com/developers/docs/topics/permissions#role-object
 */
export class Role extends Structure {

	/**
	 * The {@link Guild guild} this role belongs to.
	 * @since 0.0.1
	 */
	public readonly guild: Guild;

	/**
	 * The role's ID.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The role's name.
	 * @since 0.0.1
	 */
	public name!: string;

	/**
	 * The role's integer representation of hexadecimal color code.
	 * @since 0.0.1
	 */
	public color!: number;

	/**
	 * Whether or not the role is pinned in the user listing.
	 * @since 0.0.1
	 */
	public hoist!: boolean;

	/**
	 * The role's position.
	 * @since 0.0.1
	 */
	public position!: number;

	/**
	 * The role's permissions.
	 * @since 0.0.1
	 */
	public permissions!: Readonly<Permissions>;

	/**
	 * Whether or not the role is managed by an integration.
	 * @since 0.0.1
	 */
	public readonly managed!: boolean;

	/**
	 * Whether or not the role is mentionable.
	 * @since 0.0.1
	 */
	public mentionable!: boolean;

	/**
	 * Whether the role is deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIRoleData, guild: Guild) {
		super(client);
		this.id = data.id;
		this.managed = data.managed;
		this.guild = guild;
		this._patch(data);
	}

	/**
	 * Checks permissions for the role in a given channel.
	 * @param channel The channel to check permissions in
	 * @param guildScope If we should take into account guild scoped permissions, or just overwrites
	 */
	public permissionsIn(channel: GuildChannel, guildScope = true): Readonly<Permissions> {
		const { permissions } = this;

		if (permissions.has(Permissions.FLAGS[PermissionsFlags.Administrator])) return new Permissions(Permissions.ALL).freeze();

		const guildScopePermissions = guildScope ? permissions.mask(Permissions.GUILD_SCOPE_PERMISSIONS) : 0;
		const overwrites = channel.permissionOverwrites.for(this);

		return permissions
			.remove(overwrites.everyone ? overwrites.everyone.deny : 0)
			.add(overwrites.everyone ? overwrites.everyone.allow : 0)
			.remove(overwrites.role ? overwrites.role.deny : 0)
			.add(overwrites.role ? overwrites.role.allow : 0)
			.add(guildScopePermissions)
			.freeze();
	}

	/**
	 * Modifies the role's settings.
	 * @since 0.0.1
	 * @param data The new settings for the role.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#modify-guild-role
	 */
	public async modify(data: RoleModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		const entry = await this.client.api.patch(Routes.guildRole(this.guild.id, this.id), { ...requestOptions, data }) as APIRoleData;
		return this._patch(entry);
	}

	/**
	 * Deletes the role from the {@link Guild guild}.
	 * @since 0.0.1
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#delete-guild-role
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.guild.roles.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	/**
	 * Adds the role to a {@link GuildMember member} by its id.
	 * @since 0.0.4
	 * @param memberID The id of the member you want to add the role.
	 * @see https://discord.com/developers/docs/resources/guild#add-guild-member-role
	 */
	public async addTo(memberID: string): Promise<this> {
		await this.client.api.put(Routes.guildMemberRole(this.guild.id, memberID, this.id));
		return this;
	}

	/**
	 * Removes the role from a {@link GuildMember member} by its id.
	 * @since 0.0.4
	 * @param memberID The id of the member you want to remove the role.
	 * @see https://discord.com/developers/docs/resources/guild#remove-guild-member-role
	 */
	public async removeFrom(memberID: string): Promise<this> {
		await this.client.api.delete(Routes.guildMemberRole(this.guild.id, memberID, this.id));
		return this;
	}

	/**
	 * Defines the toString behavior of roles.
	 * @since 0.0.4
	 */
	public toString(): string {
		return `<@&${this.id}>`;
	}

	protected _patch(data: APIRoleData): this {
		this.name = data.name;
		this.color = data.color;
		this.hoist = data.hoist;
		this.position = data.position;
		this.permissions = new Permissions(data.permissions).freeze();
		this.mentionable = data.mentionable;
		return this;
	}

}

/**
 * The options for {@link Role#modify}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params
 */
export interface RoleModifyOptions {
	/**
	 * Name of the role.
	 * @since 0.0.1
	 */
	name?: string | null;

	/**
	 * Bitwise value of the enabled/disabled permissions.
	 * @since 0.0.1
	 */
	permissions?: number | null;

	/**
	 * RGB color value
	 * @since 0.0.1
	 */
	color?: number | null;

	/**
	 * Whether the role should be displayed separately in the sidebar
	 * @since 0.0.1
	 */
	hoist?: boolean | null;

	/**
	 * Whether the role should be mentionable
	 * @since 0.0.1
	 */
	mentionable?: boolean | null;
}
