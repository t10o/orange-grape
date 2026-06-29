export const dynamic = "force-dynamic";

import { google } from "googleapis";

type DailyRow = {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
};

type TopPage = {
  path: string;
  pageviews: number;
};

function createAnalyticsClient() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!client_email || !private_key) {
    throw new Error("Google service account credentials are not configured");
  }
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is not configured");

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });

  return { client: google.analyticsdata({ version: "v1beta", auth }), propertyId };
}

async function fetchAnalyticsData() {
  const { client, propertyId } = createAnalyticsClient();
  const property = `properties/${propertyId}`;

  const [dailyRes, pagesRes] = await Promise.all([
    client.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    }),
    client.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      },
    }),
  ]);

  const daily: DailyRow[] = (dailyRes.data.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
    users: Number(row.metricValues?.[1]?.value ?? 0),
    pageviews: Number(row.metricValues?.[2]?.value ?? 0),
  }));

  const topPages: TopPage[] = (pagesRes.data.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    pageviews: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  const totals = daily.reduce(
    (acc, row) => ({
      sessions: acc.sessions + row.sessions,
      users: acc.users + row.users,
      pageviews: acc.pageviews + row.pageviews,
    }),
    { sessions: 0, users: 0, pageviews: 0 },
  );

  return { daily, topPages, totals };
}

function formatDate(yyyymmdd: string) {
  return `${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  let data: Awaited<ReturnType<typeof fetchAnalyticsData>> | null = null;
  let error: string | null = null;

  try {
    data = await fetchAnalyticsData();
  } catch (e) {
    error = e instanceof Error ? e.message : "データの取得に失敗しました";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8 flex items-center gap-4">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          ← ダッシュボード
        </a>
        <h1 className="text-2xl font-bold">アナリティクス</h1>
        <span className="text-sm text-gray-400">過去 30 日間</span>
      </header>

      <main id="main-content">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-6 text-red-700 dark:text-red-300">
            <p className="font-semibold mb-1">エラー</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="セッション" value={data.totals.sessions} />
              <StatCard label="ユーザー" value={data.totals.users} />
              <StatCard label="ページビュー" value={data.totals.pageviews} />
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-4">日別ページビュー</h2>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">日付</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">セッション</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">ユーザー</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">PV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((row) => (
                      <tr
                        key={row.date}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-4 py-2 text-right">{row.sessions.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.users.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.pageviews.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">人気ページ Top 10</h2>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">パス</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">PV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((page) => (
                      <tr
                        key={page.path}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-2 font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-xs">
                          {page.path}
                        </td>
                        <td className="px-4 py-2 text-right">{page.pageviews.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
