import { join, extname, relative, sep } from 'path';
import { scan, ensureDir } from 'fs-nextra';
import { isClass } from '@klasa/utils';
import { Cache } from '@klasa/cache';
import { Client, ClientEvents } from '../../client/Client';

import type { Piece } from './Piece';

export type PieceConstructor<T> = new (...args: ConstructorParameters<typeof Piece>) => T;

/**
 * @since 0.0.1
 * The common base for all stores.
 */
export class Store<V extends Piece> extends Cache<string, V> {

	/**
	 * The client this Store was created with.
	 * @since 0.0.1
	 */
	public readonly client: Client;

	/**
	 * The name of this store.
	 * @since 0.0.1
	 */
	public readonly name: string;

	/**
	 * The type of structure this store holds.
	 * @since 0.0.1
	 */
	public readonly Holds: PieceConstructor<V>;

	/**
	 * The core directories pieces of this store can hold.
	 * @since 0.0.1
	 */
	protected readonly coreDirectories = new Set<string>();

	/**
	 * @since 0.0.1
	 * @param client The client this Store was created with
	 * @param name The name of this store
	 * @param Holds The type of structure this store holds
	 */
	public constructor(client: Client, name: string, Holds: PieceConstructor<V>) {
		super();

		this.client = client;
		this.name = name;
		this.Holds = Holds;
	}

	/**
	 * The directory of local pieces relative to where you run Klasa from.
	 * @since 0.0.1
	 */
	public get userDirectory(): string {
		return join(this.client.userBaseDirectory, this.name);
	}

	/**
	 * Registers a core directory to check for pieces.
	 * @since 0.0.1
	 * @param directory The directory to check for core pieces
	 */
	public registerCoreDirectory(directory: string): this {
		this.coreDirectories.add(join(directory, this.name));
		return this;
	}

	/**
	 * Initializes all pieces in this store.
	 * @since 0.0.1
	 */
	public init(): Promise<Array<any>> {
		return Promise.all(this.map(piece => piece.enabled ? piece.init() : piece.unload()));
	}

	/**
	 * Loads a piece into Klasa so it can be saved in this store.
	 * @since 0.0.1
	 * @param directory The directory the file is located in
	 * @param file A string or array of strings showing where the file is located.
	 */
	public async load(directory: string, file: readonly string[]): Promise<V | null> {
		const loc = join(directory, ...file);
		let piece = null;
		try {
			const loaded = await import(loc) as { default: PieceConstructor<V> } | PieceConstructor<V>;
			const LoadedPiece = 'default' in loaded ? loaded.default : loaded;
			if (!isClass(LoadedPiece)) throw new TypeError('The exported structure is not a class.');
			piece = this.add(new LoadedPiece(this, directory, file));
		} catch (error) {
			this.client.emit(ClientEvents.WTF, `Failed to load file '${loc}'. Error:\n${error.stack || error}`);
		}
		delete require.cache[loc];
		module.children.pop();
		return piece;
	}

	/**
	 * Loads all of our Pieces from both the user and core directories.
	 * @since 0.0.1
	 * @returns The number of Pieces loaded.
	 */
	public async loadAll(): Promise<number> {
		this.clear();
		if (!this.client.options.pieces.disabledCoreTypes.includes(this.name)) {
			for (const directory of this.coreDirectories) await Store.walk(this, directory);
		}
		await Store.walk(this);
		return this.size;
	}

	/**
	 * Adds and sets up a piece in our store.
	 * @since 0.0.1
	 * @param piece The piece we are setting up
	 */
	public add(piece: V): V | null {
		if (!(piece instanceof this.Holds)) {
			this.client.emit(ClientEvents.Error, `Only ${this} may be stored in this Store.`);
			return null;
		}

		// Remove any previous piece named the same
		this.remove(piece.name);

		// Emit pieceLoaded event, set to the cache, and return it
		this.client.emit(ClientEvents.PieceLoaded, piece);
		super.set(piece.name, piece);
		return piece;
	}

	/**
	 * Removes a piece from the store.
	 * @since 0.0.1
	 * @param name A piece instance or a string representing a piece or alias name
	 * @returns Whether or not the removal was successful.
	 */
	public remove(name: V | string): boolean {
		const piece = this.resolve(name);
		if (!piece) return false;
		super.delete(piece.name);
		return true;
	}

	/**
	 * The overriden set method, this will always throw.
	 * @internal
	 */
	public set(): never {
		throw new Error('Cannot set in this Store.');
	}

	/**
	 * The overriden delete method, this will always throw.
	 * @internal
	 */
	public delete(): never {
		throw new Error('Cannot delete in this Store.');
	}

	/**
	 * Resolve a string or piece into a piece object.
	 * @since 0.0.1
	 * @param name The piece object or a string representing a piece's name
	 */
	public resolve(name: V | string): V | null {
		if (name instanceof this.Holds) return name;
		return this.get(name as string) || null;
	}

	/**
	 * Defines toString behavior for stores
	 * @since 0.0.1
	 * @returns This store name
	 */
	public toString(): string {
		return this.name;
	}

	/**
	 * Walks our directory of Pieces for the user and core directories.
	 * @since 0.0.1
	 * @param store The store we're loading into
	 * @param directory The directory to walk in
	 */
	private static async walk<T extends Piece>(store: Store<T>, directory: string = store.userDirectory): Promise<T[]> {
		try {
			const files = await scan(directory, { filter: (stats) => stats.isFile() && extname(stats.name) === '.js' });
			return Promise.all([...files.keys()].map(file => store.load(directory, relative(directory, file).split(sep)) as Promise<T>));
		} catch {
			if (store.client.options.pieces.createFolders) {
				ensureDir(directory).catch(err => store.client.emit(ClientEvents.Error, err));
			}

			return [];
		}
	}

	public static get [Symbol.species](): typeof Cache {
		return Cache;
	}

}
