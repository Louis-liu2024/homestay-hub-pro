import { useState } from "react";
import { mockPriceRules } from "@/lib/mock-data";
import type { PriceRule, HotelTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const allTags: (HotelTag | "全部")[] = [
  "全部", "精品", "连锁", "民宿", "度假", "商务", "亲子", "网红", "温泉",
];
const allBrands = [
  "全部", "如家", "汉庭", "全季", "亚朵", "希尔顿", "万豪", "独立品牌", "洲际", "凯悦", "锦江之星",
];

export function PriceCalculator() {
  const [rules, setRules] = useState<PriceRule[]>(mockPriceRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PriceRule | null>(null);
  const [form, setForm] = useState<Omit<PriceRule, "id">>({
    tag: "全部",
    brand: "全部",
    startDate: "",
    endDate: "",
    markupPercent: 10,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ tag: "全部", brand: "全部", startDate: "", endDate: "", markupPercent: 10 });
    setDialogOpen(true);
  };

  const openEdit = (rule: PriceRule) => {
    setEditing(rule);
    setForm({ tag: rule.tag, brand: rule.brand, startDate: rule.startDate, endDate: rule.endDate, markupPercent: rule.markupPercent });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.startDate || !form.endDate) {
      toast.error("请填写完整日期");
      return;
    }
    if (editing) {
      setRules((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r))
      );
      toast.success("规则已更新");
    } else {
      setRules((prev) => [
        ...prev,
        { ...form, id: `pr${Date.now()}` },
      ]);
      toast.success("规则已创建");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("规则已删除");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">价格计算器</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          新增规则
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">涨幅规则配置</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标签</TableHead>
                <TableHead>品牌</TableHead>
                <TableHead>开始日期</TableHead>
                <TableHead>结束日期</TableHead>
                <TableHead>涨幅比例</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.tag}</TableCell>
                  <TableCell>{rule.brand}</TableCell>
                  <TableCell>{rule.startDate}</TableCell>
                  <TableCell>{rule.endDate}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    +{rule.markupPercent}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    暂无规则，点击"新增规则"开始配置
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑规则" : "新增规则"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标签</Label>
              <Select
                value={form.tag}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, tag: v as HotelTag | "全部" }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allTags.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>品牌</Label>
              <Select
                value={form.brand}
                onValueChange={(v) => setForm((f) => ({ ...f, brand: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allBrands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>涨幅百分比 (%)</Label>
              <Input
                type="number"
                min={0}
                max={200}
                value={form.markupPercent}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    markupPercent: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
