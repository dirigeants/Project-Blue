/* eslint-disable no-dupe-class-members */
import { URLSearchParams } from 'url';
import { Routes, RequestOptions, ImageURLOptions } from '@klasa/rest';
import { BanStore } from '../../stores/BanStore';
import { GuildChannelStore } from '../../stores/GuildChannelStore';
import { GuildEmojiStore } from '../../stores/GuildEmojiStore';
import { GuildInviteStore } from '../../stores/GuildInviteStore';
import { GuildMemberStore } from '../../stores/GuildMemberStore';
import { GuildWidget } from './GuildWidget';
import { IntegrationStore } from '../../stores/IntegrationStore';
import { isSet } from '../../../util/Util';
import { PresenceStore } from '../../stores/PresenceStore';
import { RoleStore } from '../../stores/RoleStore';
import { Structure } from '../base/Structure';
import { VoiceStateStore } from '../../stores/VoiceStateStore';
import { resolveImageToBase64, ImageBufferResolvable } from '../../../util/ImageUtil';

import type {
	APIGuildData,
	APIVoiceRegionData,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilterLevel,
	GuildFeatures,
	GuildMFALevel,
	GuildPremiumTier,
	GuildSystemChannelFlags,
	GuildVerificationLevel,
	APIGuildPreviewData
} from '@klasa/dapi-types';
import type { WebSocketShard } from '@klasa/ws';
import type { Client } from '../../../client/Client';
import type { GuildMember } from './GuildMember';
import type { Permissions } from '../../../util/bitfields/Permissions';

/**
 * @see https://discord.com/developers/docs/resources/guild#guild-object
 */
export class Guild extends Structure {

	/**
	 * The guild ID.
	 * @since 0.0.1
	 */
	public readonly id: string;

	/**
	 * The guild's name (2-100 characters).
	 * @since 0.0.1
	 */
	public name!: string;

	/**
	 * The guild's icon hash.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/reference#image-formatting
	 */
	public icon!: string | null;

	/**
	 * The guild's splash hash.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/reference#image-formatting
	 */
	public splash!: string | null;

	/**
	 * The guild's discovery splash hash.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/reference#image-formatting
	 */
	public discoverySplash!: string | null;

	/**
	 * The guild's owner ID.
	 * @since 0.0.1
	 */
	public ownerID!: string;

	/**
	 * The guild's total permissions for the user in the guild (does not include channel overrides).
	 * @since 0.0.1
	 */
	public permissions!: Permissions | null;

	/**
	 * The guild's voice region id for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/voice#voice-region-object
	 */
	public region!: string;

	/**
	 * The guild's id of AFK channel.
	 * @since 0.0.1
	 */
	public afkChannelID!: string | null;

	/**
	 * The guild's AFK timeout in seconds.
	 * @since 0.0.1
	 */
	public afkTimeout!: number;

	/**
	 * The guild's required verification level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-verification-level
	 */
	public verificationLevel!: GuildVerificationLevel;

	/**
	 * The guild's default message notifications level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
	 */
	public defaultMessageNotification!: GuildDefaultMessageNotifications;

	/**
	 * The guild's explicit content filter level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
	 */
	public explicitContentFilter!: GuildExplicitContentFilterLevel;

	/**
	 * The guild's bans.
	 * @since 0.0.1
	 */
	public readonly bans: BanStore;

	/**
	 * The guild's store of roles.
	 * @since 0.0.1
	 */
	public readonly roles: RoleStore;

	/**
	 * The guild's store of custom emojis.
	 * @since 0.0.1
	 */
	public readonly emojis: GuildEmojiStore;

	/**
	 * The guild's store of invites.
	 * @since 0.0.1
	 */
	public readonly invites: GuildInviteStore;

	/**
	 * The guild's store of integrations.
	 * @since 0.0.1
	 */
	public readonly integrations: IntegrationStore;

	/**
	 * The guild's shard.
	 * @since 0.0.4
	 */
	public readonly shard: WebSocketShard;

