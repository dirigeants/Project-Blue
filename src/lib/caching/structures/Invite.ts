import { Structure } from './base/Structure';

import type { APIInviteData, InviteTargetUserType } from '@klasa/dapi-types';
import type { Client } from '../../client/Client';
import type { Guild } from './guilds/Guild';
import type { Channel } from './channels/Channel';
import type { User } from './User';

/**
 * @see https://discord.com/developers/docs/resources/invite#invite-object
 */
export class Invite extends Structure {

	/**
	 * The invite code.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The guild the invite is for.
	 * @since 0.0.1
	 */
	public readonly guild: Guild | null;

	/**
	 * The channel the invite is for.
	 * @since 0.0.1
	 */
	public readonly channel: Channel;

	/**
	 * The user who created the invite.
	 * @since 0.0.1
	 */
	public inviter!: User | null;

	/**
	 * The target user for the invite.
	 * @since 0.0.1
	 */
	public targetUser!: User | null;

	/**
	 * The type of user target for the invite.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/invite#invite-object-target-user-types
	 */
	public targetUserType!: InviteTargetUserType | null;

	/**
	 * Approximate count of online members (only present when `target_user` is set).
	 * @since 0.0.1
	 */
	public approximatePresenceCount!: number | null;

	/**
	 * Approximate count of total members.
	 * @since 0.0.1
	 */
	public approximateMemberCount!: number | null;

	public constructor(client: Client, data: APIInviteData, channel: Channel, guild?: Guild) {
		super(client);

		this.id = data.code;
		this.channel = channel;
		this.guild = guild ?? null;
		this._patch(data);
	}

	protected _patch(data: APIInviteData): this {
		this.inviter = (data.inviter && this.client.users.get(data.inviter.id)) ?? null;
		this.targetUser = (data.target_user && this.client.users.get(data.target_user.id)) ?? null;
		this.targetUserType = data.target_user_type ?? null;
		this.approximatePresenceCount = data.approximate_presence_count ?? null;
		this.approximateMemberCount = data.approximate_member_count ?? null;
		return this;
	}

}
