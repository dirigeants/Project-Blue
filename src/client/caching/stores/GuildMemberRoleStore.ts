import { ProxyCache } from '@klasa/cache';
import { Routes } from '@klasa/rest';

import type { GuildMember } from '../structures/guilds/GuildMember';
import type { Role } from '../structures/guilds/Role';
import type { Guild } from '../structures/guilds/Guild';
import type { Client } from '../../Client';

export class GuildMemberRoleStore extends ProxyCache<string, Role> {

	public readonly member: GuildMember;

	public constructor(store: Map<string, Role>, keys: string[], member: GuildMember) {
		super(store, keys);
		this.member = member;
	}

	public get client(): Client {
		return this.member.client;
	}

	public get guild(): Guild {
		return this.member.guild;
	}

	/**
	 * Adds a {@link Role role} to the {@link GuildMember member}.
	 * @since 0.0.1
	 * @param roleID The {@link Role role} ID to add.
	 * @see https://discord.com/developers/docs/resources/guild#add-guild-member-role
	 */
	public async add(roleID: string): Promise<this> {
		const endpoint = Routes.guildMemberRole(this.guild.id, this.member.id, roleID);
		await this.client.api.put(endpoint);
		return this;
	}

	/**
	 * Removes a {@link Role role} from the {@link GuildMember member}.
	 * @since 0.0.1
	 * @param roleID The {@link Role role} ID to remove.
	 * @see https://discord.com/developers/docs/resources/guild#remove-guild-member-role
	 */
	public async remove(roleID: string): Promise<this> {
		const endpoint = Routes.guildMemberRole(this.guild.id, this.member.id, roleID);
		await this.client.api.delete(endpoint);
		return this;
	}

}