	/**
	 * The guild's enabled features.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-guild-features
	*/
	public features!: GuildFeatures[];

	/**
	 * The guild's required Multi-Factor Authentication level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
	 */
	public mfaLevel!: GuildMFALevel | null;

	/**
	 * The guild's application id of the guild creator if it is bot-created.
	 */
	public applicationID!: string | null;

	/**
	 * Whether or not the guild widget is enabled.
	 * @since 0.0.1
	 */
	public widgetEnabled!: boolean;

	/**
	 * The channel id for the guild widget.
	 * @since 0.0.1
	 */
	public widgetChannelID!: string | null;

	/**
	 * The system channel ID.
	 * @since 0.0.1
	 */
	public systemChannelID!: string | null;

	/**
	 * The system channel flags.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
	 */
	public systemChannelFlags!: GuildSystemChannelFlags;

	/**
	 * The id of the channel where "PUBLIC" guilds display rules and/or guidelines.
	 * @since 0.0.1
	 */
	public rulesChannelID!: string | null;

	/**
	 * When the guild was joined at.
	 * @since 0.0.1
	 */
	public joinedTimestamp!: number | null;

	/**
	 * Whether the is considered a large guild.
	 * @since 0.0.1
	 */
	public large!: boolean | null;

	/**
	 * Whether or not this guild is unavailable.
	 * @since 0.0.1
	 */
	public unavailable: boolean;

	/**
	 * Total number of members in the guild. This field will only be present if a guild was received from the `GUILD_CREATE` event.
	 * @since 0.0.1
	 */
	public memberCount!: number | null;

	/**
	 * A store of voice states for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/voice#voice-state-object
	 */
	public readonly voiceStates: VoiceStateStore;

	/**
	 * A store of members for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-member-object
	 */
	public readonly members: GuildMemberStore;

	/**
	 * A store of channels for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/channel#channel-object
	 */
	public readonly channels: GuildChannelStore;

	/**
	 * A store of presences for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/topics/gateway#presence-update
	 */
	public readonly presences: PresenceStore;

	/**
	 * The maximum amount of presences for the guild (the default value, currently 25000, is in effect when null is returned).
	 * @since 0.0.1
	 */
	public maxPresences?: number | null;

	/**
	 * The maximum amount of members for the guild.
	 * @since 0.0.1
	 */
	public maxMembers?: number;

	/**
	 * The vanity invite code for the guild.
	 * @since 0.0.1
	 */
	public vanityUrlCode!: string | null;

	/**
	 * The guild's description.
	 * @since 0.0.1
	 */
	public description!: string | null;

	/**
	 * The guild's banner hash.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/reference#image-formatting
	 */
	public banner!: string | null;

	/**
	 * The guild's Server Boost level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
	 */
	public premiumTier!: GuildPremiumTier | null;

	/**
	 * The number of boosts the guild currently has.
	 * @since 0.0.1
	 */
	public premiumSubscriptionCount!: number | null;

	/**
	 * The preferred locale of a `PUBLIC` guild used in guild discovery and notices from Discord; defaults to "en-US".
	 * @since 0.0.1
	 */
	public preferredLocale!: string;

	/**
	 * The id of the channel where admins and moderators of "PUBLIC" guilds receive notices from Discord.
	 * @since 0.0.1
	 */
	public publicUpdatesChannel!: string | null;

	/**
	 * The approximate number of members in the guild, returned from the `GET /guild/<id>` endpoint when `with_counts` is `true`.
	 * @since 0.0.1
	 */
	public approximateMemberCount?: number;

	/**
	 * The approximate number of online members in the guild, returned from the `GET /guild/<id>` endpoint when `with_counts` is `true`.
	 * @since 0.0.1
	 */
	public approximatePresenceCount?: number;

	/**
	 * The widget for the guild.
	 * @since 0.0.1
	 */
	public widget: GuildWidget;

	/**
	 * Whether the guild is deleted.
	 * @since 0.0.1
	 */
	public deleted = false;

