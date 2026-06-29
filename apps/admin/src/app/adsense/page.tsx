export const dynamic = "force-dynamic";

import { google } from "googleapis";

type DailyRow = {
  date: string;
  earnings: number;
  impressions: number;
  clicks: number;
  rpm: number;
};

const METRICS = ["ESTIMATED_EARNINGS", "IMPRESSIONS", "CLICKS", "PAGE_VIEWS_RPM"] as const;

async function fetchAdsenseData() {
  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("AdSense OAuth2 credentials are not configured");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const adsense = google.adsense({ version: "v2", auth: oauth2Client });

  const accountsRes = await adsense.accounts.list();
  const accountName = accountsRes.data.accounts?.[0]?.name;
  if (!accountName) throw new Error("AdSense アカウントが見つかりません");

  const reportRes = await adsense.accounts.reports.generate({
    account: accountName,
    dateRange: "LAST_30_DAYS",
    metrics: [...METRICS],
    dimensions: ["DATE"],
    orderBy: ["+DATE"],
  });

  const report = reportRes.data;
  const headers = report.headers ?? [];

  const colIdx = (name: string) => headers.findIndex((h) => h.name === name);
  const dateCol = colIdx("DATE");
  const earningsCol = colIdx("ESTIMATED_EARNINGS");
  const impCol = colIdx("IMPRESSIONS");
  const clicksCol = colIdx("CLICKS");
  const rpmCol = colIdx("PAGE_VIEWS_RPM");

  const cellVal = (cells: Array<{ value?: string | null }>, idx: number) =>
    cells[idx]?.value ?? "0";

  const daily: DailyRow[] = (report.rows ?? []).map((row) => {
    const cells = row.cells ?? [];
    return {
      date: cellVal(cells, dateCol),
      earnings: Number(cellVal(cells, earningsCol)),
      impressions: Number(cellVal(cells, impCol)),
      clicks: Number(cellVal(cells, clicksCol)),
      rpm: Number(cellVal(cells, rpmCol)),
    };
  });

  const totalCells = report.totals?.cells ?? [];
  return {
    daily,
    totals: {
      earnings: Number(cellVal(totalCells, earningsCol)),
      impressions: Number(cellVal(totalCells, impCol)),
      clicks: Number(cellVal(totalCells, clicksCol)),
      rpm: Number(cellVal(totalCells, rpmCol)),
    },
  };
}

function StatCard({
  label,
  value,
  prefix = "",
  decimals = 0,
}: {
  label: string;
  value: number;
  prefix?: string;
  decimals?: number;
}) {
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">
        {prefix}
        {formatted}
      </p>
    </div>
  );
}

export default async function AdsensePage() {
  let data: Awaited<ReturnType<typeof fetchAdsenseData>> | null = null;
  let error: string | null = null;

  try {
    data = await fetchAdsenseData();
  } catch (e) {
    error = e instanceof Error ? e.message : "データの取得に失敗しました";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8 flex items-center gap-4">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          ← ダッシュボード
        </a>
        <h1 className="text-2xl font-bold">AdSense 収益</h1>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="推定収益" value={data.totals.earnings} prefix="$" decimals={2} />
              <StatCard label="インプレッション" value={data.totals.impressions} />
              <StatCard label="クリック" value={data.totals.clicks} />
              <StatCard label="ページ RPM" value={data.totals.rpm} prefix="$" decimals={2} />
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-4">日別レポート</h2>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">日付</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">推定収益</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        インプレッション
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">クリック</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((row) => (
                      <tr
                        key={row.date}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.date}</td>
                        <td className="px-4 py-2 text-right">${row.earnings.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">{row.impressions.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.clicks.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">${row.rpm.toFixed(2)}</td>
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
