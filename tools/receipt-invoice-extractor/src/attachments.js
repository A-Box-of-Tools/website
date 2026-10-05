import { findPageQuad, WORKING_EDGE } from './shared/document-detect.js';
import { findReceiptCrop } from './receipt-crop.js';

export const MAX_IMAGE_PIXELS = 80_000_000;
export const ATTACHMENT_EDGE = 1600;
export const ATTACHMENT_TARGET_BYTES = 350 * 1024;
export const FULL_CROP = Object.freeze({ x: 0, y: 0, width: 1, height: 1 });

/** Crop coordinates always belong to the upright picture, after rotation. */
export function normalizedCrop(crop = FULL_CROP) {
  const { x, y, width, height } = crop;
  if (![x, y, width, height].every(Number.isFinite)
      || x < 0 || y < 0 || width <= 0 || height <= 0
      || x >= 1 || y >= 1 || x + width > 1 + 1e-9 || y + height > 1 + 1e-9) {
    throw new Error('invalidCrop');
  }
  return { x, y, width: Math.min(width, 1 - x), height: Math.min(height, 1 - y) };
}

function rightAngle(rotation) {
  if (!Number.isFinite(rotation) || rotation % 90 !== 0) throw new Error('invalidRotation');
  return ((rotation % 360) + 360) % 360;
}

/** Rotating the picture must keep the visitor's selected part of the document. */
export function rotateCrop(crop, rotation = 90) {
  let result = normalizedCrop(crop);
  const turns = rightAngle(rotation) / 90;
  for (let turn = 0; turn < turns; turn += 1) {
    const { x, y, width, height } = result;
    result = { x: Math.max(0, 1 - y - height), y: x, width: height, height: width };
  }
  return normalizedCrop(result);
}

export function imageDimensions(width, height, rotation = 0) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
      || width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS) {
    throw new Error('imageSize');
  }
  return rightAngle(rotation) % 180 ? { width: height, height: width } : { width, height };
}

/** A small crop is never enlarged to fill the attachment's maximum size. */
export function attachmentDimensions(width, height, crop = FULL_CROP, maxEdge = ATTACHMENT_EDGE) {
  const rect = normalizedCrop(crop);
  imageDimensions(width, height);
  if (!Number.isSafeInteger(maxEdge) || maxEdge < 1 || maxEdge > 2400) throw new Error('imageSize');
  const sourceWidth = width * rect.width;
  const sourceHeight = height * rect.height;
  if (sourceWidth < 1 || sourceHeight < 1) throw new Error('invalidCrop');
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

/**
 * Small receipt lettering needs larger pixels for OCR, while the emailed copy
 * should stay small. A modest white border also keeps edge text out of the
 * engine's page boundary without spending the whole budget on empty space.
 */
export function ocrDimensions(width, height, crop = FULL_CROP, maxEdge = 2400) {
  const rect = normalizedCrop(crop);
  imageDimensions(width, height);
  if (!Number.isSafeInteger(maxEdge) || maxEdge < 1 || maxEdge > 2400) throw new Error('imageSize');
  const sourceWidth = width * rect.width;
  const sourceHeight = height * rect.height;
  if (sourceWidth < 1 || sourceHeight < 1) throw new Error('invalidCrop');
  const sourceEdge = Math.max(sourceWidth, sourceHeight);
  const initialScale = Math.min(3, maxEdge / sourceEdge);
  const border = Math.min(16, Math.floor(maxEdge / 10),
    Math.floor(Math.min(sourceWidth, sourceHeight) * initialScale / 8));
  const scale = Math.min(3, (maxEdge - border * 2) / sourceEdge);
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)) + border * 2,
    height: Math.max(1, Math.round(sourceHeight * scale)) + border * 2,
    border,
  };
}

/**
 * Keep the whole detected quadrilateral plus a small margin. This is a crop,
 * rather than a perspective correction, so a tilted page keeps its own pixels.
 */
export function cropFromQuad(quad, width, height, margin = 0.015) {
  imageDimensions(width, height);
  if (!Array.isArray(quad) || quad.length !== 4 || !Number.isFinite(margin) || margin < 0
      || quad.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    throw new Error('invalidCrop');
  }
  const xs = quad.map(point => point.x / width);
  const ys = quad.map(point => point.y / height);
  const x = Math.max(0, Math.min(...xs) - margin);
  const y = Math.max(0, Math.min(...ys) - margin);
  const right = Math.min(1, Math.max(...xs) + margin);
  const bottom = Math.min(1, Math.max(...ys) + margin);
  return normalizedCrop({ x, y, width: right - x, height: bottom - y });
}

export function attachmentName(name) {
  const stem = String(name ?? '').replace(/\.[a-z0-9]{1,8}$/i, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '-').trim().slice(0, 80) || 'document';
  return `${stem}-cropped.jpg`;
}