	public constructor(client: Client, data: APIGuildData, shardID: number) {
		super(client);

		this.id = data.id;
		this.bans = new BanStore(client, this);
		this.roles = new RoleStore(client, this);
		this.emojis = new GuildEmojiStore(client, this);
		this.invites = new GuildInviteStore(client, this);
		this.integrations = new IntegrationStore(client, this);
		this.voiceStates = new VoiceStateStore(client, this);
		this.members = new GuildMemberStore(client, this);
		this.channels = new GuildChannelStore(client, this);
		this.presences = new PresenceStore(client, this);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.shard = this.client.ws.shards.get(shardID)!;

		// eslint-disable-next-line camelcase
		this.widget = new GuildWidget({ enabled: null, channel_id: null }, this);

		this.unavailable = data.unavailable ?? false;
		if (!this.unavailable) {
			this._patch(data);
		}
	}

	/**
	 * When the guild was joined at, as a Date.
	 * @since 0.0.1
	 */
	public get joinedAt(): Date | null {
		return this.joinedTimestamp === null ? null : new Date(this.joinedTimestamp);
	}

	/**
	 * The Client as a member of the guild.
	 * @since 0.0.1
	 */
	public get me(): GuildMember | null {
		if (!this.client.user) return null;
		return this.members.get(this.client.user.id) ?? null;
	}

	/**
	 * The owner of the guild.
	 * @since 0.0.1
	 */
	public get owner(): GuildMember | null {
		return this.members.get(this.ownerID) ?? null;
	}

	/**
	 * Returns the guild preview.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-preview
	 */
	public fetchPreview(): Promise<APIGuildPreviewData> {
		return this.client.api.get(Routes.guildPreview(this.id)) as Promise<APIGuildPreviewData>;
	}

	/**
	 * Modifies the guild's settings.
	 * @since 0.0.1
	 * @param data The settings to be applied to the guild.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#modify-guild
	 */
	public async modify({ icon, splash, banner, ...options }: GuildModifyOptions, requestOptions: RequestOptions = {}): Promise<this> {
		const data: GuildModifyOptions = {
			icon: icon ? await resolveImageToBase64(icon) : icon,
			splash: splash ? await resolveImageToBase64(splash) : splash,
			banner: banner ? await resolveImageToBase64(banner) : banner,
			...options
		};
		const result = await this.client.api.patch(Routes.guild(this.id), { ...requestOptions, data }) as APIGuildData;
		return this._patch(result);
	}

	/**
	 * Deletes the guild permanently.
	 * @since 0.0.1
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#delete-guild
	 */
	public async delete(requestOptions: RequestOptions = {}): Promise<this> {
		await this.client.guilds.remove(this.id, requestOptions);
		this.deleted = true;
		return this;
	}

	/**
	 * Returns a number indicating the number of members that would be removed in a prune operation.
	 * @since 0.0.1
	 * @param options The number of days to count prune and the included roles.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-prune-count
	 */
	public prune(options: GuildPruneDryOptions, requestOptions?: RequestOptions): Promise<number>;
	/**
	 * Begins a prune operation.
	 * @since 0.0.1
	 * @param options The number of days to count prune and the included roles.
	 * @param requestOptions The additional request options.
	 * @see https://discord.com/developers/docs/resources/guild#begin-guild-prune
	 */
	public prune(options: GuildPruneNonDryOptions, requestOptions?: RequestOptions): Promise<number | null>
	public async prune(options: GuildPruneOptions, requestOptions: RequestOptions = {}): Promise<number | null> {
		const query = new URLSearchParams();
		if (isSet(options, 'days')) query.append('days', options.days.toString());
		if (isSet(options, 'includeRoles')) for (const role of options.includeRoles) query.append('include_roles', role);
		if (options.dry) {
			const result = await this.client.api.get(Routes.guildPrune(this.id), { ...requestOptions, query: [...query] }) as { pruned: number };
			return result.pruned;
		}

		if (isSet(options, 'computePruneCount')) query.append('compute_prune_count', options.computePruneCount.toString());
		const result = await this.client.api.post(Routes.guildPrune(this.id), { ...requestOptions, query: [...query] }) as { pruned: number | null };
		return result.pruned;
	}

