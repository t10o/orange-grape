import imageUrlBuilder from "@sanity/image-url";
import type { SanityImage } from "@orange-grape/types";
import { client } from "./sanity";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}
