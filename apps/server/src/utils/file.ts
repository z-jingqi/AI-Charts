/**
 * File Utilities
 * Shared utilities for file handling
 */

/**
 * Detect file type from File object
 * @param file - File object from form data
 * @returns File type: 'image', 'pdf', or 'unknown'
 */
export function detectFileType(file: File): 'image' | 'pdf' | 'unknown' {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    return 'image';
  }

  return 'unknown';
}
