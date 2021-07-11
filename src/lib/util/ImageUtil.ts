import fetch from 'node-fetch';
import { Readable } from 'stream';
import { pathExists } from 'fs-nextra';
import { promises as fsp } from 'fs';
import { MessageAttachment } from '../caching/structures/messages/MessageAttachment';

/**
 * @param buffer The buffer to sniff the magic numbers from.
 * @see https://en.wikipedia.org/wiki/GIF
 * @private
 */
function isGif(buffer: Buffer): boolean {
	// 0x47 0x49 0x46 0x38 0x39 0x61
	return buffer.length > 6 &&
		buffer[0] === 0x47 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x38 &&
		buffer[4] === 0x39 &&
		buffer[5] === 0x61;
}

/**
 * @param buffer The buffer to sniff the magic numbers from.
 * @see https://en.wikipedia.org/wiki/JPEG
 * @private
 */
function isJpeg(buffer: Buffer): boolean {
	// 0xFF 0xD8 0xFF
	return buffer.length > 3 &&
		buffer[0] === 0xFF &&
		buffer[1] === 0xD8 &&
		buffer[2] === 0xFF;
}

/**
 * @param buffer The buffer to sniff the magic numbers from.
 * @see https://en.wikipedia.org/wiki/Portable_Network_Graphics
 * @private
 */
function isPng(buffer: Buffer): boolean {
	// 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
	return buffer.length > 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4E &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0D &&
		buffer[5] === 0x0A &&
		buffer[6] === 0x1A &&
		buffer[7] === 0x0A;
}

/**
 * @param buffer The buffer to sniff the magic numbers from.
 * @see https://en.wikipedia.org/wiki/WebP
 * @private
 */
function isWebp(buffer: Buffer): boolean {
	// 0x52 0x49 0x46 0x46 0x__ 0x__ 0x__ 0x__ 0x57 0x45 0x42 0x50
	return buffer.length > 12 &&
		buffer[0] === 0x52 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x46 &&
		buffer[8] === 0x57 &&
		buffer[9] === 0x45 &&
		buffer[10] === 0x42 &&
		buffer[11] === 0x50;
}

export const enum ImageTypes {
	GIF = 'image/gif',
	JPEG = 'image/jpeg',
	PNG = 'image/png',
	WEBP = 'image/webp'
}

export type ImageBufferResolvable = Readable | Buffer | MessageAttachment | string;

/**
 * Determines whether or not a buffer corresponds to a GIF, JPG/JPEG, PNG, or WebP.
 * @since 0.0.1
 * @param buffer The buffer to sniff the magic numbers from.
 */
export function getImageType(buffer: Buffer): ImageTypes | null {
	if (isGif(buffer)) return ImageTypes.GIF;
	if (isJpeg(buffer)) return ImageTypes.JPEG;
	if (isPng(buffer)) return ImageTypes.PNG;
	if (isWebp(buffer)) return ImageTypes.WEBP;
	return null;
}

/**
 * Determines the image's file type based on its contents and provides a base 64 string.
 * @since 0.0.1
 * @param buffer The buffer to sniff and stringify into a Base 64 string.
 * @param fallback The default image type to fall back to.
 */
export function imageToBase64(buffer: Buffer, fallback: ImageTypes = ImageTypes.JPEG): string {
	return `data:${getImageType(buffer) ?? fallback};base64,${buffer.toString('base64')}`;
}

/**
 * Converts a stream, buffer, message attachment, url, or filepath to a buffer.
 * @since 0.0.1
 * @param data The data to resolve into a buffer.
 */
export async function resolveImageBuffer(data: ImageBufferResolvable): Promise<Buffer> {
	if (data instanceof Readable) {
		const buffers = [];
		for await (const buffer of data) buffers.push(buffer);
		return Buffer.concat(buffers);
	}
	if (Buffer.isBuffer(data)) return data;
	if (data instanceof MessageAttachment) return (await fetch(data.url)).buffer();
	if (/^https?:\/\//.test(data)) return (await fetch(data)).buffer();
	if (await pathExists(data)) return fsp.readFile(data);
	return Buffer.from(data);
}

/**
 * Determines the image's file type based on its contents and provides a base 64 string.
 * @since 0.0.1
 * @param data The data to resolve into a Base 64 string.
 * @param fallback The default image type to fall back to.
 */
export async function resolveImageToBase64(data: ImageBufferResolvable, fallback?: ImageTypes): Promise<string> {
	const resolved = await resolveImageBuffer(data);
	return imageToBase64(resolved, fallback);
}
