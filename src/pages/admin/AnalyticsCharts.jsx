import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AnalyticsCharts = ({
  monthlyData,
  statusData,
  categoryData,
  filteredIssues,
  stats,
  colors,
}) => {
  return (
    <>
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4 lg:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#00236f]">
              Issue Volume &amp; Resolution
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Reported and resolved issues by month
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="reported"
                  name="Reported"
                  fill="#b6c4ff"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#006a61"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Monthly chart shows the last six calendar months.
            The cards and category breakdown follow your
            selected filters.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3 lg:p-6">
          <h2 className="text-lg font-bold text-[#00236f]">
            Issue Status Distribution
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current status of filtered reports
          </p>

          <div className="h-64 w-full">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No issues found for this selection.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#00236f]">
            Issue Categories Distribution
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Report count and active workload for each category
          </p>
        </div>

        {categoryData.length ? (
          <div className="space-y-5">
            {categoryData.map((item, index) => {
              const percentage = stats.total
                ? (item.value / stats.total) * 100
                : 0;

              const activeCount = filteredIssues.filter(
                (issue) =>
                  (issue.category || "Uncategorized") === item.name &&
                  issue.status !== "Resolved" &&
                  issue.status !== "Rejected"
              ).length;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.value} total · {activeCount} active
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[#00236f]">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            No category data available for this selection.
          </p>
        )}
      </section>
    </>
  );
};

export default AnalyticsCharts;
