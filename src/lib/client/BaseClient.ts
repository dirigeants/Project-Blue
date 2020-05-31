import { EventEmitter } from 'events';
import { mergeDefault } from '@klasa/utils';
import { REST, RESTOptions, RESTManagerEvents } from '@klasa/rest';
import { TimerManager } from '@klasa/timer-manager';
import { BaseClientOptionsDefaults } from '../util/Constants';
import { ClientEvents } from '../client/Client';

export interface BaseClientOptions {
	rest: Partial<RESTOptions>;
}

/**
 * The Klasa-Core Base Client used to wrap the Discord API
 */
export class BaseClient extends EventEmitter {

	/**
	 * The rest api interface
	 */
	public api: REST;

	/**
	 * The options to use for this client
	 */
	public options: BaseClientOptions;

	/**
	 * @param options All of your preferences on how Klasa-Core should work for you
	 */
	public constructor(options: Partial<BaseClientOptions> = {}) {
		super();
		this.options = mergeDefault(BaseClientOptionsDefaults, options);
		this.api = new REST(this.options.rest)
			.on(RESTManagerEvents.Debug, this.emit.bind(this, ClientEvents.RESTDebug))
			.on(RESTManagerEvents.Ratelimited, this.emit.bind(this, ClientEvents.Ratelimited));
	}

	/**
	 * Sets the token to use for the api.
	 */
	set token(token: string) {
		this.api.token = token;
	}

	/**
	 * Destroys all timers
	 */
	public async destroy(): Promise<void> {
		TimerManager.destroy();
	}

}
