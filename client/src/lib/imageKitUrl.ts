type CropMode = "at_max" | "maintain_ratio";

type TextLayerDimensions = {
  w?: number;
  h?: number;
};

export type ImageKitOptions = {
  w?: number;
  h?: number;
  q?: number;
  f?: string;
  crop?: CropMode;
  watermark?: boolean;
};

/**
 * Text overlay (brand watermark). Chained after base transforms with ":".
 * @see https://imagekit.io/docs/add-overlays-on-images
 */
function buildNexoraTextLayer({ w, h }: TextLayerDimensions): string {
  const maxDim = Math.max(
    w != null && w > 0 ? w : 0,
    h != null && h > 0 ? h : 0,
    200,
  );

  // eslint-disable-next-line no-useless-assignment
  let fs = 28;

  if (maxDim <= 180) fs = 11;
  else if (maxDim <= 240) fs = 13;
  else if (maxDim <= 400) fs = 16;
  else if (maxDim <= 700) fs = 22;
  else fs = 30;

  return `l-text,i-Nexora,fs-${fs},co-FFFFFF,bg-0F172A90,pa-8_12,lx-N14,ly-14,lap-top_right,l-end`;
}

/**
 * Build ImageKit transformation path segment (resize, crop, quality, format).
 * @see https://imagekit.io/docs/image-optimization
 * @see https://imagekit.io/docs/image-resize-and-crop
 */
function buildTrSegment({
  w,
  h,
  q = 80,
  f = "auto",
  crop,
  watermark = false,
}: ImageKitOptions): string {
  const parts: string[] = [];

  if (w != null && w > 0) {
    parts.push(`w-${Math.round(w)}`);
  }

  if (h != null && h > 0) {
    parts.push(`h-${Math.round(h)}`);
  }

  if (w != null && w > 0 && h != null && h > 0) {
    const mode = crop ?? "at_max";
    parts.push(`c-${mode}`);
  }

  parts.push(`q-${Math.min(100, Math.max(1, Math.round(q)))}`);
  parts.push(`f-${f}`);

  const base = `tr:${parts.join(",")}`;

  if (!watermark) {
    return base;
  }

  return `${base}:${buildNexoraTextLayer({ w, h })}`;
}

function isImageKitDeliveryUrl(url: string): boolean {
  try {
    const u = new URL(url);

    if (u.hostname.endsWith("ik.imagekit.io")) {
      return true;
    }

    const endpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT?.replace(
      /\/$/,
      "",
    );

    if (endpoint && url.startsWith(endpoint)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Applies ImageKit URL transformations for smaller, auto-formatted images.
 * Non-ImageKit URLs are returned unchanged.
 */
export function imageKitOptimizedUrl(
  url: string | null | undefined,
  opts: ImageKitOptions = {},
): string | undefined {
  if (url == null || url === "") {
    return url ?? undefined;
  }

  if (typeof url !== "string" || !isImageKitDeliveryUrl(url)) {
    return url;
  }

  const tr = buildTrSegment(opts);

  try {
    const u = new URL(url);

    if (u.hostname.endsWith("ik.imagekit.io")) {
      const segments = u.pathname.split("/").filter(Boolean);

      if (segments.length < 2) {
        return url;
      }

      const id = segments[0];
      const rest = segments.slice(1);

      while (
        rest.length &&
        rest[0].toLowerCase().startsWith("tr")
      ) {
        rest.shift();
      }

      if (!rest.length) {
        return url;
      }

      u.pathname = `/${id}/${tr}/${rest.join("/")}`;

      return u.toString();
    }

    const endpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT?.replace(
      /\/$/,
      "",
    );

    if (endpoint && url.startsWith(endpoint)) {
      const epUrl = new URL(endpoint);

      const basePath = epUrl.pathname.replace(/\/$/, "") || "";

      if (!u.pathname.startsWith(basePath)) {
        return url;
      }

      const rel = u.pathname
        .slice(basePath.length)
        .replace(/^\//, "");

      const relSegs = rel.split("/").filter(Boolean);

      while (
        relSegs.length &&
        relSegs[0].toLowerCase().startsWith("tr")
      ) {
        relSegs.shift();
      }

      if (!relSegs.length) {
        return url;
      }

      u.pathname = `${basePath}/${tr}/${relSegs.join("/")}`;

      return u.toString();
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Same optimizations as imageKitOptimizedUrl plus Nexora text overlay.
 */
export function imageKitWatermarkedUrl(
  url: string | null | undefined,
  opts: ImageKitOptions = {},
): string | undefined {
  return imageKitOptimizedUrl(url, {
    ...opts,
    watermark: true,
  });
}

/** Presets aligned to layout (2× for retina where useful). */
export const IK_PRESETS = {
  catalogCard: {
    w: 800,
    h: 600,
    q: 80,
    f: "auto",
  },

  productHero: {
    w: 1200,
    h: 1200,
    q: 82,
    f: "auto",
  },

  adminThumb: {
    w: 144,
    h: 144,
    q: 80,
    f: "auto",
  },

  cartThumb: {
    w: 192,
    h: 192,
    q: 80,
    f: "auto",
  },

  orderLineThumb: {
    w: 224,
    h: 224,
    q: 80,
    f: "auto",
  },

  orderPreviewMd: {
    w: 176,
    h: 176,
    q: 80,
    f: "auto",
  },

  orderPreviewLg: {
    w: 288,
    h: 288,
    q: 80,
    f: "auto",
  },

  formPreview: {
    w: 640,
    h: 320,
    q: 80,
    f: "auto",
  },
} satisfies Record<string, ImageKitOptions>;