function drawImage(bitmap, rotation, crop, dimensions) {
  const upright = imageDimensions(bitmap.width, bitmap.height, rotation);
  const rect = normalizedCrop(crop);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('imageEncodeFailed');
  // White keeps a transparent PNG readable in an email app that assumes JPEG.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  const border = dimensions.border ?? 0;
  if (border) {
    context.beginPath();
    context.rect(border, border, canvas.width - border * 2, canvas.height - border * 2);
    context.clip();
    context.translate(border, border);
  }
  context.scale((canvas.width - border * 2) / (upright.width * rect.width),
    (canvas.height - border * 2) / (upright.height * rect.height));
  context.translate(-rect.x * upright.width, -rect.y * upright.height);
  const angle = rightAngle(rotation);
  if (angle === 90) context.translate(upright.width, 0);
  if (angle === 180) context.translate(upright.width, upright.height);
  if (angle === 270) context.translate(0, upright.height);
  context.rotate(angle * Math.PI / 180);
  context.drawImage(bitmap, 0, 0);
  return canvas;
}

/** OCR reads the selected pixels before the lossy email copy is encoded. */
export async function readImageCanvas(file, { rotation = 0, crop = FULL_CROP, maxEdge = 2400 } = {}) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const size = imageDimensions(bitmap.width, bitmap.height, rotation);
    const dimensions = ocrDimensions(size.width, size.height, crop, maxEdge);
    return drawImage(bitmap, rotation, crop, dimensions);
  } finally {
    bitmap?.close();
  }
}

/** Retain a screen-size copy, never a batch of full decoded phone photographs. */
export async function inspectImage(file, { rotation = 0, maxEdge = 1000 } = {}) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const size = imageDimensions(bitmap.width, bitmap.height, rotation);
    const dimensions = attachmentDimensions(size.width, size.height, FULL_CROP, maxEdge);
    const canvas = drawImage(bitmap, rotation, FULL_CROP, dimensions);
    const workingDimensions = attachmentDimensions(size.width, size.height, FULL_CROP, WORKING_EDGE);
    const working = drawImage(bitmap, rotation, FULL_CROP, workingDimensions);
    let detection;
    let crop;
    try {
      const pixels = working.getContext('2d').getImageData(0, 0, working.width, working.height);
      detection = findPageQuad(pixels);
      if (detection.found) crop = cropFromQuad(detection.quad, workingDimensions.width, workingDimensions.height);
      else {
        detection = findReceiptCrop(pixels);
        crop = detection.crop;
      }
    }
    finally { working.width = working.height = 0; }
    return {
      canvas, ...size, found: detection.found, crop,
    };
  } finally {
    bitmap?.close();
  }
}

function jpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (!blob || blob.type !== 'image/jpeg' || !blob.size) reject(new Error('imageEncodeFailed'));
    else resolve(blob);
  }, 'image/jpeg', quality));
}

/**
 * Compression has a fixed cost and a readability floor. Some pictures remain
 * above the target; returning their actual size lets the caller say so honestly.
 * Canvas re-encoding also leaves the original EXIF and GPS metadata behind.
 */
export async function prepareImage(file, {
  rotation = 0, crop = FULL_CROP, maxEdge = ATTACHMENT_EDGE,
  targetBytes = ATTACHMENT_TARGET_BYTES, name = file.name,
} = {}) {
  const rect = normalizedCrop(crop);
  if (!Number.isSafeInteger(targetBytes) || targetBytes < 1) throw new Error('imageSize');
  if (!Number.isSafeInteger(maxEdge) || maxEdge < 1 || maxEdge > 2400) throw new Error('imageSize');
  let bitmap;
  let canvas;
  let best;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const size = imageDimensions(bitmap.width, bitmap.height, rotation);
    for (const factor of [1, 0.8, 0.64]) {
      const edge = Math.max(1, Math.round(maxEdge * factor));
      const dimensions = attachmentDimensions(size.width, size.height, rect, edge);
      canvas = drawImage(bitmap, rotation, rect, dimensions);
      try {
        for (const quality of [0.84, 0.72, 0.60]) {
          const blob = await jpegBlob(canvas, quality);
          if (!best || blob.size < best.blob.size) best = { blob, ...dimensions, quality };
          if (blob.size <= targetBytes) break;
        }
      } finally {
        canvas.width = canvas.height = 0;
      }
      if (best.blob.size <= targetBytes) break;
    }
    const attachment = new File([best.blob], attachmentName(name), { type: 'image/jpeg' });
    return {
      file: attachment, width: best.width, height: best.height, quality: best.quality,
      originalSize: file.size, size: attachment.size, crop: rect,
      targetMet: attachment.size <= targetBytes,
    };
  } finally {
    if (canvas) canvas.width = canvas.height = 0;
    bitmap?.close();
  }
}
