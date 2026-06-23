const STUDIO_URL = process.env.SANITY_STUDIO_URL ?? "http://localhost:3333";

const cards = [
  {
    title: "Sanity Studio",
    description: "記事・著者・カテゴリの管理",
    href: STUDIO_URL,
    external: true,
    ready: true,
  },
  {
    title: "アナリティクス",
    description: "Google Analytics 4",
    href: null,
    external: false,
    ready: false,
  },
  {
    title: "AdSense 収益",
    description: "広告収益レポート",
    href: null,
    external: false,
    ready: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-bold">orange-grape ダッシュボード</h1>
      </header>

      <main id="main-content">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {cards.map((card) => (
            <li key={card.title}>
              {card.href ? (
                <a
                  href={card.href}
                  target={card.external ? "_blank" : undefined}
                  rel={card.external ? "noopener noreferrer" : undefined}
                  className="block p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500 transition-colors"
                >
                  <h2 className="font-semibold mb-1">{card.title}</h2>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </a>
              ) : (
                <div
                  className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed"
                  aria-label={`${card.title}（準備中）`}
                >
                  <h2 className="font-semibold mb-1">{card.title}</h2>
                  <p className="text-sm text-gray-500">{card.description}（準備中）</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
