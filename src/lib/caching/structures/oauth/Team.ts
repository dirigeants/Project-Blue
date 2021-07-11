import { Cache } from '@klasa/cache';
import { TeamMember } from './TeamMember';

import type { APITeamData } from '@klasa/dapi-types';
import type { ImageURLOptions } from '@klasa/rest';
import type { Client } from '../../../client/Client';

/**
 * @see https://discord.com/developers/docs/topics/teams#data-models-team-object
 */
export class Team {

	/**
	 * The unique id of the team.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * A hash of the image of the team's icon.
	 * @since 0.0.1
	 */
	public icon?: string;

	/**
	 * The members of the team.
	 * @since 0.0.1
	 */
	public members: Cache<string, TeamMember>;

	/**
	 * The user id of the current team owner.
	 * @since 0.0.1
	 */
	public ownerID: string;

	public constructor(public readonly client: Client, data: APITeamData) {
		this.id = data.id;
		this.icon = data.icon;
		this.members = new Cache(data.members.map(member => [member.user.id, new TeamMember(client, member)]));
		this.ownerID = data.owner_user_id;
	}

	/**
	 * The owner of the team
	 * @since 0.0.4
	 */
	public get owner(): TeamMember {
		return this.members.get(this.ownerID) as TeamMember;
	}

	/**
	 * Returns the team's icon url if available.
	 * @param options The image size, format, and other image url options.
	 */
	public iconURL(options?: ImageURLOptions): string | null {
		return this.icon ? this.client.api.cdn.teamIcon(this.id, this.icon, options) : null;
	}

}
