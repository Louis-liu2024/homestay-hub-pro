import { useState, useMemo } from "react";
import { mockOrders, mockShops } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandMetal, CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";

const statusStyles: Record<OrderStatus, string> = {
  "待领取": "bg-warning/15 text-warning border-warning/30",
  "已领取": "bg-primary/15 text-primary border-primary/30",
  "已完成": "bg-success/15 text-success border-success/30",
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "全部">("全部");
  const [shopFilter, setShopFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [claimDialog, setClaimDialog] = useState<Order | null>(null);
  const [claimForm, setClaimForm] = useState({
    otaPlatform: "", otaOrderNo: "", contactInfo: "", remark: "",
  });

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => statusFilter === "全部" || o.status === statusFilter)
        .filter((o) => shopFilter === "all" || o.shopId === shopFilter),
    [orders, statusFilter, shopFilter]
  );

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const handleClaim = (order: Order) => {
    setClaimDialog(order);
    setClaimForm({
      otaPlatform: order.otaPlatform || "",
      otaOrderNo: order.otaOrderNo || "",
      contactInfo: order.contactInfo || "",
      remark: order.remark || "",
    });
  };

  const handleSaveClaim = () => {
    if (!claimDialog) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === claimDialog.id
          ? { ...o, status: "已领取" as OrderStatus, claimedBy: "current_user", ...claimForm }
          : o
      )
    );
    toast.success("任务已领取");
    setClaimDialog(null);
  };

  const handleComplete = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: "已完成" as OrderStatus } : o)
    );
    toast.success("订单已完成");
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px]">
      <div className="flex items-center justify-end gap-2">
        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="w-40 h-8 text-[13px] bg-card border-border/60">
            <SelectValue placeholder="全部店铺" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部店铺</SelectItem>
            {mockShops.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "全部")}>
          <SelectTrigger className="w-32 h-8 text-[13px] bg-card border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="待领取">待领取</SelectItem>
            <SelectItem value="已领取">已领取</SelectItem>
            <SelectItem value="已完成">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            订单列表
            <Badge variant="outline" className="text-[11px] h-5 border-border/50 font-mono">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                {paged.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    className={`border-border/30 hover:bg-accent/40 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                  >
                    <TableCell className="font-mono text-[12px] py-2.5">{order.orderNo}</TableCell>
                    <TableCell className="text-[13px] font-medium max-w-[160px] truncate py-2.5">{order.hotelName}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{order.roomType}</TableCell>
                    <TableCell className="text-[12px] font-mono py-2.5">{order.checkInDate}</TableCell>
                    <TableCell className="text-[12px] font-mono py-2.5">{order.checkOutDate}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{order.guestName}</TableCell>
                    <TableCell className="text-[13px] font-mono font-semibold py-2.5">¥{order.amount}</TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[12px] font-mono text-muted-foreground py-2.5">{order.otaOrderNo || "—"}</TableCell>
                    <TableCell className="text-right py-2.5">
                      {order.status === "待领取" && (
                        <Button size="sm" className="h-7 text-[12px]" onClick={() => handleClaim(order)}>
                          <HandMetal className="h-3 w-3 mr-1" />领取
                        </Button>
                      )}
                      {order.status === "已领取" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={() => handleClaim(order)}>编辑</Button>
                          <Button size="sm" className="h-7 text-[12px]" onClick={() => handleComplete(order.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />完成
                          </Button>
                        </div>
                      )}
                      {order.status === "已完成" && (
                        <span className="text-[11px] text-muted-foreground">已完成</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
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
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <Dialog open={!!claimDialog} onOpenChange={(open) => !open && setClaimDialog(null)}>
        <DialogContent className="border-border/50">
          <DialogHeader>
            <DialogTitle className="text-base">{claimDialog?.status === "待领取" ? "领取任务" : "编辑订单信息"}</DialogTitle>
          </DialogHeader>
          {claimDialog && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/40 border border-border/40 p-3 text-[13px] space-y-1">
                <p><span className="text-muted-foreground">酒店：</span>{claimDialog.hotelName}</p>
                <p><span className="text-muted-foreground">房型：</span>{claimDialog.roomType}</p>
                <p><span className="text-muted-foreground">入住：</span>{claimDialog.checkInDate} ~ {claimDialog.checkOutDate}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">OTA平台</Label>
                <Select value={claimForm.otaPlatform} onValueChange={v => setClaimForm(f => ({ ...f, otaPlatform: v }))}>
                  <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>
                    {["携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">OTA订单号</Label>
                <Input className="h-8 text-[13px]" value={claimForm.otaOrderNo} onChange={e => setClaimForm(f => ({ ...f, otaOrderNo: e.target.value }))} placeholder="输入在其他平台下单的订单号" />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">联系方式</Label>
                <Input className="h-8 text-[13px]" value={claimForm.contactInfo} onChange={e => setClaimForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="联系电话" />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">备注</Label>
                <Textarea className="text-[13px]" value={claimForm.remark} onChange={e => setClaimForm(f => ({ ...f, remark: e.target.value }))} placeholder="其他备注信息" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClaimDialog(null)}>取消</Button>
            <Button size="sm" onClick={handleSaveClaim}>{claimDialog?.status === "待领取" ? "确认领取" : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
