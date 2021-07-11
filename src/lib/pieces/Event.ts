import { Piece, PieceOptions } from './base/Piece';
import { Client, ClientEvents } from '../client/Client';

import type { EventEmitter } from 'events';
import type { EventStore } from './EventStore';

/**
 * The common class for all events.
 */
export abstract class Event extends Piece {

	/**
	 * If this event should only be run once and then unloaded
	 * @since 0.0.1
	 */
	public readonly once: boolean;

	/**
	 * The emitter this event is for
	 * @since 0.0.1
	 */
	public readonly emitter: EventEmitter;

	/**
	 * The event to listen for
	 * @since 0.0.1
	 */
	public readonly event: string;

	/**
	 * Stored bound on method, so it can be properly unlistened to later
	 * @since 0.0.1
	 */
	readonly #listener: Event['run'];

	/**
	 * @since 0.0.1
	 * @param store The store the piece is for
	 * @param directory The base directory to the pieces folder
	 * @param file The path from the pieces folder to the piece file
	 * @param options The options for the piece
	 */
	public constructor(store: EventStore, directory: string, file: readonly string[], options: EventOptions = {}) {
		super(store, directory, file, options);
		this.once = options.once ?? false;
		this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] as EventEmitter : options.emitter) ?? this.client;
		this.event = options.event ?? this.name;
		this.#listener = this.once ? this._runOnce.bind(this) : this._run.bind(this);
	}

	public abstract run(...args: readonly unknown[]): unknown;

	/**
	 * Disables this Event
	 * @since 0.0.1
	 * @chainable
	 */
	public disable(): this {
		this._unlisten();
		return super.disable();
	}

	/**
	 * Enables this Event
	 * @since 0.0.1
	 * @chainable
	 */
	public enable(): this {
		this._listen();
		return super.enable();
	}

	/**
	 * A wrapper for the run method, to easily disable/enable events
	 * @since 0.0.1
	 * @param param The event parameters emitted
	 */
	private async _run(...args: Parameters<Event['run']>): Promise<void> {
		try {
			await this.run(...args);
		} catch (err) {
			this.client.emit(ClientEvents.EventError, this, args, err);
		}
	}

	/**
	 * A wrapper for the _run method for once handling
	 * @since 0.0.1
	 * @param param The event parameters emitted
	 */
	private async _runOnce(...args: Parameters<Event['run']>): Promise<void> {
		await this._run(...args);
		// eslint-disable-next-line dot-notation
		this.store['_onceEvents'].add(this.file[this.file.length - 1]);
		this.unload();
	}

	/**
	 * Attaches the proper listener to the emitter
	 * @since 0.0.1
	 */
	private _listen(): void {
		this.emitter[this.once ? 'once' : 'on'](this.event, this.#listener);
	}

	/**
	 * Removes the listener from the emitter
	 * @since 0.0.1
	 */
	private _unlisten(): void {
		this.emitter.removeListener(this.event, this.#listener);
	}

	/**
	 * Defines the JSON.stringify behavior of this event.
	 */
	public toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			once: this.once,
			event: this.event,
			emitter: this.emitter.constructor.name
		};
	}

}

export interface Event {
	store: EventStore;
}

/**
 * The piece options for all {@link Event} instances.
 */
export interface EventOptions extends PieceOptions {
	/**
	 * Whether or not this event should only be run once and then unloaded
	 */
	once?: boolean;

	/**
	 * The emitter this event should be for (string indicates a client property).
	 */
	emitter?: EventEmitter | keyof Client;

	/**
	 * The event that should be listened to.
	 */
	event?: string;
}
