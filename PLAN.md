# orange-grape プロジェクト計画

## 概要

AdSense 収益・SEO・アクセシビリティを両立するモダンブログを構築する。
Turborepo モノレポでブログサイト（Astro）と管理画面（Next.js）を同一リポジトリで管理。

---

## 1. 技術スタック

### コア

| 役割 | 採用技術 | 理由 |
|------|----------|------|
| モノレポ管理 | Turborepo + pnpm workspaces | 2026年デファクト。Rust 製キャッシュで CI 最大 70% 削減 |
| 言語 | TypeScript 5 | 全パッケージ共通 |
| スタイリング | Tailwind CSS v4 | ゼロランタイム、JIT、monorepo での共有が容易 |
| Lint / Format | Biome | ESLint + Prettier を一本化、超高速 |
| テスト | Vitest + Playwright | UT は Vitest、E2E は Playwright |

### アプリ

| アプリ | 技術 | 目的 |
|--------|------|------|
| `apps/blog` | Astro 5 (SSG + 部分的 SSR) | 公開ブログ。SEO・Core Web Vitals 最優先 |
| `apps/admin` | Next.js 15 (App Router) | Sanity Studio + 管理ダッシュボード |

### CMS: Sanity v3（確定）

- 無料プランで商用利用・広告掲載を明示的に許可
- 無料枠: ドキュメント 10,000件 / API 50万req/月 / 帯域 100GB / 3ユーザー
- GROQ クエリで柔軟なコンテンツ取得
- Next.js admin に Sanity Studio を `/studio` ルートとして埋め込み可能
- 画像変換 CDN 内蔵（@sanity/image-url）

### ホスティング

| アプリ | サービス | 理由 |
|--------|----------|------|
| `blog`（Astro） | Cloudflare Pages | 無料プランで商用・AdSense 利用を許可。帯域無制限 |
| `admin`（Next.js） | Cloudflare Pages + @opennextjs/cloudflare | 同一プラットフォームで運用統一 |

> **Vercel を使わない理由:** Hobby プランは商用利用・AdSense を規約で明示禁止（2026年4月更新）

---

## 2. アーキテクチャ

```
User（読者）
  │ HTTPS
  ▼
Cloudflare Pages（blog）
  │ GROQ API / REST
  ▼
Sanity CDN ←── Sanity Studio（admin Next.js の /studio）
                    ↑
                Admin（管理者）
```

- **ビルド時:** Astro が Sanity API を叩いて静的 HTML を生成
- **記事更新時:** Sanity の Webhook → Cloudflare Pages の Deploy Hook でリビルド

---

## 3. ディレクトリ構成

```
orange-grape/
├── apps/
│   ├── blog/                    # Astro ブログ
│   │   ├── src/
│   │   │   ├── pages/           # SSG ルーティング
│   │   │   ├── layouts/         # BaseLayout（a11y・SEO タグ集約）
│   │   │   ├── components/      # Astro/Preact コンポーネント
│   │   │   └── content/         # Astro Content Collections（型安全）
│   │   └── astro.config.ts
│   └── admin/                   # Next.js 管理画面
│       ├── app/
│       │   ├── studio/[[...tool]]/  # Sanity Studio 埋め込み
│       │   └── dashboard/           # 管理ダッシュボード
│       └── sanity.config.ts
├── packages/
│   ├── types/                   # 共有 TypeScript 型（記事・カテゴリ等）
│   └── ui/                      # 共有 UI コンポーネント（任意）
├── tooling/
│   ├── typescript/              # tsconfig ベース
│   ├── biome/                   # Biome 共有設定
│   └── tailwind/                # Tailwind 共有設定
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 4. SEO 戦略

### 基本施策（Astro）

- **完全静的生成 (SSG):** 全記事をビルド時に HTML 化。JS ゼロのページが基本
- **@astrojs/sitemap:** `/sitemap-index.xml` を自動生成
- **構造化データ (JSON-LD):**
  - Article スキーマ（著者・公開日・更新日）
  - BreadcrumbList スキーマ
  - WebSite + SearchAction スキーマ（トップページ）
- **OGP / Twitter Card:** 全ページに og:image（Sanity 画像変換で動的生成）
- **Canonical URL:** 重複コンテンツ防止
- **robots.txt:** 管理画面・下書きを Disallow

### Core Web Vitals 対策

- **LCP:** 記事アイキャッチに `loading="eager"` + `fetchpriority="high"` + AVIF/WebP
- **INP:** インタラクション部分のみ Islands Architecture でハイドレート（Preact 推奨）
- **CLS:** 画像・広告に `aspect-ratio` で高さ予約

### 広告と SEO の両立

- AdSense Auto Ads を有効化しつつ、記事本文直下に手動配置スロットを1つ設定
- 広告コンテナに `min-height` を設定し CLS を抑制

---

## 5. アクセシビリティ戦略（WCAG 2.2 AA 準拠目標）

### HTML 構造

- **スキップナビゲーション:** `<a href="#main-content">` を全ページ先頭に配置
- **セマンティック HTML:** `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- **見出し階層:** h1 は1ページに1つ、h2→h3 の順序を守る
- **lang 属性:** `<html lang="ja">` を明示

### 色・コントラスト

- テキストと背景のコントラスト比 4.5:1 以上（AA）
- インタラクティブ要素は 3:1 以上
- カラーだけで情報を伝えない（アイコン・テキストを併用）

