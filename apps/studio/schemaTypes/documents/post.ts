import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "ブログ記事",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (r) => r.required().min(1).max(100),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "公開日時",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "抜粋",
      description: "記事一覧・OGP に使用（200文字以内推奨）",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(200).warning("200文字以内を推奨します"),
    }),
    defineField({
      name: "mainImage",
      title: "メイン画像",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "代替テキスト",
          description: "アクセシビリティ対応のため必須",
          type: "string",
          validation: (r) => r.required().warning("アクセシビリティのため必須です"),
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "著者",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "categories",
      title: "カテゴリ",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      validation: (r) => r.max(5).warning("カテゴリは5つ以内を推奨します"),
    }),
    defineField({
      name: "body",
      title: "本文",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, author, media, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString("ja-JP") : "未公開";
      return {
        title,
        subtitle: `${author ? `by ${author}` : "著者未設定"} · ${date}`,
        media,
      };
    },
  },
});
