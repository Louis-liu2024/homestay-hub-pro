import { useEffect, useMemo, useState } from "react";
import { mockOrders, mockShops, mockOtaAccounts, mockOperators } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  HandMetal, CheckCircle2, ListTodo, Clock, CheckCheck, XCircle, Inbox, Timer,
} from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";

const CURRENT_USER = "current_user";
const PROCESS_DEADLINE_MIN = 60; // 建议 1 小时内处理

const statusStyles: Record<OrderStatus, string> = {
  "待领取": "bg-warning/15 text-warning border-warning/30",
  "已领取": "bg-primary/15 text-primary border-primary/30",
  "已完成": "bg-success/15 text-success border-success/30",
  "已取消": "bg-muted text-muted-foreground border-border",
};

const OTA_PLATFORMS = ["携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda"];
const ACCOUNTS = [
  { id: "acc_ct_01", name: "携程主账号 (a***@hotel.com)" },
  { id: "acc_mt_01", name: "美团企业账号 (b***@hotel.com)" },
  { id: "acc_bk_02", name: "Booking 企业 (c***@hotel.com)" },
  { id: "acc_fz_01", name: "飞猪官方账号 (d***@hotel.com)" },
];

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getRemainingMinutes(claimedAt?: string) {
  if (!claimedAt) return null;
  const elapsed = (Date.now() - new Date(claimedAt).getTime()) / 60000;
  return PROCESS_DEADLINE_MIN - elapsed;
}

