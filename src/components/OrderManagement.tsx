import { useState } from "react";
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

const statusStyles: Record<OrderStatus, string> = {
  "待领取": "bg-warning/15 text-warning border-warning/30",
  "已领取": "bg-primary/15 text-primary border-primary/30",
  "已完成": "bg-success/15 text-success border-success/30",
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "全部">("全部");
  const [shopFilter, setShopFilter] = useState("all");
  const [claimDialog, setClaimDialog] = useState<Order | null>(null);
  const [claimForm, setClaimForm] = useState({
    otaPlatform: "", otaOrderNo: "", contactInfo: "", remark: "",
  });

  const filtered = orders
    .filter(o => statusFilter === "全部" || o.status === statusFilter)
    .filter(o => shopFilter === "all" || o.shopId === shopFilter);

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
    <div className="p-5 md:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">订单管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">跟踪与处理订房任务</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-card border-border/50">
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
            <SelectTrigger className="w-28 h-8 text-xs bg-card border-border/50">
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
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            订单列表
            <Badge variant="outline" className="text-[10px] h-5 border-border/50 font-mono">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">订单号</TableHead>
                  <TableHead className="text-xs">酒店</TableHead>
                  <TableHead className="text-xs">房型</TableHead>
                  <TableHead className="text-xs">入住</TableHead>
                  <TableHead className="text-xs">退房</TableHead>
                  <TableHead className="text-xs">客人</TableHead>
                  <TableHead className="text-xs">金额</TableHead>
                  <TableHead className="text-xs">状态</TableHead>
                  <TableHead className="text-xs">OTA订单号</TableHead>
                  <TableHead className="text-xs text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="border-border/20">
                    <TableCell className="font-mono text-[11px]">{order.orderNo}</TableCell>
                    <TableCell className="text-xs font-medium max-w-[140px] truncate">{order.hotelName}</TableCell>
                    <TableCell className="text-xs">{order.roomType}</TableCell>
                    <TableCell className="text-xs font-mono">{order.checkInDate}</TableCell>
                    <TableCell className="text-xs font-mono">{order.checkOutDate}</TableCell>
                    <TableCell className="text-xs">{order.guestName}</TableCell>
                    <TableCell className="text-xs font-mono font-semibold">¥{order.amount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] font-mono text-muted-foreground">{order.otaOrderNo || "—"}</TableCell>
                    <TableCell className="text-right">
                      {order.status === "待领取" && (
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleClaim(order)}>
                          <HandMetal className="h-3 w-3 mr-1" />领取
                        </Button>
                      )}
                      {order.status === "已领取" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleClaim(order)}>编辑</Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleComplete(order.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />完成
                          </Button>
                        </div>
                      )}
                      {order.status === "已完成" && (
                        <span className="text-[10px] text-muted-foreground">已完成</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!claimDialog} onOpenChange={(open) => !open && setClaimDialog(null)}>
        <DialogContent className="border-border/50">
          <DialogHeader>
            <DialogTitle className="text-base">{claimDialog?.status === "待领取" ? "领取任务" : "编辑订单信息"}</DialogTitle>
          </DialogHeader>
          {claimDialog && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-xs space-y-1">
                <p><span className="text-muted-foreground">酒店：</span>{claimDialog.hotelName}</p>
                <p><span className="text-muted-foreground">房型：</span>{claimDialog.roomType}</p>
                <p><span className="text-muted-foreground">入住：</span>{claimDialog.checkInDate} ~ {claimDialog.checkOutDate}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">OTA平台</Label>
                <Select value={claimForm.otaPlatform} onValueChange={v => setClaimForm(f => ({ ...f, otaPlatform: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>
                    {["携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">OTA订单号</Label>
                <Input className="h-8 text-xs" value={claimForm.otaOrderNo} onChange={e => setClaimForm(f => ({ ...f, otaOrderNo: e.target.value }))} placeholder="输入在其他平台下单的订单号" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">联系方式</Label>
                <Input className="h-8 text-xs" value={claimForm.contactInfo} onChange={e => setClaimForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="联系电话" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">备注</Label>
                <Textarea className="text-xs" value={claimForm.remark} onChange={e => setClaimForm(f => ({ ...f, remark: e.target.value }))} placeholder="其他备注信息" rows={3} />
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
