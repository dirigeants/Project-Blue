import { Action, isTextBasedChannel } from '@klasa/core';

import type { ChannelPinsUpdateDispatch } from '@klasa/ws';

export default class CoreAction extends Action {

	/**
	 * Processes the event data from the websocket.
	 * @since 0.0.1
	 * @param data The raw data from {@link Client#ws}
	 */
	public run(data: ChannelPinsUpdateDispatch): void {
		const guild = (data.d.guild_id && this.client.guilds.get(data.d.guild_id)) ?? null;
		const channel = guild ? guild.channels.get(data.d.channel_id) : this.client.dms.get(data.d.channel_id);
		if (!channel || !isTextBasedChannel(channel)) return;

		channel.lastPinTimestamp = data.d.last_pin_timestamp ?? null;

		this.client.emit(this.clientEvent, channel, this.parseDate(data.d.last_pin_timestamp));
	}

	public check(): null {
		return null;
	}

	public build(): null {
		return null;
	}

	public cache(): void {
		// noop
	}

	private parseDate(date: string | undefined): Date | null {
		if (!date) return null;

		const parsed = new Date(date);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

}