	/**
	 * Returns a list of voice region objects for the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
	 */
	public async fetchRegions(): Promise<APIVoiceRegionData[]> {
		const results = await this.client.api.get(Routes.guildVoiceRegions(this.id)) as APIVoiceRegionData[];
		return results;
	}

	/**
	 * Makes the client leave the guild.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/user#leave-guild
	 */
	public async leave(): Promise<this> {
		await this.client.api.delete(Routes.leaveGuild(this.id));
		return this;
	}

	/**
	 * Returns a partial {@link Invite invite} for guilds that have the feature enabled.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
	 */
	public async fetchVanityURL(): Promise<GuildVanityURL> {
		return this.client.api.get(Routes.guildVanityURL(this.id)) as Promise<GuildVanityURL>;
	}

	/**
	 * Returns the icon url for the guild if one is available.
	 * @param options The image size and format options.
	 */
	public iconURL(options?: ImageURLOptions): string | null {
		return this.icon ? this.client.api.cdn.guildIcon(this.id, this.icon, options) : null;
	}

	/**
	 * Defines the toString behavior of guilds.
	 * @since 0.0.4
	 */
	public toString(): string {
		return this.name;
	}

	protected _patch(data: APIGuildData): this {
		this.name = data.name;
		this.ownerID = data.owner_id;
		this.region = data.name;
		this.icon = data.icon;
		this.splash = data.splash;
		this.discoverySplash = data.discovery_splash;
		this.afkChannelID = data.afk_channel_id;
		this.verificationLevel = data.verification_level;
		this.defaultMessageNotification = data.default_message_notifications;
		this.explicitContentFilter = data.explicit_content_filter;
		this.unavailable = data.unavailable ?? false;

		if (data.roles) {
			this.roles.clear();
			// eslint-disable-next-line dot-notation
			for (const role of data.roles) this.roles['_add'](role);
		}

		if (data.emojis) {
			this.emojis.clear();
			// eslint-disable-next-line dot-notation
			for (const emoji of data.emojis) this.emojis['_add'](emoji);
		}

		if (data.members) {
			this.members.clear();
			// eslint-disable-next-line dot-notation
			for (const member of data.members) this.members['_add'](member);
		}

		if (data.channels) {
			this.channels.clear();
			// eslint-disable-next-line dot-notation, camelcase
			for (const channel of data.channels) this.client.channels['_add'](channel, this);
		}

		this.features = data.features;
		this.mfaLevel = data.mfa_level;
		this.widgetEnabled = data.widget_enabled ?? false;
		this.widgetChannelID = data.widget_channel_id ?? null;
		this.systemChannelID = data.system_channel_id;
		this.systemChannelFlags = data.system_channel_flags;
		this.rulesChannelID = data.rules_channel_id;
		this.joinedTimestamp = data.joined_at ? new Date(data.joined_at).getTime() : null;
		this.large = Boolean('large' in data ? data.large : this.large);
		this.vanityUrlCode = data.vanity_url_code;
		this.banner = data.banner;
		this.premiumTier = data.premium_tier;
		this.premiumSubscriptionCount = data.premium_subscription_count ?? null;
		this.preferredLocale = data.preferred_locale;
		this.description = data.description;
		this.publicUpdatesChannel = data.public_updates_channel_id;
		this.approximateMemberCount = data.approximate_member_count;
		this.approximatePresenceCount = data.approximate_presence_status;
		this.memberCount = data.member_count ?? this.memberCount ?? null;

		return this;
	}

}

/* eslint-disable camelcase */

/**
 * The options for {@link Guild#modify}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#modify-guild-json-params
 */
export interface GuildModifyOptions {
	/**
	 * The {@link Guild guild} name.
	 * @since 0.0.1
	 */
	name?: string;

