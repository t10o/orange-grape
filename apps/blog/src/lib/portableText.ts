import type { SanityBlock, SanityMarkDef, SanitySpan } from "@orange-grape/types";
import { urlFor } from "./image";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSpan(span: SanitySpan, markDefs: SanityMarkDef[]): string {
  let text = escapeHtml(span.text);
  if (!span.marks || span.marks.length === 0) return text;

  for (const mark of [...span.marks].reverse()) {
    const def = markDefs.find((m) => m._key === mark);
    if (def) {
      if (def._type === "link" && def.href) {
        const isExternal = !def.href.startsWith("/");
        const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
        text = `<a href="${escapeHtml(def.href)}"${attrs}>${text}</a>`;
      }
    } else {
      switch (mark) {
        case "strong":
          text = `<strong>${text}</strong>`;
          break;
        case "em":
          text = `<em>${text}</em>`;
          break;
        case "code":
          text = `<code>${text}</code>`;
          break;
        case "underline":
          text = `<u>${text}</u>`;
          break;
        case "strike-through":
          text = `<s>${text}</s>`;
          break;
      }
    }
  }
  return text;
}

function renderNormalBlock(block: SanityBlock): string {
  const markDefs = block.markDefs ?? [];
  const children = block.children ?? [];
  const content = children.map((s) => renderSpan(s, markDefs)).join("");
  const style = block.style ?? "normal";

  switch (style) {
    case "h1":
      return `<h1>${content}</h1>`;
    case "h2":
      return `<h2>${content}</h2>`;
    case "h3":
      return `<h3>${content}</h3>`;
    case "h4":
      return `<h4>${content}</h4>`;
    case "h5":
      return `<h5>${content}</h5>`;
    case "h6":
      return `<h6>${content}</h6>`;
    case "blockquote":
      return `<blockquote><p>${content}</p></blockquote>`;
    default:
      return content ? `<p>${content}</p>` : "";
  }
}

function renderImageBlock(block: SanityBlock): string {
  if (!block.asset) return "";
  const src = urlFor(block as any)
    .width(800)
    .auto("format")
    .url();
  const alt = escapeHtml((block.alt as string) ?? "");
  const asset = block.asset as { metadata?: { dimensions?: { width: number; height: number } } };
  const w = asset.metadata?.dimensions?.width ?? 800;
  const h = asset.metadata?.dimensions?.height ?? 600;
  const caption = block.caption
    ? `<figcaption>${escapeHtml(block.caption as string)}</figcaption>`
    : "";
  return `<figure><img src="${src}" alt="${alt}" width="${w}" height="${h}" loading="lazy" style="aspect-ratio:${w}/${h}">${caption}</figure>`;
}

export function renderPortableText(blocks: SanityBlock[]): string {
  const output: string[] = [];
  let listBuffer: string[] = [];
  let listType: "bullet" | "number" | null = null;

  function flushList() {
    if (listBuffer.length === 0) return;
    const tag = listType === "number" ? "ol" : "ul";
    output.push(`<${tag}>${listBuffer.join("")}</${tag}>`);
    listBuffer = [];
    listType = null;
  }

  for (const block of blocks) {
    if (block._type === "image") {
      flushList();
      output.push(renderImageBlock(block));
      continue;
    }

    if (block._type === "block") {
      const item = block.listItem as string | undefined;
      if (item) {
        const type = item === "number" ? "number" : "bullet";
        if (listType !== type) {
          flushList();
          listType = type;
        }
        const inner = renderNormalBlock({ ...block, style: "normal" }).replace(/^<p>|<\/p>$/g, "");
        listBuffer.push(`<li>${inner}</li>`);
      } else {
        flushList();
        const html = renderNormalBlock(block);
        if (html) output.push(html);
      }
    }
  }

  flushList();
  return output.join("\n");
}
