import { client } from "./sanity";
import type { SanityPost } from "@orange-grape/types";

const POST_FIELDS = `
  _id,
  _updatedAt,
  title,
  slug { current },
  publishedAt,
  excerpt,
  mainImage {
    asset-> {
      _ref,
      url,
      metadata { lqip, dimensions { width, height } }
    },
    alt,
    hotspot
  },
  "author": author-> { name, image { asset-> { url } } },
  "categories": categories[]-> { title, slug { current } }
`;

export async function getAllPosts(): Promise<SanityPost[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
     | order(publishedAt desc) { ${POST_FIELDS} }`,
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      ${POST_FIELDS},
      body[] {
        ...,
        _type == "image" => {
          asset-> {
            _ref, url,
            metadata { lqip, dimensions { width, height } }
          }
        }
      }
    }`,
    { slug },
  );
}

export async function getAllSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current`,
  );
}
