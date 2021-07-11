import type { APITeamMember, TeamMembershipState } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';
import type { User } from '../User';

/**
 * @see https://discord.com/developers/docs/topics/teams#data-models-team-members-object
 */
export class TeamMember {

	/**
	 * The user's membership state on the team.
	 * @since 0.0.1
	 */
	public membershipState: TeamMembershipState;

	/**
	 * Will always be ["*"].
	 * @since 0.0.1
	 */
	public permissions: string[];

	/**
	 * The {@link User} of the team member.
	 * @since 0.0.4
	 */
	public user: User;

	public constructor(public readonly client: Client, data: APITeamMember) {
		this.membershipState = data.membership_state;
		this.permissions = data.permissions;
		// eslint-disable-next-line dot-notation
		this.user = this.client.users['_add'](data.user);
	}

	/**
	 * The {@link User} ID.
	 * @since 0.0.1
	 */
	public get id(): string {
		return this.user.id;
	}

	/**
	 * Defines toString behavior for team members.
	 * @since 0.0.1
	 */
	public toString(): string {
		return this.user.toString();
	}

}
