import { Event, EventOptions } from './Event';
import { snakeToCamel } from '../util/Util';

import type { ActionStore } from './ActionStore';
import type { EventStore } from './EventStore';
import type { DispatchPayload } from '@klasa/ws';
import type { Structure } from '../caching/structures/base/Structure';

/**
 * The common class for all actions.
 */
export abstract class Action<T extends DispatchPayload = DispatchPayload, S extends Structure = Structure> extends Event {

	/**
	 * The name of the event that the {@link Client} will fire.
	 * @since 0.0.1
	 */
	public readonly clientEvent: string;

	/**
	 * @since 0.0.1
	 * @param store The store the piece is for
	 * @param directory The base directory to the pieces folder
	 * @param file The path from the pieces folder to the piece file
	 * @param options The options for the piece
	 */
	public constructor(store: ActionStore, directory: string, file: readonly string[], options: ActionOptions = {}) {
		super(store as unknown as EventStore, directory, file, { ...options, once: false, emitter: 'ws' });
		this.clientEvent = options.clientEvent ?? snakeToCamel(this.event);
	}

	/**
	 * Processes the event data from the websocket.
	 * @since 0.0.1
	 * @param data The raw data from {@link Client#ws}
	 */
	public run(data: T): unknown {
		const struct = this.check(data);
		if (struct) {
			const previous = struct.clone();
			// eslint-disable-next-line dot-notation
			struct['_patch'](data.d);

			// We emit the patched then the previous data so created events, which
			// will always fail in this check, consistently emit the new data as
			// first argument.
			this.client.emit(this.clientEvent, struct, previous);
			return;
		}

		const built = this.build(data);
		if (built) {
			this.cache(built);
			this.client.emit(this.clientEvent, built);
		}
	}

	/**
	 * Checks whether or not the data structure was already cached, returning it if it was.
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
	clientEvent?: string;

	/**
	 * @internal
	 */
	once?: never;

	/**
	 * @internal
	 */
	emitter?: never;
}
