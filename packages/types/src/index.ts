export interface SanityImage {
  asset: {
    _ref: string;
    url: string;
    metadata: {
      lqip: string;
      dimensions: { width: number; height: number };
    };
  };
  alt?: string;
  hotspot?: { x: number; y: number };
}

export interface SanityMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

export interface SanitySpan {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
}

export interface SanityBlock {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  markDefs?: SanityMarkDef[];
  children?: SanitySpan[];
  [key: string]: unknown;
}

export interface SanityPost {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  mainImage?: SanityImage;
  body: SanityBlock[];
  author?: {
    name: string;
    image?: SanityImage;
  };
  categories?: Array<{
    title: string;
    slug: { current: string };
  }>;
}
