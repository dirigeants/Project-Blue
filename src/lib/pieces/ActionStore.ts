import { Store, PieceConstructor } from './base/Store';
import { Action } from './Action';

import type { Client } from '../client/Client';

/**
 * @since 0.0.1
 * The {@link Action} store.
 */
export class ActionStore extends Store<Action> {

	/**
	 * @since 0.0.1
	 * @param client The client the Store was created with
	 */
	public constructor(client: Client) {
		super(client, 'actions', Action as PieceConstructor<Action>);
	}

	/**
	 * Clears the actions from the store and removes the listeners.
	 * @since 0.0.1
	 */
	public clear(): void {
		for (const event of this.values()) this.remove(event);
	}

	/**
	 * Removes an action from the store.
	 * @since 0.0.1
	 * @param name An action object or a string representing the action name.
	 * @returns Whether or not the removal was successful.
	 */
	public remove(name: Action | string): boolean {
		const event = this.resolve(name);
		if (!event) return false;
		// eslint-disable-next-line dot-notation
		event['_unlisten']();
		return super.remove(event);
	}

	/**
	 * Adds and sets up an action in our store.
	 * @since 0.0.1
	 * @param piece The event piece we are setting up
	 */
	public add(piece: Action): Action | null {
		const event = super.add(piece);
		if (!event) return null;
		// eslint-disable-next-line dot-notation
		event['_listen']();
		return event;
	}

}
