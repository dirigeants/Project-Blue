/* eslint-disable no-dupe-class-members */
import { OpCodes } from '@klasa/ws';
import { Presence } from '../guilds/Presence';
import { PresenceBuilder, StatusUpdateData } from './PresenceBuilder';

/**
 * The {@link Presence presence} for the {@link ClientUser client user}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/topics/gateway#presence
 */
export class ClientPresence extends Presence {

	/**
	 * Sets the client presence.
	 * @since 0.0.1
	 * @param presence The presence data to be sent.
	 * @see https://discord.com/developers/docs/topics/gateway#update-status
	 */
	public modify(game: StatusUpdateData): this;
	/**
	 * Sets the client presence with a builder, and returns it.
	 * @since 0.0.1
	 * @param builder The builder to aid building the game.
	 */
	public modify(builder: (presence: PresenceBuilder) => PresenceBuilder): this;
	public modify(presence: StatusUpdateData | ((game: PresenceBuilder) => PresenceBuilder)): this {
		const data = typeof presence === 'function' ? presence(new PresenceBuilder()) : presence;

		for (const shard of this.client.ws.shards.values()) {
			// eslint-disable-next-line id-length
			shard.send({ op: OpCodes.STATUS_UPDATE, d: data });
		}

		return this;
	}

}
