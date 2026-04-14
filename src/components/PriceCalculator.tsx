import { useState } from "react";
import { mockPriceRules, mockShops } from "@/lib/mock-data";
import type { PriceRule, HotelTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";

const allTags: (HotelTag | "全部")[] = [
  "全部", "精品", "连锁", "民宿", "度假", "商务", "亲子", "网红", "温泉",
];
const allBrands = [
  "全部", "如家", "汉庭", "全季", "亚朵", "希尔顿", "万豪", "独立品牌", "洲际", "凯悦", "锦江之星",
];

export function PriceCalculator() {
  const [rules, setRules] = useState<PriceRule[]>(mockPriceRules);
  const [shopFilter, setShopFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PriceRule | null>(null);
  const [form, setForm] = useState<Omit<PriceRule, "id">>({
    tag: "全部", brand: "全部", startDate: "", endDate: "", markupPercent: 10, shopId: undefined,
  });

  const filtered = shopFilter === "all" ? rules : rules.filter(r => r.shopId === shopFilter);

  const openCreate = () => {
    setEditing(null);
    setForm({ tag: "全部", brand: "全部", startDate: "", endDate: "", markupPercent: 10, shopId: shopFilter === "all" ? undefined : shopFilter });
    setDialogOpen(true);
  };

  const openEdit = (rule: PriceRule) => {
    setEditing(rule);
    setForm({ tag: rule.tag, brand: rule.brand, startDate: rule.startDate, endDate: rule.endDate, markupPercent: rule.markupPercent, shopId: rule.shopId });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.startDate || !form.endDate) { toast.error("请填写完整日期"); return; }
    if (editing) {
      setRules((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)));
      toast.success("规则已更新");
    } else {
      setRules((prev) => [...prev, { ...form, id: `pr${Date.now()}` }]);
      toast.success("规则已创建");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("规则已删除");
  };

  const getShopName = (shopId?: string) => {
    if (!shopId) return "—";
    return mockShops.find(s => s.id === shopId)?.name || shopId;
  };

  return (
    <div className="p-5 md:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">价格计算器</h1>
          <p className="text-sm text-muted-foreground mt-0.5">配置发布价格涨幅规则</p>
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
          <Button onClick={openCreate} size="sm" className="h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />新增规则
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            涨幅规则配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">店铺</TableHead>
                <TableHead className="text-xs">标签</TableHead>
                <TableHead className="text-xs">品牌</TableHead>
                <TableHead className="text-xs">开始日期</TableHead>
                <TableHead className="text-xs">结束日期</TableHead>
                <TableHead className="text-xs">涨幅</TableHead>
                <TableHead className="text-xs text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rule) => (
                <TableRow key={rule.id} className="border-border/20">
                  <TableCell className="text-xs">{getShopName(rule.shopId)}</TableCell>
                  <TableCell className="text-xs">{rule.tag}</TableCell>
                  <TableCell className="text-xs">{rule.brand}</TableCell>
                  <TableCell className="text-xs font-mono">{rule.startDate}</TableCell>
                  <TableCell className="text-xs font-mono">{rule.endDate}</TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-primary font-mono">+{rule.markupPercent}%</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(rule)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-10">
                    暂无规则，点击"新增规则"开始配置
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/50">
          <DialogHeader>
            <DialogTitle className="text-base">{editing ? "编辑规则" : "新增规则"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">店铺</Label>
              <Select value={form.shopId || "none"} onValueChange={v => setForm(f => ({ ...f, shopId: v === "none" ? undefined : v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="选择店铺" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不限店铺</SelectItem>
                  {mockShops.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">标签</Label>
                <Select value={form.tag} onValueChange={(v) => setForm((f) => ({ ...f, tag: v as HotelTag | "全部" }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">品牌</Label>
                <Select value={form.brand} onValueChange={(v) => setForm((f) => ({ ...f, brand: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{allBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">开始日期</Label>
                <Input type="date" className="h-8 text-xs" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">结束日期</Label>
                <Input type="date" className="h-8 text-xs" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">涨幅百分比 (%)</Label>
              <Input type="number" min={0} max={200} className="h-8 text-xs" value={form.markupPercent} onChange={(e) => setForm((f) => ({ ...f, markupPercent: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button size="sm" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
