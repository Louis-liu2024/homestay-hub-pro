import { useState } from "react";
import { mockOrders } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandMetal, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  待领取: "outline",
  已领取: "secondary",
  已完成: "default",
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "全部">("全部");
  const [claimDialog, setClaimDialog] = useState<Order | null>(null);
  const [claimForm, setClaimForm] = useState({
    otaPlatform: "",
    otaOrderNo: "",
    contactInfo: "",
    remark: "",
  });

  const filtered =
    statusFilter === "全部"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

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
          ? {
              ...o,
              status: "已领取" as OrderStatus,
              claimedBy: "current_user",
              ...claimForm,
            }
          : o
      )
    );
    toast.success("任务已领取");
    setClaimDialog(null);
  };

  const handleComplete = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "已完成" as OrderStatus } : o
      )
    );
    toast.success("订单已完成");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">订单管理</h1>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as OrderStatus | "全部")}
        >
          <SelectTrigger className="w-32">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            订单列表
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filtered.length} 条)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>酒店</TableHead>
                  <TableHead>房型</TableHead>
                  <TableHead>入住日期</TableHead>
                  <TableHead>退房日期</TableHead>
                  <TableHead>客人</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>OTA订单号</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.orderNo}
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {order.hotelName}
                    </TableCell>
                    <TableCell>{order.roomType}</TableCell>
                    <TableCell>{order.checkInDate}</TableCell>
                    <TableCell>{order.checkOutDate}</TableCell>
                    <TableCell>{order.guestName}</TableCell>
                    <TableCell className="font-semibold">
                      ¥{order.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.otaOrderNo || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "待领取" && (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(order)}
                        >
                          <HandMetal className="h-3.5 w-3.5 mr-1" />
                          领取
                        </Button>
                      )}
                      {order.status === "已领取" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaim(order)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleComplete(order.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            完成
                          </Button>
                        </div>
                      )}
                      {order.status === "已完成" && (
                        <span className="text-xs text-muted-foreground">
                          已完成
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Claim dialog */}
      <Dialog
        open={!!claimDialog}
        onOpenChange={(open) => !open && setClaimDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {claimDialog?.status === "待领取" ? "领取任务" : "编辑订单信息"}
            </DialogTitle>
          </DialogHeader>
          {claimDialog && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">酒店：</span>
                  {claimDialog.hotelName}
                </p>
                <p>
                  <span className="text-muted-foreground">房型：</span>
                  {claimDialog.roomType}
                </p>
                <p>
                  <span className="text-muted-foreground">入住：</span>
                  {claimDialog.checkInDate} ~ {claimDialog.checkOutDate}
                </p>
              </div>
              <div className="space-y-2">
                <Label>OTA平台</Label>
                <Select
                  value={claimForm.otaPlatform}
                  onValueChange={(v) =>
                    setClaimForm((f) => ({ ...f, otaPlatform: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {["携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda"].map(
                      (p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>OTA订单号</Label>
                <Input
                  value={claimForm.otaOrderNo}
                  onChange={(e) =>
                    setClaimForm((f) => ({ ...f, otaOrderNo: e.target.value }))
                  }
                  placeholder="输入在其他平台下单的订单号"
                />
              </div>
              <div className="space-y-2">
                <Label>联系方式</Label>
                <Input
                  value={claimForm.contactInfo}
                  onChange={(e) =>
                    setClaimForm((f) => ({
                      ...f,
                      contactInfo: e.target.value,
                    }))
                  }
                  placeholder="联系电话"
                />
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={claimForm.remark}
                  onChange={(e) =>
                    setClaimForm((f) => ({ ...f, remark: e.target.value }))
                  }
                  placeholder="其他备注信息"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialog(null)}>
              取消
            </Button>
            <Button onClick={handleSaveClaim}>
              {claimDialog?.status === "待领取" ? "确认领取" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
