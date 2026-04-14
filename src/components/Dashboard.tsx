import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, Moon, Users, DollarSign, Activity,
} from "lucide-react";
import {
  mockDashboardStats, mockOrderTrend, mockChannelDistribution,
  mockCityDistribution, mockTagDistribution, mockTopHotels,
  mockRoomTypeDistribution, mockBookingTimeDistribution,
  mockRoomNightDistribution, mockOperators, mockChannelAccountUsage, mockShops,
} from "@/lib/mock-data";

const CHART_COLORS = [
  "oklch(0.65 0.2 250)",
  "oklch(0.7 0.18 170)",
  "oklch(0.75 0.15 80)",
  "oklch(0.65 0.22 310)",
  "oklch(0.65 0.2 25)",
  "oklch(0.7 0.15 130)",
  "oklch(0.6 0.18 290)",
  "oklch(0.72 0.14 50)",
];

const chartTooltipStyle = {
  contentStyle: {
    background: "oklch(0.19 0.025 260)",
    border: "1px solid oklch(0.25 0.015 260)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "oklch(0.93 0.01 260)",
    boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
  },
};

const axisStyle = { fontSize: 11, fill: "oklch(0.5 0.02 260)" };

function StatCard({ title, value, change, icon: Icon, accentColor }: {
  title: string; value: number | string; change?: number; icon: React.ElementType; accentColor?: string;
}) {
  return (
    <Card className="card-hover border-border/50 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center text-xs font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {change >= 0 ? "+" : ""}{change}% 环比
              </div>
            )}
          </div>
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ background: accentColor ? `color-mix(in oklch, ${accentColor} 15%, transparent)` : "oklch(0.65 0.2 250 / 0.12)" }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor || "oklch(0.65 0.2 250)" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
      <Activity className="h-3.5 w-3.5" />
      {children}
    </h3>
  );
}

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [shopFilter, setShopFilter] = useState("all");
  const stats = mockDashboardStats;

  return (
    <div className="p-5 md:p-7 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">数据大盘</h1>
          <p className="text-sm text-muted-foreground mt-0.5">实时监控运营数据</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-card border-border/50">
              <SelectValue placeholder="全部店铺" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部店铺</SelectItem>
              {mockShops.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-xs bg-card border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今日</SelectItem>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="今日订单" value={stats.todayOrders} change={stats.todayOrdersChange} icon={ShoppingCart} accentColor="oklch(0.65 0.2 250)" />
        <StatCard title="总订单数" value={stats.totalOrders} icon={ShoppingCart} accentColor="oklch(0.7 0.18 170)" />
        <StatCard title="总房晚数" value={stats.totalRoomNights} icon={Moon} accentColor="oklch(0.65 0.22 310)" />
        <StatCard title="总用户数" value={stats.totalUsers} icon={Users} accentColor="oklch(0.75 0.15 80)" />
        <StatCard title="总盈利" value={`¥${(stats.totalRevenue / 10000).toFixed(1)}万`} change={stats.revenueChange} icon={DollarSign} accentColor="oklch(0.65 0.2 25)" />
      </div>

      {/* Order trend */}
      <div className="space-y-3">
        <SectionTitle>订单趋势</SectionTitle>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="orders" name="订单数" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[0] }} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="收入(¥)" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[1] }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution charts */}
      <div className="space-y-3">
        <SectionTitle>数据分布</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card className="border-border/50 bg-card/80 card-hover">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">渠道分布</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={mockChannelDistribution} dataKey="orders" nameKey="channel" cx="50%" cy="50%" outerRadius={95} innerRadius={50} label={({ channel, percentage }) => `${channel} ${percentage}%`} labelLine={{ stroke: "oklch(0.4 0.02 260)" }}>
                    {mockChannelDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 card-hover">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">标签分布</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mockTagDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis dataKey="tag" type="category" width={50} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="count" name="数量" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 card-hover">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">城市分布</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mockCityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" vertical={false} />
                  <XAxis dataKey="city" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="orders" name="订单数" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 card-hover">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">房型分布</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mockRoomTypeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis dataKey="roomType" type="category" width={80} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="count" name="数量" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/50 bg-card/80 card-hover">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">房晚分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={mockRoomNightDistribution} dataKey="count" nameKey="nights" cx="50%" cy="50%" outerRadius={85} innerRadius={40} label={({ nights, count }) => `${nights}: ${count}`} labelLine={{ stroke: "oklch(0.4 0.02 260)" }}>
                  {mockRoomNightDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 card-hover">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">下单时间段分析</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockBookingTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" vertical={false} />
                <XAxis dataKey="hour" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="订单数" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        <SectionTitle>排行榜</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top 酒店</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">酒店</TableHead>
                    <TableHead className="text-xs">订单</TableHead>
                    <TableHead className="text-xs text-right">收入</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTopHotels.map((h, i) => (
                    <TableRow key={h.name} className="border-border/20">
                      <TableCell>
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                          i < 3 ? "bg-primary/15 text-primary" : "text-muted-foreground"
                        }`}>{i + 1}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[160px] truncate">{h.name}</TableCell>
                      <TableCell className="text-xs">{h.orders}</TableCell>
                      <TableCell className="text-xs text-right font-mono">¥{h.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">运营人员排名</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">姓名</TableHead>
                    <TableHead className="text-xs">处理量</TableHead>
                    <TableHead className="text-xs text-right">均时</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOperators.map((op, i) => (
                    <TableRow key={op.id} className="border-border/20">
                      <TableCell>
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                          i < 3 ? "bg-primary/15 text-primary" : "text-muted-foreground"
                        }`}>{i + 1}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{op.name}</TableCell>
                      <TableCell className="text-xs">{op.ordersHandled}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{op.avgProcessingMinutes}min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Channel account usage */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">渠道账号使用量</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">账号</TableHead>
                <TableHead className="text-xs">渠道</TableHead>
                <TableHead className="text-xs">下单量</TableHead>
                <TableHead className="text-xs">配额</TableHead>
                <TableHead className="text-xs">使用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChannelAccountUsage.map((a) => {
                const pct = Math.round((a.orders / a.quota) * 100);
                return (
                  <TableRow key={a.account} className="border-border/20">
                    <TableCell className="font-mono text-[11px]">{a.account}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] h-5 border-border/50">{a.channel}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{a.orders}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{a.quota}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: pct > 80 ? "oklch(0.65 0.2 25)" : pct > 50 ? "oklch(0.75 0.15 80)" : "oklch(0.65 0.2 250)",
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
