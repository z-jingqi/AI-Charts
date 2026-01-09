/**
 * Base64 Utilities for Cloudflare Workers
 * These utilities work in environments without Node.js Buffer API
 */

/**
 * Convert ArrayBuffer to base64 string using Web APIs
 * Compatible with Cloudflare Workers
 * @param buffer - ArrayBuffer to convert
 * @returns Base64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const len = uint8Array.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 * @param base64 - Base64 encoded string
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * Create a data URL from ArrayBuffer
 * @param buffer - ArrayBuffer containing image data
 * @param mimeType - MIME type of the image (default: image/jpeg)
 * @returns Data URL string
 */
export function arrayBufferToDataUrl(
  buffer: ArrayBuffer,
  mimeType: string = 'image/jpeg'
): string {
  const base64 = arrayBufferToBase64(buffer);
  return `data:${mimeType};base64,${base64}`;
}
