/**
 * Client-side image resizing and WebP conversion utility.
 *
 * Automatically scales large photos down (preserving aspect ratio without upscaling),
 * applies high-quality progressive resampling, and encodes to WebP (with graceful JPEG
 * fallback on browsers that cannot encode WebP) while adaptively keeping payloads
 * lightweight for fast storefront loading and Firestore storage limits.
 */

export type ImageOptimizationPreset = 'trip' | 'hero' | 'booking' | 'review' | 'passport';

export type SupportedOutputMimeType = 'image/webp' | 'image/jpeg';

export interface ImageOptimizationOptions {
  /** Maximum target width in pixels (aspect ratio preserved; never upscaled). */
  maxWidth?: number;
  /** Maximum target height in pixels (aspect ratio preserved; never upscaled). */
  maxHeight?: number;
  /** Initial WebP/JPEG encoding quality (0..1). Defaults to 0.82. */
  quality?: number;
  /** Minimum quality floor before gentle dimension downscaling kicks in. */
  minQuality?: number;
  /** Quality decrement step during adaptive size fitting. */
  qualityStep?: number;
  /** Maximum data URL character length (Firestore rules cap each image field at 250,000 chars). */
  maxDataUrlLength?: number;
  /** Optional target binary size in bytes; converted to equivalent base64 data-URL length if stricter. */
  maxBytes?: number;
  /** Minimum longest-edge dimension allowed during adaptive downscaling. */
  minDimension?: number;
  /** Dimension shrink factor per pass when quality stepping alone exceeds the size budget. */
  downscaleFactor?: number;
  /** Prefer image/webp when supported by the browser canvas encoder. Defaults to true. */
  preferWebP?: boolean;
  /** Background fill color used only when falling back to opaque JPEG encoding. */
  backgroundColor?: string;
}

export interface OptimizedImageResult {
  dataUrl: string;
  mimeType: SupportedOutputMimeType;
  format: 'webp' | 'jpeg';
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  byteSize: number;
  originalByteSize: number;
  quality: number;
}

export const IMAGE_OPTIMIZATION_PRESETS: Record<
  ImageOptimizationPreset,
  Required<
    Pick<
      ImageOptimizationOptions,
      'maxWidth' | 'maxHeight' | 'quality' | 'minQuality' | 'qualityStep' | 'maxDataUrlLength' | 'minDimension'
    >
  >
> = {
  /** Trip gallery & cover photos: crisp 1200x900 WebP, ~80-130 KB binary so 6-8 photos fit comfortably in Firestore. */
  trip: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.82,
    minQuality: 0.56,
    qualityStep: 0.06,
    maxDataUrlLength: 175_000,
    minDimension: 560,
  },
  /** Wide hero banners: sharper 1440px width for desktop hero display while staying under 230k chars. */
  hero: {
    maxWidth: 1440,
    maxHeight: 960,
    quality: 0.84,
    minQuality: 0.58,
    qualityStep: 0.06,
    maxDataUrlLength: 230_000,
    minDimension: 720,
  },
  /** Booking hotel/pickup location photos attached by Owner or Operations. */
  booking: {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 0.8,
    minQuality: 0.54,
    qualityStep: 0.06,
    maxDataUrlLength: 180_000,
    minDimension: 480,
  },
  /** Guest trip review photos. */
  review: {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.8,
    minQuality: 0.54,
    qualityStep: 0.06,
    maxDataUrlLength: 185_000,
    minDimension: 480,
  },
  /** Passport/document scans where text clarity matters. */
  passport: {
    maxWidth: 1120,
    maxHeight: 1120,
    quality: 0.82,
    minQuality: 0.56,
    qualityStep: 0.06,
    maxDataUrlLength: 195_000,
    minDimension: 560,
  },
};

const HARD_FIRESTORE_IMAGE_CHAR_LIMIT = 245_000;
const TOTAL_TRIP_EMBEDDED_IMAGE_CHAR_BUDGET = 720_000;

let cachedWebPSupport: boolean | null = null;

/**
 * Checks whether the current browser's HTMLCanvasElement supports WebP encoding.
 */
export function supportsWebPEncoding(): boolean {
  if (cachedWebPSupport !== null) return cachedWebPSupport;
  if (typeof document === 'undefined') {
    cachedWebPSupport = false;
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const encoded = canvas.toDataURL('image/webp');
    cachedWebPSupport = encoded.startsWith('data:image/webp');
  } catch {
    cachedWebPSupport = false;
  }
  return cachedWebPSupport;
}

