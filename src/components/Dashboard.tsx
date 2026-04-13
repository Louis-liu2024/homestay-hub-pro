import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, Moon, Users, DollarSign,
} from "lucide-react";
import {
  mockDashboardStats,
  mockOrderTrend,
  mockChannelDistribution,
  mockCityDistribution,
  mockTagDistribution,
  mockTopHotels,
  mockRoomTypeDistribution,
  mockBookingTimeDistribution,
  mockRoomNightDistribution,
  mockOperators,
  mockChannelAccountUsage,
  mockShops,
} from "@/lib/mock-data";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
];

function StatCard({ title, value, change, icon: Icon, prefix = "" }: {
  title: string; value: number | string; change?: number; icon: React.ElementType; prefix?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {change !== undefined && (
              <div className={`flex items-center text-xs ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {change >= 0 ? '+' : ''}{change}% 环比
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [shopFilter, setShopFilter] = useState("all");
  const stats = mockDashboardStats;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">数据大盘</h1>
        <div className="flex items-center gap-3">
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-32">
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="今日订单" value={stats.todayOrders} change={stats.todayOrdersChange} icon={ShoppingCart} />
        <StatCard title="总订单数" value={stats.totalOrders} icon={ShoppingCart} />
        <StatCard title="总房晚数" value={stats.totalRoomNights} icon={Moon} />
        <StatCard title="总用户数" value={stats.totalUsers} icon={Users} />
        <StatCard title="总盈利" value={`¥${(stats.totalRevenue / 10000).toFixed(1)}万`} change={stats.revenueChange} icon={DollarSign} />
      </div>

      {/* Order trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">订单趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockOrderTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" name="订单数" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="收入(¥)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">渠道分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={mockChannelDistribution} dataKey="orders" nameKey="channel" cx="50%" cy="50%" outerRadius={100} label={({ channel, percentage }) => `${channel} ${percentage}%`}>
                  {mockChannelDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tag distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">标签分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockTagDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="tag" type="category" width={50} className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" name="数量" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* City distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">城市分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockCityDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="city" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="orders" name="订单数" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room type distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">房型分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockRoomTypeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="roomType" type="category" width={80} className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" name="数量" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room night distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">房晚分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={mockRoomNightDistribution} dataKey="count" nameKey="nights" cx="50%" cy="50%" outerRadius={90} label={({ nights, count }) => `${nights}: ${count}`}>
                  {mockRoomNightDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking time analysis */}
        <Card>
          <CardHeader><CardTitle className="text-lg">下单时间段分析</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockBookingTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" name="订单数" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top hotels & Operator ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Top 酒店</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>排名</TableHead>
                  <TableHead>酒店</TableHead>
                  <TableHead>订单数</TableHead>
                  <TableHead>收入</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTopHotels.map((h, i) => (
                  <TableRow key={h.name}>
                    <TableCell>
                      <Badge variant={i < 3 ? "default" : "outline"} className="w-6 h-6 p-0 flex items-center justify-center">{i + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">{h.name}</TableCell>
                    <TableCell>{h.orders}</TableCell>
                    <TableCell>¥{h.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">运营人员排名</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>排名</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>处理订单量</TableHead>
                  <TableHead>平均处理时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOperators.map((op, i) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      <Badge variant={i < 3 ? "default" : "outline"} className="w-6 h-6 p-0 flex items-center justify-center">{i + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{op.name}</TableCell>
                    <TableCell>{op.ordersHandled}</TableCell>
                    <TableCell>{op.avgProcessingMinutes}分钟</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Channel account usage */}
      <Card>
        <CardHeader><CardTitle className="text-lg">渠道账号使用量</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>账号ID</TableHead>
                <TableHead>渠道</TableHead>
                <TableHead>下单量</TableHead>
                <TableHead>配额</TableHead>
                <TableHead>使用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChannelAccountUsage.map((a) => (
                <TableRow key={a.account}>
                  <TableCell className="font-mono text-xs">{a.account}</TableCell>
                  <TableCell>{a.channel}</TableCell>
                  <TableCell>{a.orders}</TableCell>
                  <TableCell>{a.quota}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 max-w-[100px] rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(a.orders / a.quota) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round((a.orders / a.quota) * 100)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