function CountdownBadge({ claimedAt }: { claimedAt?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const remaining = getRemainingMinutes(claimedAt);
  if (remaining === null) return <span className="text-muted-foreground">—</span>;

  const overdue = remaining < 0;
  const urgent = remaining >= 0 && remaining < 15;
  const abs = Math.abs(remaining);
  const m = Math.floor(abs);
  const s = Math.floor((abs - m) * 60);
  const text = `${m}分${String(s).padStart(2, "0")}秒`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
        overdue
          ? "bg-destructive/10 text-destructive border-destructive/30"
          : urgent
          ? "bg-warning/15 text-warning border-warning/30"
          : "bg-success/10 text-success border-success/30"
      }`}
    >
      <Timer className="h-3 w-3" />
      {overdue ? `已超时 ${text}` : `剩余 ${text}`}
    </span>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [tab, setTab] = useState<"all" | "mine">("all");

  // ---- All orders state ----
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "全部">("全部");
  const [shopFilter, setShopFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchField, setSearchField] = useState<"guestName" | "orderNo" | "otaOrderNo" | "hotelName">("guestName");
  const [searchValue, setSearchValue] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [allPageSize, setAllPageSize] = useState(10);

  // ---- My orders state ----
  const [minePage, setMinePage] = useState(1);
  const [minePageSize, setMinePageSize] = useState(10);

  // ---- Dialogs ----
  const [claimDialog, setClaimDialog] = useState<Order | null>(null);
  const [completeDialog, setCompleteDialog] = useState<Order | null>(null);
  const [completeForm, setCompleteForm] = useState({
    otaPlatform: "",
    otaOrderNo: "",
    paymentAmount: "",
    accountId: "",
    remark: "",
  });

  // ---- Counts ----
  const counts = useMemo(() => {
    const c = { all: orders.length, 待领取: 0, 已领取: 0, 已完成: 0, 已取消: 0 } as Record<string, number>;
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  // ---- Filtered ----
  const allFiltered = useMemo(
    () =>
      orders
        .filter((o) => statusFilter === "全部" || o.status === statusFilter)
        .filter((o) => shopFilter === "all" || o.shopId === shopFilter),
    [orders, statusFilter, shopFilter],
  );
  const allPaged = useMemo(
    () => allFiltered.slice((allPage - 1) * allPageSize, allPage * allPageSize),
    [allFiltered, allPage, allPageSize],
  );

  const mineList = useMemo(
    () =>
      orders
        .filter((o) => o.claimedBy === CURRENT_USER)
        .sort((a, b) => (b.claimedAt || "").localeCompare(a.claimedAt || "")),
    [orders],
  );
  const minePaged = useMemo(
    () => mineList.slice((minePage - 1) * minePageSize, minePage * minePageSize),
    [mineList, minePage, minePageSize],
  );

  // ---- Handlers ----
  const handleClaim = (order: Order) => setClaimDialog(order);

  const confirmClaim = () => {
    if (!claimDialog) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === claimDialog.id
          ? {
              ...o,
              status: "已领取" as OrderStatus,
              claimedBy: CURRENT_USER,
              claimedAt: new Date().toISOString(),
            }
          : o,
      ),
    );
    toast.success("任务已领取，请在 1 小时内处理");
    setClaimDialog(null);
    setTab("mine");
  };

  const openComplete = (order: Order) => {
    setCompleteForm({
      otaPlatform: order.otaPlatform || "",
      otaOrderNo: order.otaOrderNo || "",
      paymentAmount: order.paymentAmount ? String(order.paymentAmount) : "",
      accountId: order.accountId || "",
      remark: order.remark || "",
    });
    setCompleteDialog(order);
  };

  const submitComplete = () => {
    if (!completeDialog) return;
    if (!completeForm.otaPlatform || !completeForm.otaOrderNo || !completeForm.paymentAmount || !completeForm.accountId) {
      toast.error("请填写完整：平台、订单号、支付金额、账号");
      return;
    }
    const amt = Number(completeForm.paymentAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error("支付金额无效");
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === completeDialog.id
          ? {
              ...o,
              status: "已完成" as OrderStatus,
              otaPlatform: completeForm.otaPlatform,
              otaOrderNo: completeForm.otaOrderNo,
              paymentAmount: amt,
              accountId: completeForm.accountId,
              remark: completeForm.remark,
            }
          : o,
      ),
    );
    toast.success("订单已完成");
    setCompleteDialog(null);
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px]">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "mine")} className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="all" className="text-[13px]">
              <ListTodo className="h-3.5 w-3.5 mr-1.5" />所有订单
              <Badge variant="secondary" className="ml-2 h-5 text-[11px]">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mine" className="text-[13px]">
              <Inbox className="h-3.5 w-3.5 mr-1.5" />我的订单
              <Badge variant="secondary" className="ml-2 h-5 text-[11px]">{mineList.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {tab === "all" && (
            <div className="flex items-center gap-2">
              <Select value={shopFilter} onValueChange={(v) => { setShopFilter(v); setAllPage(1); }}>
                <SelectTrigger className="w-40 h-8 text-[13px] bg-card border-border/60">
                  <SelectValue placeholder="全部店铺" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部店铺</SelectItem>
                  {mockShops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as OrderStatus | "全部"); setAllPage(1); }}>
                <SelectTrigger className="w-32 h-8 text-[13px] bg-card border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  <SelectItem value="待领取">待领取</SelectItem>
                  <SelectItem value="已领取">已领取</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已取消">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* ===== All orders ===== */}
        <TabsContent value="all" className="space-y-4 mt-0">
          {/* Status summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              label="所有订单"
              value={counts.all}
              icon={<ListTodo className="h-4 w-4" />}
              active={statusFilter === "全部"}
              onClick={() => { setStatusFilter("全部"); setAllPage(1); }}
              tone="default"
            />
            <StatCard
              label="待领取"
              value={counts["待领取"]}
              icon={<Clock className="h-4 w-4" />}
              active={statusFilter === "待领取"}
              onClick={() => { setStatusFilter("待领取"); setAllPage(1); }}
              tone="warning"
            />
            <StatCard
              label="待处理"
              value={counts["已领取"]}
              icon={<HandMetal className="h-4 w-4" />}
              active={statusFilter === "已领取"}
              onClick={() => { setStatusFilter("已领取"); setAllPage(1); }}
              tone="primary"
            />
            <StatCard
              label="已完成"
              value={counts["已完成"]}
              icon={<CheckCheck className="h-4 w-4" />}
              active={statusFilter === "已完成"}
              onClick={() => { setStatusFilter("已完成"); setAllPage(1); }}
              tone="success"
            />
            <StatCard
              label="已取消"
              value={counts["已取消"]}
              icon={<XCircle className="h-4 w-4" />}
              active={statusFilter === "已取消"}
              onClick={() => { setStatusFilter("已取消"); setAllPage(1); }}
              tone="muted"
            />
          </div>

          <Card className="border-border/60 bg-card">
            <CardContent className="pt-4">
              <div className="overflow-x-auto rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-border/40 hover:bg-muted/40">
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">订单号</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">酒店</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">房型</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">入住</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">退房</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">客人</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">金额</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">状态</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">OTA订单号</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPaged.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        className={`border-border/30 hover:bg-accent/40 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                      >
                        <TableCell className="text-[12px] py-2.5">{order.orderNo}</TableCell>
                        <TableCell className="text-[13px] font-medium max-w-[160px] truncate py-2.5">{order.hotelName}</TableCell>
                        <TableCell className="text-[13px] py-2.5">{order.roomType}</TableCell>
                        <TableCell className="text-[12px] py-2.5">{order.checkInDate}</TableCell>
                        <TableCell className="text-[12px] py-2.5">{order.checkOutDate}</TableCell>
                        <TableCell className="text-[13px] py-2.5">{order.guestName}</TableCell>
                        <TableCell className="text-[13px] font-semibold py-2.5">¥{order.amount}</TableCell>
                        <TableCell className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyles[order.status]}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground py-2.5">{order.otaOrderNo || "—"}</TableCell>
                        <TableCell className="text-right py-2.5">
                          {order.status === "待领取" && (
                            <Button size="sm" className="h-7 text-[12px]" onClick={() => handleClaim(order)}>
                              <HandMetal className="h-3 w-3 mr-1" />领取
                            </Button>
                          )}
                          {order.status === "已领取" && (
                            <span className="text-[11px] text-muted-foreground">
                              {order.claimedBy === CURRENT_USER ? "我已领取" : "他人处理中"}
                            </span>
                          )}
                          {order.status === "已完成" && <span className="text-[11px] text-muted-foreground">已完成</span>}
                          {order.status === "已取消" && <span className="text-[11px] text-muted-foreground">已取消</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                    {allPaged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground text-[13px] py-10">
                          暂无订单
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                total={allFiltered.length}
                page={allPage}
                pageSize={allPageSize}
                onPageChange={setAllPage}
                onPageSizeChange={(s) => { setAllPageSize(s); setAllPage(1); }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== My orders ===== */}
        <TabsContent value="mine" className="space-y-4 mt-0">
          <Card className="border-border/60 bg-card">
            <CardContent className="pt-4">
              <div className="overflow-x-auto rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-border/40 hover:bg-muted/40">
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">订单号</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">酒店</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">房型</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">入住</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">客人</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">金额</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">领取时间</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">处理倒计时</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">状态</TableHead>
                      <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minePaged.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        className={`border-border/30 hover:bg-accent/40 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                      >
                        <TableCell className="text-[12px] py-2.5">{order.orderNo}</TableCell>
                        <TableCell className="text-[13px] font-medium max-w-[160px] truncate py-2.5">{order.hotelName}</TableCell>
                        <TableCell className="text-[13px] py-2.5">{order.roomType}</TableCell>
                        <TableCell className="text-[12px] py-2.5">{order.checkInDate} ~ {order.checkOutDate}</TableCell>
                        <TableCell className="text-[13px] py-2.5">{order.guestName}</TableCell>
                        <TableCell className="text-[13px] font-semibold py-2.5">¥{order.amount}</TableCell>
                        <TableCell className="text-[12px] text-muted-foreground py-2.5">{formatDateTime(order.claimedAt)}</TableCell>
                        <TableCell className="py-2.5">
                          {order.status === "已领取" ? (
                            <CountdownBadge claimedAt={order.claimedAt} />
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyles[order.status]}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2.5">
                          {order.status === "已领取" ? (
                            <Button size="sm" className="h-7 text-[12px]" onClick={() => openComplete(order)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />完成
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">{order.status}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {minePaged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground text-[13px] py-10">
                          暂无领取的订单，去「所有订单」领取任务吧
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                total={mineList.length}
                page={minePage}
                pageSize={minePageSize}
                onPageChange={setMinePage}
                onPageSizeChange={(s) => { setMinePageSize(s); setMinePage(1); }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Claim confirm dialog */}
      <Dialog open={!!claimDialog} onOpenChange={(open) => !open && setClaimDialog(null)}>
        <DialogContent className="border-border/50">
          <DialogHeader>
            <DialogTitle className="text-base">领取任务</DialogTitle>
          </DialogHeader>
          {claimDialog && (
            <div className="space-y-3 text-[13px]">
              <div className="rounded-lg bg-muted/40 border border-border/40 p-3 space-y-1">
                <p><span className="text-muted-foreground">订单号：</span>{claimDialog.orderNo}</p>
                <p><span className="text-muted-foreground">酒店：</span>{claimDialog.hotelName}</p>
                <p><span className="text-muted-foreground">房型：</span>{claimDialog.roomType}</p>
                <p><span className="text-muted-foreground">入住：</span>{claimDialog.checkInDate} ~ {claimDialog.checkOutDate}</p>
                <p><span className="text-muted-foreground">金额：</span><span className="font-semibold">¥{claimDialog.amount}</span></p>
              </div>
              <p className="text-[12px] text-warning flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                领取后请在 1 小时内处理完成
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClaimDialog(null)}>取消</Button>
            <Button size="sm" onClick={confirmClaim}>确认领取</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete dialog */}
      <Dialog open={!!completeDialog} onOpenChange={(open) => !open && setCompleteDialog(null)}>
        <DialogContent className="border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">完成订单 — 录入处理信息</DialogTitle>
          </DialogHeader>
          {completeDialog && (
            <div className="space-y-3 text-[13px]">
              <div className="rounded-lg bg-muted/40 border border-border/40 p-3 text-[12px] space-y-0.5">
                <p><span className="text-muted-foreground">订单号：</span>{completeDialog.orderNo}</p>
                <p><span className="text-muted-foreground">酒店：</span>{completeDialog.hotelName} · {completeDialog.roomType}</p>
                <p><span className="text-muted-foreground">客人：</span>{completeDialog.guestName} · ¥{completeDialog.amount}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">下单 OTA 平台 *</Label>
                  <Select value={completeForm.otaPlatform} onValueChange={(v) => setCompleteForm((f) => ({ ...f, otaPlatform: v }))}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="选择平台" /></SelectTrigger>
                    <SelectContent>
                      {OTA_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">OTA 订单号 *</Label>
                  <Input
                    className="h-8 text-[13px]"
                    maxLength={64}
                    value={completeForm.otaOrderNo}
                    onChange={(e) => setCompleteForm((f) => ({ ...f, otaOrderNo: e.target.value }))}
                    placeholder="平台返回的订单号"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">支付金额 (¥) *</Label>
                  <Input
                    className="h-8 text-[13px]"
                    type="number"
                    min="0"
                    step="0.01"
                    value={completeForm.paymentAmount}
                    onChange={(e) => setCompleteForm((f) => ({ ...f, paymentAmount: e.target.value }))}
                    placeholder="实际支付金额"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">下单账号 *</Label>
                  <Select value={completeForm.accountId} onValueChange={(v) => setCompleteForm((f) => ({ ...f, accountId: v }))}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="选择账号" /></SelectTrigger>
                    <SelectContent>
                      {ACCOUNTS.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">备注</Label>
                <Textarea
                  className="text-[13px]"
                  maxLength={500}
                  value={completeForm.remark}
                  onChange={(e) => setCompleteForm((f) => ({ ...f, remark: e.target.value }))}
                  placeholder="其他处理说明"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCompleteDialog(null)}>取消</Button>
            <Button size="sm" onClick={submitComplete}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />确认完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label, value, icon, active, onClick, tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone: "default" | "warning" | "primary" | "success" | "muted";
}) {
  const toneClass = {
    default: "text-foreground",
    warning: "text-warning",
    primary: "text-primary",
    success: "text-success",
    muted: "text-muted-foreground",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-3 transition-all card-hover ${
        active ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20" : "border-border/60 bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={toneClass}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${toneClass}`}>{value}</p>
    </button>
  );
}