	/**
	 * The guild voice region id.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/voice#voice-region-object
	 */
	region?: string;

	/**
	 * The verification level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-verification-level
	 */
	verification_level?: string;

	/**
	 * The default message notification level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
	 */
	default_message_notifications?: GuildDefaultMessageNotifications;

	/**
	 * The explicit content filter level.
	 * @since 0.0.1
	 * @see https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
	 */
	explicit_content_filter?: GuildExplicitContentFilterLevel;

	/**
	 * The id for afk {@link VoiceChannel channel}.
	 * @since 0.0.1
	 */
	afk_channel_id?: string;

	/**
	 * The afk timeout in seconds.
	 * @since 0.0.1
	 */
	afk_timeout?: number;

	/**
	 * The base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the guild has `ANIMATED_ICON` feature).
	 * @since 0.0.1
	 */
	icon?: ImageBufferResolvable;

	/**
	 * The {@link User user} id to transfer guild ownership to (must be owner).
	 * @since 0.0.1
	 */
	owner_id?: string;

	/**
	 * The base64 16:9 png/jpeg image for the guild splash (when the guild has `INVITE_SPLASH` feature).
	 * @since 0.0.1
	 */
	splash?: ImageBufferResolvable;

	/**
	 * The base64 16:9 png/jpeg image for the guild banner (when the guild has `BANNER` feature).
	 * @since 0.0.1
	 */
	banner?: ImageBufferResolvable;

	/**
	 * The id of the {@link TextChannel channel} where guild notices such as welcome messages and boost events are posted.
	 * @since 0.0.1
	 */
	system_channel_id?: string;

	/**
	 * The id of the channel where guilds display rules and/or guidelines (when the guild has `PUBLIC` feature).
	 * @since 0.0.1
	 */
	rules_channel_id?: string;

	/**
	 * The id of the channel where admins and moderators of guilds receive notices from Discord (when the guild has `PUBLIC` feature).
	 * @since 0.0.1
	 */
	public_updates_channel_id?: string;

	/**
	 * The preferred locale of a guild used in server discovery and notices from Discord; defaults to "en-US" (when the guild has `PUBLIC` feature).
	 * @since 0.0.1
	 */
	preferred_locale?: string;
}

/**
 * The options for a dry {@link Guild#prune}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params
 */
export interface GuildPruneDryOptions {
	/**
	 * The number of days to count prune for (1 or more).
	 * @since 0.0.1
	 * @default 7
	 */
	days?: number;

	/**
	 * The {@link Role role} IDs to include.
	 * @since 0.0.1
	 * @default []
	 */
	includeRoles?: string[];

	/**
	 * Whether or not this operation should fetch instead of starting a prune.
	 * @since 0.0.1
	 * @default false
	 */
	dry: true;
}

/**
 * The options for a non-dry {@link Guild#prune}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#begin-guild-prune-query-string-params
 */
export interface GuildPruneNonDryOptions extends Omit<GuildPruneDryOptions, 'dry'> {
	/**
	 * Whether 'pruned' is returned, discouraged for large guilds.
	 * @since 0.0.1
	 * @default true
	 */
	computePruneCount?: boolean;

	/**
	 * Whether or not this operation should fetch instead of starting a prune.
	 * @since 0.0.1
	 * @default false
	 */
	dry?: false;
}

export type GuildPruneOptions = GuildPruneDryOptions | GuildPruneNonDryOptions;

/**
 * The vanity URL retrieved from {@link Guild#fetchVanityURL}.
 * @since 0.0.1
 * @see https://discord.com/developers/docs/resources/guild#get-guild-vanity-url-example-partial-invite-object
 */
export interface GuildVanityURL {
	/**
	 * The code of the invite.
	 * @since 0.0.1
	 * @example "discord"
	 */
	code: string;

	/**
	 * The amount of uses the invite has.
	 * @since 0.0.1
	 * @example 42
	 */
	uses: number;
}

/* eslint-enable camelcase */
