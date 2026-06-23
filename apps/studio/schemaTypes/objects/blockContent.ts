import { ImageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const blockContentType = defineType({
  name: "blockContent",
  title: "本文コンテンツ",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "標準", value: "normal" },
        { title: "見出し H2", value: "h2" },
        { title: "見出し H3", value: "h3" },
        { title: "見出し H4", value: "h4" },
        { title: "引用", value: "blockquote" },
      ],
      lists: [
        { title: "箇条書き", value: "bullet" },
        { title: "番号付き", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "太字", value: "strong" },
          { title: "斜体", value: "em" },
          { title: "コード", value: "code" },
          { title: "下線", value: "underline" },
          { title: "取り消し線", value: "strike-through" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "リンク",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (r) =>
                  r.required().uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "代替テキスト",
          type: "string",
          validation: (r) => r.required().warning("アクセシビリティのため必須です"),
        }),
        defineField({
          name: "caption",
          title: "キャプション",
          type: "string",
        }),
      ],
    }),
  ],
});
