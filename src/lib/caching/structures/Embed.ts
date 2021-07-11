import { deepClone } from '@klasa/utils';

import type {
	APIEmbedAuthorData,
	APIEmbedData,
	APIEmbedFieldData,
	APIEmbedFooterData,
	APIEmbedImageData,
	APIEmbedProviderData,
	APIEmbedVideoData,
	EmbedType
} from '@klasa/dapi-types';

export interface StringResolvable {
	toString(): string;
}

/**
 * Handles Embed creation and received embeds
 */
export class Embed implements APIEmbedData {

	/**
	 * Embed Fields.
	 * @since 0.0.1
	 */
	public fields!: APIEmbedFieldData[];

	/**
	 * The type of embed.
	 * @since 0.0.1
	 */
	public type?: EmbedType;

	/**
	 * The embed title.
	 * @since 0.0.1
	 */
	public title?: string;

	/**
	 * The embed description.
	 * @since 0.0.1
	 */
	public description?: string;

	/**
	 * The embed url.
	 * @since 0.0.1
	 */
	public url?: string;

	/**
	 * The embed bar color.
	 * @since 0.0.1
	 */
	public color?: number;

	/**
	 * The timestamp of the embed.
	 * @since 0.0.1
	 */
	public timestamp?: string;

	/**
	 * The embed thumbnail data.
	 * @since 0.0.1
	 */
	public thumbnail?: APIEmbedImageData;

	/**
	 * The embed image data.
	 * @since 0.0.1
	 */
	public image?: APIEmbedImageData;

	/**
	 * Received video data.
	 * @since 0.0.1
	 */
	public video?: APIEmbedVideoData;

	/**
	 * The embed author data.
	 * @since 0.0.1
	 */
	public author?: APIEmbedAuthorData;

	/**
	 * Received data about the embed provider.
	 * @since 0.0.1
	 */
	public provider?: APIEmbedProviderData;

	/**
	 * The embed footer data.
	 * @since 0.0.1
	 */
	public footer?: APIEmbedFooterData;

	public constructor(data: APIEmbedData = {}) {
		this.type = data.type;

		this.title = data.title;

		this.description = data.description;

		this.url = data.url;

		this.color = data.color;

		this.timestamp = data.timestamp ? new Date(data.timestamp).toISOString() : undefined;

		this.fields = data.fields ? data.fields.map(deepClone) : [];

		this.thumbnail = data.thumbnail ? {
			url: data.thumbnail.url,
			// eslint-disable-next-line camelcase
			proxy_url: data.thumbnail.proxy_url,
			height: data.thumbnail.height,
			width: data.thumbnail.width
		} : undefined;

		this.image = data.image ? {
			url: data.image.url,
			// eslint-disable-next-line camelcase
			proxy_url: data.image.proxy_url,
			height: data.image.height,
			width: data.image.width
		} : undefined;

		this.video = data.video ? {
			url: data.video.url,
			height: data.video.height,
			width: data.video.width
		} : undefined;

		this.author = data.author ? {
			name: data.author.name,
			url: data.author.url,
			// eslint-disable-next-line camelcase
			icon_url: data.author.icon_url,
			// eslint-disable-next-line camelcase
			proxy_icon_url: data.author.proxy_icon_url
		} : undefined;

		this.provider = data.provider;

		this.footer = data.footer ? {
			text: data.footer.text,
			// eslint-disable-next-line camelcase
			icon_url: data.footer.icon_url,
			// eslint-disable-next-line camelcase
			proxy_icon_url: data.footer.proxy_icon_url
		} : undefined;
	}

	/**
	 * JS Date of the embed timestamp
	 */
	public get createdAt(): Date | null {
		return this.timestamp ? new Date(this.timestamp) : null;
	}

	/**
	 * The color as hex
	 */
	public get hexColor(): string | null {
		return this.color ? `#${this.color.toString(16).padStart(6, '0')}` : null;
	}

	/**
	 * Adds a field to the embed
	 * @param name The field name
	 * @param value The field value
	 * @param inline If the field should be inline with other fields
	 */
	public addField(name: StringResolvable, value: StringResolvable, inline?: boolean): this {
		this.fields.push(Embed.checkField(name, value, inline));
		return this;
	}

	/**
	 * Adds a blank field to the embed
	 * @param inline If the field should be inline with other fields
	 */
	public addBlankField(inline?: boolean): this {
		return this.addField('\u200B', '\u200B', inline);
	}

