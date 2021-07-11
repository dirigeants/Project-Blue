import { APIChannelPartial, ChannelType, APIChannelData } from '@klasa/dapi-types';
import { Structure } from '../base/Structure';
import { extender, ExtenderStructures } from '../../../util/Extender';
import { Client, ClientEvents } from '../../../client/Client';

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export abstract class Channel extends Structure {

	/**
	 * The ID of the channel.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The type of channel.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	public readonly abstract type: ChannelType;

	/**
	 * Whether the channel is deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIChannelPartial) {
		super(client);
		this.id = data.id;
		this._patch(data);
	}

	/**
	 * Defines toString behavior for channels.
	 * @since 0.0.1
	 */
	public toString(): string {
		return `<#${this.id}>`;
	}

	public static create(client: Client, data: APIChannelData, ...extra: readonly unknown[]): Channel | null {
		const existing = client.channels.get(data.id);
		if (existing) {
			// eslint-disable-next-line dot-notation
			existing['_patch'](data);
			return existing;
		}

		const name = Channel.types.get(data.type);
		if (name) return new (extender.get(name))(client, data, ...extra) as Channel;

		client.emit(ClientEvents.Debug, `[Channels] Received data with unknown type '${data.type}'.\n\tPayload: ${JSON.stringify(data)}`);
		return null;
	}

	private static readonly types = new Map<ChannelType, keyof ExtenderStructures>([
		[ChannelType.GuildText, 'TextChannel'],
		[ChannelType.DM, 'DMChannel'],
		[ChannelType.GuildVoice, 'VoiceChannel'],
		[ChannelType.GroupDM, 'Channel'],
		[ChannelType.GuildCategory, 'CategoryChannel'],
		[ChannelType.GuildNews, 'NewsChannel'],
		[ChannelType.GuildStore, 'StoreChannel']
	]);

}
