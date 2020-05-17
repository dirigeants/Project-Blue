import { Cache } from '@klasa/cache';

import type { Client } from '../../../Client';
import type { Structure } from '../../structures/base/Structure';
import type { Constructor } from '../../../../util/Extender';

/**
 * The data caches with extra methods unique to each data store
 */
export class DataStore<S extends Structure> extends Cache<string, S> {

	public constructor(public readonly client: Client, protected readonly Holds: Constructor<S>, iterable?: Iterable<S>) {
		super();
		if (iterable) for (const item of iterable) this._add(item);
	}

	/**
	 * Adds a new structure to this DataStore
	 * @param data The data packet to add
	 * @param cache If the data should be cached
	 */
	protected _add(data: { id: string, [k: string]: any }): S {
		const existing = this.get(data.id);
		// eslint-disable-next-line dot-notation
		if (existing) return existing['_patch'](data);

		const entry = new this.Holds(this.client, data);
		if (this.client.options.cache.enabled) this.set(entry.id, entry);
		return entry;
	}

	/**
	 * Resolves data into Structures
	 * @param data The data to resolve
	 */
	public resolve(data: S | string): S | null {
		if (typeof data === 'string') return this.get(data) || null;
		if (data instanceof this.Holds) return data;
		return null;
	}

	/**
	 * Resolves data into ids
	 * @param data The data to resolve
	 */
	public resolveID(data: S | string): string | null {
		if (typeof data === 'string') return data;
		if (data instanceof this.Holds) return data.id;
		return null;
	}

	/**
	 * Defines the extensibility of DataStores
	 */
	public static get [Symbol.species](): typeof Cache {
		return Cache;
	}

}