/**
 * Estimates the decoded binary byte size of a base64 data URL.
 */
export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl.length;
  const base64 = dataUrl.slice(commaIdx + 1);
  let padding = 0;
  if (base64.endsWith('==')) padding = 2;
  else if (base64.endsWith('=')) padding = 1;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

/**
 * Returns true if the given string is an inline `data:image/...` URI.
 */
export function isImageDataUrl(value: string): boolean {
  return typeof value === 'string' && /^data:image\//i.test(value.trim());
}

/**
 * Returns true if the given string is already a WebP data URI.
 */
export function isWebPDataUrl(value: string): boolean {
  return typeof value === 'string' && /^data:image\/webp(?:;|,)/i.test(value.trim());
}

interface LoadedBitmapSource {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

async function loadImageViaElement(src: string, revokeUrl?: string): Promise<LoadedBitmapSource> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (!width || !height) {
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        reject(new Error('Invalid image dimensions'));
        return;
      }
      resolve({
        source: img,
        width,
        height,
        cleanup: () => {
          if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        },
      });
    };
    img.onerror = () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
      reject(new Error('Failed to decode image'));
    };
    img.src = src;
  });
}

async function loadImageSource(input: File | Blob | string): Promise<LoadedBitmapSource> {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) throw new Error('Empty image input');
    return loadImageViaElement(trimmed);
  }

  // Prefer createImageBitmap for File/Blob so EXIF orientation is respected automatically
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(input);
      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => {
            try {
              bitmap.close();
            } catch {
              // ignore cleanup errors
            }
          },
        };
      }
      bitmap.close();
    } catch {
      // Fallback to HTMLImageElement below
    }
  }

  const objectUrl = URL.createObjectURL(input);
  try {
    return await loadImageViaElement(objectUrl, objectUrl);
  } catch {
    // Secondary fallback via FileReader in case blob URL loading is restricted
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = () => {
        loadImageViaElement(String(reader.result || ''))
          .then(resolve)
          .catch(reject);
      };
      reader.readAsDataURL(input);
    });
  }
}

/**
 * Draws the source image to a canvas of the exact target dimensions, using progressive
 * half-step downsampling when shrinking by more than 2x to keep fine details crisp.
 */