### キーボード・フォーカス

- `:focus-visible` でフォーカスリングを必ず表示（`outline: none` 禁止）
- モーダル・ドロップダウンはフォーカストラップを実装
- 全インタラクションをキーボードのみで完結できること

### 支援技術

- `aria-label` / `aria-labelledby` / `aria-describedby` を適切に使用
- `aria-live="polite"` でページ内更新を通知
- 画像に `alt` テキスト必須（装飾画像は `alt=""`）
- フォームに `<label>` と `aria-required` を設定

### Lint

- `apps/admin`（React）: eslint-plugin-jsx-a11y
- `apps/blog`（Astro）: Biome + 手動 axe DevTools チェック

---

## 6. Google AdSense 実装

1. Cloudflare Pages にブログをデプロイ
2. Google AdSense にサイトを申請（コンテンツが充実してから）
3. `ads.txt` を `public/` に配置
4. Auto Ads スクリプトを BaseLayout の `<head>` に埋め込み
5. 手動スロット（記事本文直下・サイドバー）を追加

> **CLS 対策:** 広告枠のコンテナに `min-height: 250px` を事前確保

---

## 7. 開発ワークフロー

```bash
# 初期セットアップ
pnpm install
pnpm turbo build

# 開発サーバー（並列起動）
pnpm turbo dev

# Lint / Format
pnpm turbo lint
pnpm biome check --apply .

# テスト
pnpm turbo test        # Vitest
pnpm turbo test:e2e    # Playwright
```

### CI（GitHub Actions）

1. `pnpm turbo lint` → `pnpm turbo build` → `pnpm turbo test`
2. Turborepo Remote Cache（Cloudflare R2）でビルドキャッシュ

---

## 8. 実装フェーズ

### Phase 1: モノレポ基盤セットアップ ✅
- [x] `pnpm init` + Turborepo 2.9.18 初期化
- [x] `pnpm-workspace.yaml` 設定（catalog で TypeScript 共通管理）
- [x] Biome 2.5.0 設定（lint + format）
- [x] `turbo.json` パイプライン定義（build, dev, lint, test, test:e2e, clean）
- [x] `tooling/` 共有設定（tsconfig.base.json・tailwind/base.css・biome.json）

### Phase 2: ブログアプリ（apps/blog）✅
- [x] Astro 6.4.8 プロジェクト作成（`output: "static"`）
- [x] Tailwind CSS v4.3 統合（`@tailwindcss/vite` Vite プラグイン）
- [x] Sanity クライアント設定（`src/lib/sanity.ts`）
- [x] GROQ クエリ定義（`src/lib/queries.ts`）
- [x] 記事一覧ページ実装（`src/pages/index.astro`）
- [x] 記事詳細ページ実装（`src/pages/blog/[slug].astro`）
- [x] BaseLayout 実装（SEO タグ・スキップナビ・a11y 基盤）
- [x] 構造化データ (JSON-LD) 実装（Article・WebSite・BreadcrumbList）
- [x] sitemap（@astrojs/sitemap）/ robots.txt 生成
- [x] Google Analytics 4 組み込み（BaseLayout）
- [x] AdSense スクリプト組み込み（BaseLayout + `.ad-slot` CLS 対策）
- [ ] Cloudflare Pages デプロイ設定（要: Sanity プロジェクト作成後）
- [ ] Sanity Webhook → Cloudflare Deploy Hook 設定（Phase 3 と同時に）

### Phase 3: Studio + 管理画面 ✅
> **アーキテクチャ変更**: Sanity Studio は standalone（`apps/studio/`）に分離。embedded は非推奨のため採用しない。

- [x] `apps/studio/`: Sanity Studio standalone セットアップ（Vite ベース）
- [x] Sanity スキーマ定義（post・author・category・blockContent）
- [x] `apps/admin/`: Next.js 16.2.9 App Router ダッシュボード
- [x] @opennextjs/cloudflare 1.19.11 設定
- [ ] アナリティクスダッシュボード実装（GA4 Data API 連携）
- [ ] AdSense 収益レポート実装（AdSense API 連携）
- [ ] Cloudflare Pages デプロイ設定（studio / admin 両方）

### Phase 4: CI/CD
- [ ] GitHub Actions ワークフロー設定
- [ ] Vitest ユニットテスト
- [ ] Playwright E2E テスト
- [ ] Cloudflare Pages 自動デプロイ

---

## 9. 検証基準

| 観点 | 手順 |
|------|------|
| ビルド | `pnpm turbo build` でエラーなし |
| SEO | Lighthouse で Performance / SEO スコア 90+ |
| アクセシビリティ | Lighthouse Accessibility 90+ / axe DevTools でエラー0 |
| Core Web Vitals | PageSpeed Insights で LCP < 2.5s, CLS < 0.1 |
| 広告 | AdSense テストモードで広告表示確認 |
| 管理画面 | Sanity Studio で記事作成 → Webhook → Cloudflare Pages 再ビルド → 公開確認 |

---

## 未決事項

- [ ] 共有パッケージ（`packages/`）の粒度設計
- [ ] Sanity スキーマ詳細設計（記事・タグ・著者等）
- [ ] 認証方式（admin アクセス制限）
- [ ] ブログの言語（日本語のみ or 将来的な多言語対応）