	/**
	 * Deletes and/or inserts fields by index in the embed
	 * @param index The index to start at
	 * @param deleteCount How many fields to delete
	 * @param name The field name to insert
	 * @param value The field value to insert
	 * @param inline If the inserted field is inline
	 */
	public spliceField(index: number, deleteCount: number, name?: StringResolvable, value?: StringResolvable, inline?: boolean): this {
		if (name && value) this.fields.splice(index, deleteCount, Embed.checkField(name, value, inline));
		else this.fields.splice(index, deleteCount);
		return this;
	}

	/**
	 * Sets the author with new data
	 * @param name The author's name
	 * @param iconURL The icon url for the author
	 * @param url The url for clicking on the author
	 */
	public setAuthor(name?: StringResolvable, iconURL?: StringResolvable, url?: StringResolvable): this {
		const icon = iconURL === undefined ? undefined : String(iconURL);
		const link = url === undefined ? undefined : String(url);
		// eslint-disable-next-line camelcase
		this.author = name === undefined ? undefined : { name: String(name), icon_url: icon, url: link };
		return this;
	}

	/**
	 * Updates existing author data fields
	 * @param data The fields you want to update
	 */
	public updateAuthor(data: APIEmbedAuthorData): this {
		this.author = { ...this.author, ...data };
		return this;
	}

	/**
	 * Sets the color of the embed bar
	 * @param color The color to set the bar
	 */
	public setColor(color?: number): this {
		this.color = color;
		return this;
	}

	/**
	 * Sets the footer to new data
	 * @param text The footer text
	 * @param iconURL The url for the footer icon
	 */
	public setFooter(text?: StringResolvable, iconURL?: StringResolvable): this {
		const icon = iconURL === undefined ? undefined : String(iconURL);
		// eslint-disable-next-line camelcase
		this.footer = text === undefined ? undefined : { text: String(text), icon_url: icon };
		return this;
	}

	/**
	 * Updates the footer to new data
	 * @param data The fields you want to update
	 */
	public updateFooter(data: APIEmbedFooterData): this {
		this.footer = { ...this.footer, ...data };
		return this;
	}

	/**
	 * Sets the image url you would like
	 * @param url The url of the image
	 */
	public setImage(url?: StringResolvable): this {
		this.image = url === undefined ? undefined : { url: String(url) };
		return this;
	}

	/**
	 * Updates the image data you would like
	 * @param data The fields you want to update
	 */
	public updateImage(data: APIEmbedImageData): this {
		this.image = { ...this.image, ...data };
		return this;
	}

	/**
	 * Sets the thumbnail url you would like
	 * @param url The url of the image
	 */
	public setThumbnail(url?: StringResolvable): this {
		this.thumbnail = url === undefined ? undefined : { url: String(url) };
		return this;
	}

	/**
	 * Updates the thumbnail data you would like
	 * @param data The fields you want to update
	 */
	public updateThumbnail(data: APIEmbedImageData): this {
		this.thumbnail = { ...this.thumbnail, ...data };
		return this;
	}

	/**
	 * Sets the timestamp for the Embed
	 * @param timestamp The timestamp you want to set
	 */
	public setTimestamp(timestamp?: number | Date): this {
		this.timestamp = timestamp === undefined ? undefined : new Date(timestamp).toISOString();
		return this;
	}

	/**
	 * Sets the timestamp to now
	 */
	public updateTimestamp(): this {
		this.timestamp = new Date().toISOString();
		return this;
	}

	/**
	 * Sets the title of the embed
	 * @param title The title you want
	 */
	public setTitle(title?: StringResolvable): this {
		this.title = title === undefined ? undefined : String(title);
		return this;
	}

	/**
	 * Sets the description of the embed
	 * @param description The description you want
	 */
	public setDescription(description?: StringResolvable): this {
		this.description = description === undefined ? undefined : String(description);
		return this;
	}

	/**
	 * Sets the url of the embed
	 * @param url The url to click on
	 */
	public setURL(url?: StringResolvable): this {
		this.url = url === undefined ? undefined : String(url);
		return this;
	}

	/**
	 * Checks for valid field input and resolves strings
	 * @param name The name of the field
	 * @param value The value of the field
	 * @param inline Set the field to display inline
	 */
	private static checkField(name: StringResolvable, value: StringResolvable, inline = false): APIEmbedFieldData {
		name = String(name);
		if (typeof name !== 'string') throw new TypeError(`Embed field name must be a string or have a toString() method, received: ${typeof name}`);
		value = String(value);
		if (typeof value !== 'string') throw new TypeError(`Embed field value must be a string or have a toString() method: ${typeof value}`);
		return { name, value, inline };
	}

}
