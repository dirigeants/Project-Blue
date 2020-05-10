import { Event, EventOptions } from './Event';

import type { ActionStore } from './ActionStore';
import type { EventStore } from './EventStore';
import type { DispatchPayload } from '@klasa/ws';
import type { Structure } from '../../client/caching/structures/base/Structure';

/**
 * The common class for all actions.
 */
export abstract class Action<T extends DispatchPayload = DispatchPayload, S extends Structure = Structure> extends Event {

	/**
	 * The name of the event from {@link Client} to be fired.
	 * @since 0.0.1
	 */
	public readonly publicEvent: string;

	/**
	 * @since 0.0.1
	 * @param store The store this piece is for
	 * @param directory The base directory to the pieces folder
	 * @param file The path from the pieces folder to the piece file
	 * @param options The options for this piece
	 */
	public constructor(store: ActionStore, directory: string, file: readonly string[], options: ActionOptions = {}) {
		super(store as unknown as EventStore, directory, file, { ...options, once: false, emitter: 'ws' });
		this.publicEvent = options.publicEvent ?? '';
	}

	/**
	 * Processes the event data from the websocket.
	 * @since 0.0.1
	 * @param data The raw data from {@link Client#ws}
	 */
	public run(data: T): void {
		const struct = this.check(data);
		if (struct) {
			// eslint-disable-next-line dot-notation
			struct['_patch'](data.d);
			return;
		}

		const built = this.build(data);
		if (built) {
			this.cache(built);
			this.client.emit(this.publicEvent, built);
		}
	}

	/**
	 * Checks whether or not the data structure was already cached, returning it when it does.
	 * @since 0.0.1
	 * @param data The raw data from {@link Client#ws}
	 */
	public abstract check(data: T): S | null;

	/**
	 * Builds the structure from raw data.
	 * @param data The raw data from {@link Client#ws}
	 */
	public abstract build(data: T): S | null;

	/**
	 * Stores the data into the cache.
	 * @param data The build structure from {@link Action#build} to be cached
	 */
	public abstract cache(data: S): void;

}

/**
 * The piece options for all {@link Action} instances.
 */
export interface ActionOptions extends EventOptions {
	/**
	 * The name of the event from {@link Client} to be fired.
	 */
	publicEvent?: string;

	/**
	 * @internal
	 */
	once?: never;

	/**
	 * @internal
	 */
	emitter?: never;
}
