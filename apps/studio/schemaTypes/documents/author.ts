import { defineType, defineField } from "sanity";
import { UserIcon } from "@sanity/icons";

export const authorType = defineType({
  name: "author",
  title: "著者",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "名前",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "プロフィール画像",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "代替テキスト",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "bio",
      title: "プロフィール",
      type: "text",
      rows: 4,
      validation: (r) => r.max(500),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
});