function renderResizedCanvas(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fillBackground?: string
): HTMLCanvasElement {
  let currentSource: CanvasImageSource = source;
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  let intermediateCanvas: HTMLCanvasElement | null = null;

  // Step down by 50% per pass when downscaling heavily (> 2x) to reduce aliasing
  while (currentWidth * 0.5 > targetWidth * 1.15 && currentHeight * 0.5 > targetHeight * 1.15) {
    const stepW = Math.max(targetWidth, Math.round(currentWidth * 0.5));
    const stepH = Math.max(targetHeight, Math.round(currentHeight * 0.5));
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = stepW;
    stepCanvas.height = stepH;
    const stepCtx = stepCanvas.getContext('2d');
    if (!stepCtx) break;
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(currentSource, 0, 0, stepW, stepH);
    if (intermediateCanvas) {
      intermediateCanvas.width = 0;
      intermediateCanvas.height = 0;
    }
    intermediateCanvas = stepCanvas;
    currentSource = stepCanvas;
    currentWidth = stepW;
    currentHeight = stepH;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = Math.max(1, targetWidth);
  finalCanvas.height = Math.max(1, targetHeight);
  const ctx = finalCanvas.getContext('2d');
  if (!ctx) {
    if (intermediateCanvas) {
      intermediateCanvas.width = 0;
      intermediateCanvas.height = 0;
    }
    throw new Error('Canvas 2D context is unavailable');
  }

  if (fillBackground) {
    ctx.fillStyle = fillBackground;
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(currentSource, 0, 0, finalCanvas.width, finalCanvas.height);

  if (intermediateCanvas) {
    intermediateCanvas.width = 0;
    intermediateCanvas.height = 0;
  }

  return finalCanvas;
}

function resolveOptions(
  presetOrOptions?: ImageOptimizationPreset | ImageOptimizationOptions
): Required<Omit<ImageOptimizationOptions, 'maxBytes'>> & { maxBytes?: number } {
  const basePreset =
    typeof presetOrOptions === 'string'
      ? IMAGE_OPTIMIZATION_PRESETS[presetOrOptions]
      : IMAGE_OPTIMIZATION_PRESETS.trip;
  const overrides = typeof presetOrOptions === 'object' && presetOrOptions ? presetOrOptions : {};

  const maxDataUrlFromBytes =
    typeof overrides.maxBytes === 'number' && overrides.maxBytes > 0
      ? Math.floor((overrides.maxBytes * 4) / 3) + 64
      : undefined;

  const requestedMaxLen = overrides.maxDataUrlLength ?? basePreset.maxDataUrlLength;
  const maxDataUrlLength = Math.min(
    HARD_FIRESTORE_IMAGE_CHAR_LIMIT,
    maxDataUrlFromBytes ? Math.min(requestedMaxLen, maxDataUrlFromBytes) : requestedMaxLen
  );

  return {
    maxWidth: Math.max(64, overrides.maxWidth ?? basePreset.maxWidth),
    maxHeight: Math.max(64, overrides.maxHeight ?? basePreset.maxHeight),
    quality: Math.min(0.95, Math.max(0.2, overrides.quality ?? basePreset.quality)),
    minQuality: Math.min(0.9, Math.max(0.2, overrides.minQuality ?? basePreset.minQuality)),
    qualityStep: Math.min(0.2, Math.max(0.02, overrides.qualityStep ?? basePreset.qualityStep)),
    maxDataUrlLength,
    maxBytes: overrides.maxBytes,
    minDimension: Math.max(240, overrides.minDimension ?? basePreset.minDimension),
    downscaleFactor: Math.min(0.95, Math.max(0.65, overrides.downscaleFactor ?? 0.84)),
    preferWebP: overrides.preferWebP ?? true,
    backgroundColor: overrides.backgroundColor ?? '#ffffff',
  };
}

/**
 * Resizes an image (File, Blob, or data URL) and converts it to WebP format
 * (falling back to JPEG only if the browser lacks WebP canvas encoding).
 *
 * Returns the optimized data URL alongside output dimensions and size metrics.
 */
export async function resizeAndConvertImageToWebP(
  input: File | Blob | string,
  presetOrOptions?: ImageOptimizationPreset | ImageOptimizationOptions
): Promise<OptimizedImageResult> {
  if (typeof document === 'undefined') {
    throw new Error('Image optimization requires a browser DOM environment');
  }

  const opts = resolveOptions(presetOrOptions);
  const originalByteSize =
    typeof input === 'string' ? estimateDataUrlBytes(input) : input.size;

  const loaded = await loadImageSource(input);
  try {
    const originalWidth = loaded.width;
    const originalHeight = loaded.height;

    const initialScale = Math.min(
      1,
      opts.maxWidth / originalWidth,
      opts.maxHeight / originalHeight
    );
    let targetWidth = Math.max(1, Math.round(originalWidth * initialScale));
    let targetHeight = Math.max(1, Math.round(originalHeight * initialScale));

    const useWebP = opts.preferWebP && supportsWebPEncoding();
    const targetMime: SupportedOutputMimeType = useWebP ? 'image/webp' : 'image/jpeg';
    const bgFill = targetMime === 'image/jpeg' ? opts.backgroundColor : undefined;

    let bestDataUrl = '';
    let bestWidth = targetWidth;
    let bestHeight = targetHeight;
    let bestQuality = opts.quality;

    const maxDimensionPasses = 4;
    for (let pass = 0; pass < maxDimensionPasses; pass++) {
      const canvas = renderResizedCanvas(
        loaded.source,
        originalWidth,
        originalHeight,
        targetWidth,
        targetHeight,
        bgFill
      );

      let q = opts.quality;
      let fitsBudget = false;
      while (q >= opts.minQuality - 0.001) {
        const clampedQ = Number(Math.max(opts.minQuality, q).toFixed(2));
        const encoded = canvas.toDataURL(targetMime, clampedQ);
        if (encoded && encoded.startsWith('data:image/')) {
          bestDataUrl = encoded;
          bestWidth = canvas.width;
          bestHeight = canvas.height;
          bestQuality = clampedQ;
          if (encoded.length <= opts.maxDataUrlLength) {
            fitsBudget = true;
            break;
          }
        }
        if (clampedQ <= opts.minQuality) break;
        q -= opts.qualityStep;
      }

      canvas.width = 0;
      canvas.height = 0;

      if (fitsBudget) break;

      // Gently reduce dimensions only if quality stepping could not fit the target size budget
      const longestEdge = Math.max(targetWidth, targetHeight);
      if (longestEdge <= opts.minDimension) break;

      const nextScale = Math.max(opts.minDimension / longestEdge, opts.downscaleFactor);
      targetWidth = Math.max(1, Math.round(targetWidth * nextScale));
      targetHeight = Math.max(1, Math.round(targetHeight * nextScale));
    }

    if (!bestDataUrl) {
      throw new Error('Could not encode optimized image');
    }

    const actualMime: SupportedOutputMimeType = isWebPDataUrl(bestDataUrl)
      ? 'image/webp'
      : 'image/jpeg';

    return {
      dataUrl: bestDataUrl,
      mimeType: actualMime,
      format: actualMime === 'image/webp' ? 'webp' : 'jpeg',
      width: bestWidth,
      height: bestHeight,
      originalWidth,
      originalHeight,
      byteSize: estimateDataUrlBytes(bestDataUrl),
      originalByteSize,
      quality: bestQuality,
    };
  } finally {
    loaded.cleanup();
  }
}

/**
 * Convenience helper that resizes and converts a File, Blob, or data URL to a lightweight
 * WebP data URL string using the requested preset or custom options.
 */
export async function optimizeImageToWebP(
  input: File | Blob | string,
  presetOrOptions: ImageOptimizationPreset | ImageOptimizationOptions = 'trip'
): Promise<string> {
  const result = await resizeAndConvertImageToWebP(input, presetOrOptions);
  return result.dataUrl;
}

/**
 * Primary helper for trip images: resizes to crisp gallery dimensions and converts to WebP
 * before storage, returning the full optimization result.
 */
export async function optimizeTripImage(
  input: File | Blob | string,
  options?: ImageOptimizationOptions
): Promise<OptimizedImageResult> {
  return resizeAndConvertImageToWebP(input, {
    ...IMAGE_OPTIMIZATION_PRESETS.trip,
    ...options,
  });
}

/**
 * Idempotent pre-storage normalizer for a single image URL or inline data URL.
 * - Bundled assets, relative paths, and external https:// URLs are returned unchanged.
 * - Inline `data:image/webp` strings already within the size budget are returned unchanged.
 * - Inline non-WebP images (JPEG, PNG, etc.) or oversized inline images are automatically
 *   resized and converted to lightweight WebP before storage.
 */
export async function optimizeTripImageDataUrl(
  image: string,
  presetOrOptions: ImageOptimizationPreset | ImageOptimizationOptions = 'trip'
): Promise<string> {
  const trimmed = typeof image === 'string' ? image.trim() : '';
  if (!trimmed || !isImageDataUrl(trimmed)) {
    return trimmed;
  }

  if (typeof document === 'undefined') {
    return trimmed;
  }

  const opts = resolveOptions(presetOrOptions);
  if (isWebPDataUrl(trimmed) && trimmed.length <= opts.maxDataUrlLength) {
    return trimmed;
  }

  try {
    const optimized = await resizeAndConvertImageToWebP(trimmed, opts);
    return optimized.dataUrl;
  } catch {
    return trimmed;
  }
}

/**
 * Batch pre-storage normalizer for a trip's `images` array.
 * Automatically converts any inline data-URL images to resized WebP and scales the
 * per-image budget dynamically when a trip contains multiple embedded photos so the
 * full Firestore document stays well under Firestore's 1 MiB ceiling.
 */
export async function optimizeTripImagesForStorage(
  images: string[],
  options?: ImageOptimizationOptions
): Promise<string[]> {
  if (!Array.isArray(images) || images.length === 0) return [];

  const embeddedCount = images.filter((img) => isImageDataUrl(img)).length;
  if (embeddedCount === 0 || typeof document === 'undefined') {
    return images;
  }

  const baseMaxLen = options?.maxDataUrlLength ?? IMAGE_OPTIMIZATION_PRESETS.trip.maxDataUrlLength;
  const dynamicPerImageLimit = Math.min(
    baseMaxLen,
    Math.max(85_000, Math.floor(TOTAL_TRIP_EMBEDDED_IMAGE_CHAR_BUDGET / embeddedCount))
  );

  const effectiveOptions: ImageOptimizationOptions = {
    ...IMAGE_OPTIMIZATION_PRESETS.trip,
    ...options,
    maxDataUrlLength: dynamicPerImageLimit,
  };

  return Promise.all(
    images.map((img) => optimizeTripImageDataUrl(img, effectiveOptions))
  );
}
