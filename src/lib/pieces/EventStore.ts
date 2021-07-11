import { Store, PieceConstructor } from './base/Store';
import { Event } from './Event';

import type { Client } from '../client/Client';

/**
 * @since 0.0.1
 * The {@link Event} store.
 */
export class EventStore extends Store<Event> {

	/**
	 * Once events that have already run (so once means once).
	 * @since 0.0.1
	 */
	private readonly _onceEvents = new Set<string>();

	/**
	 * @since 0.0.1
	 * @param client The client this Store was created with
	 */
	public constructor(client: Client) {
		super(client, 'events', Event as PieceConstructor<Event>);
	}

	/**
	 * Loads a piece into Klasa so it can be saved in the store.
	 * @since 0.0.1
	 * @param file A string or array of strings showing where the file is located.
	 * @param core If the file is located in the core directory or not
	 */
	public load(directory: string, file: readonly string[]): Promise<Event | null> {
		if (this._onceEvents.has(file[file.length - 1])) return Promise.resolve(null);
		return super.load(directory, file);
	}

	/**
	 * Clears the events from the store and removes the listeners.
	 * @since 0.0.1
	 */
	public clear(): void {
		for (const event of this.values()) this.remove(event);
	}

	/**
	 * Removes an event from the store.
	 * @since 0.0.1
	 * @param name An event object or a string representing the event name.
	 * @returns Whether or not the removal was successful.
	 */
	public remove(name: Event | string): boolean {
		const event = this.resolve(name);
		if (!event) return false;
		// eslint-disable-next-line dot-notation
		event['_unlisten']();
		return super.remove(event);
	}

	/**
	 * Adds and sets up an event in our store.
	 * @since 0.0.1
	 * @param piece The event piece we are setting up
	 */
	public add(piece: Event): Event | null {
		const event = super.add(piece);
		if (!event) return null;
		// eslint-disable-next-line dot-notation
		event['_listen']();
		return event;
	}

}
