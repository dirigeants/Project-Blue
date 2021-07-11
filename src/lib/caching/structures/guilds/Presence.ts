import { Structure } from '../base/Structure';

import type { APIPresenceUpdateData, PresenceUpdateStatus, APIActivityData, APIClientStatusData } from '@klasa/dapi-types';
import type { Client } from '../../../client/Client';

/**
 * @see https://discord.com/developers/docs/topics/gateway#presence
 */
export class Presence extends Structure {

	/**
	 * The member's ID the presence corresponds to.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The member's status.
	 * @since 0.0.1
	 */
	public status!: PresenceUpdateStatus | null;

	/**
	 * The member's platform-dependent status.
	 * @since 0.0.1
	 */
	public clientStatus!: APIClientStatusData | null;

	/**
	 * The member's current activities.
	 * @since 0.0.1
	 */
	public activities!: APIActivityData[];

	public constructor(client: Client, data: APIPresenceUpdateData) {
		super(client);
		this.id = data.user.id;
		this._patch(data);
	}

	protected _patch(data: APIPresenceUpdateData): this {
		this.status = data.status ?? null;
		this.clientStatus = data.client_status ?? null;
		this.activities = data.activities ?? [];
		return this;
	}

}
