import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { mockOtaAccounts, mockOperators } from "@/lib/mock-data";
import type { OtaAccount, Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Settings2, Users, ExternalLink, UserCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS: Channel[] = ['携程', '美团', 'Booking', '飞猪', '去哪儿', 'Agoda', '途家', '小红书'];
const LEVELS: OtaAccount['memberLevel'][] = ['普通会员', '银卡', '金卡', '钻石', '黑卡'];

const levelStyles: Record<OtaAccount['memberLevel'], string> = {
  '普通会员': 'bg-muted text-muted-foreground border-border',
  '银卡': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  '金卡': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
  '钻石': 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
  '黑卡': 'bg-zinc-900 text-zinc-100 border-zinc-700',
};

type DialogMode = 'create' | 'edit' | 'limits' | 'operators' | null;

const emptyAccount = (): Omit<OtaAccount, 'id' | 'totalOrders' | 'dailyAvgOrders' | 'createdAt'> => ({
  name: '',
  platform: '携程',
  memberLevel: '普通会员',
  phone: '',
  dailyLimit: 20,
  weeklyLimit: 120,
  monthlyLimit: 480,
  operatorIds: [],
});

export function OtaAccountManagement() {
  const [accounts, setAccounts] = useState<OtaAccount[]>(mockOtaAccounts);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [mode, setMode] = useState<DialogMode>(null);
  const [editing, setEditing] = useState<OtaAccount | null>(null);
  const [draft, setDraft] = useState(emptyAccount());

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const matchSearch = !search || a.name.includes(search) || a.phone.includes(search);
      const matchPlatform = platformFilter === "all" || a.platform === platformFilter;
      return matchSearch && matchPlatform;
    });
  }, [accounts, search, platformFilter]);

  const stats = useMemo(() => ({
    total: accounts.length,
    totalOrders: accounts.reduce((s, a) => s + a.totalOrders, 0),
    avgDaily: accounts.length ? (accounts.reduce((s, a) => s + a.dailyAvgOrders, 0) / accounts.length).toFixed(1) : '0',
    platforms: new Set(accounts.map((a) => a.platform)).size,
  }), [accounts]);

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyAccount());
    setMode('create');
  };

  const openEdit = (a: OtaAccount, m: Exclude<DialogMode, null>) => {
    setEditing(a);
    setDraft({
      name: a.name, platform: a.platform, memberLevel: a.memberLevel, phone: a.phone,
      dailyLimit: a.dailyLimit, weeklyLimit: a.weeklyLimit, monthlyLimit: a.monthlyLimit,
      operatorIds: [...a.operatorIds],
    });
    setMode(m);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.phone.trim()) {
      toast.error("请填写账号名和绑定手机号");
      return;
    }
    if (mode === 'create') {
      const newAcc: OtaAccount = {
        ...draft,
        id: `acc_${Date.now()}`,
        totalOrders: 0,
        dailyAvgOrders: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAccounts((prev) => [newAcc, ...prev]);
      toast.success("账号已创建");
    } else if (editing) {
      setAccounts((prev) => prev.map((a) => a.id === editing.id ? { ...a, ...draft } : a));
      toast.success("已保存");
    }
    setMode(null);
  };

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.success("账号已删除");
  };

  const operatorNames = (ids: string[]) =>
    ids.map((id) => mockOperators.find((o) => o.id === id)?.name).filter(Boolean).join('、') || '未分配';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OTA账号</h1>
          <p className="text-sm text-muted-foreground mt-1">管理各 OTA 平台账号、下单上限及操作人员分配</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> 新建账号
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">账号总数</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">覆盖平台</div>
          <div className="text-2xl font-bold mt-1">{stats.platforms}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">累计下单</div>
          <div className="text-2xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">平均日单量</div>
          <div className="text-2xl font-bold mt-1">{stats.avgDaily}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="搜索账号名或手机号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部平台</SelectItem>
                {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto text-sm text-muted-foreground">共 {filtered.length} 个账号</div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>账号名</TableHead>
                <TableHead>平台</TableHead>
                <TableHead>会员等级</TableHead>
                <TableHead className="text-right">总下单量</TableHead>
                <TableHead className="text-right">日均下单</TableHead>
                <TableHead>下单上限 (日/周/月)</TableHead>
                <TableHead>操作人员</TableHead>
                <TableHead>绑定手机</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell><Badge variant="outline">{a.platform}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={levelStyles[a.memberLevel]}>{a.memberLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.totalOrders.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.dailyAvgOrders}</TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {a.dailyLimit} / {a.weeklyLimit} / {a.monthlyLimit}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate" title={operatorNames(a.operatorIds)}>
                    {operatorNames(a.operatorIds)}
                  </TableCell>
                  <TableCell className="text-xs">{a.phone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a, 'limits')} title="配置上限">
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a, 'operators')} title="分配操作人员">
                        <Users className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a, 'edit')} title="编辑">
                        <UserCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild title="查看下单记录">
                        <Link to="/orders" search={{ accountId: a.id } as any}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} title="删除">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-10">暂无账号</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' && '新建OTA账号'}
              {mode === 'edit' && '编辑账号信息'}
              {mode === 'limits' && '配置下单上限'}
              {mode === 'operators' && '分配操作人员'}
            </DialogTitle>
            {mode === 'limits' && <DialogDescription>设置该账号的日/周/月最大下单数量</DialogDescription>}
            {mode === 'operators' && <DialogDescription>勾选可以使用该账号下单的操作人员</DialogDescription>}
          </DialogHeader>

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>账号名</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="如：携程主账号" />
                </div>
                <div className="space-y-1.5">
                  <Label>平台</Label>
                  <Select value={draft.platform} onValueChange={(v) => setDraft({ ...draft, platform: v as Channel })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>会员等级</Label>
                  <Select value={draft.memberLevel} onValueChange={(v) => setDraft({ ...draft, memberLevel: v as OtaAccount['memberLevel'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>绑定手机号</Label>
                  <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="13800000000" />
                </div>
              </div>
            </div>
          )}

          {mode === 'limits' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>每日下单上限</Label>
                <Input type="number" min={0} value={draft.dailyLimit}
                  onChange={(e) => setDraft({ ...draft, dailyLimit: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>每周下单上限</Label>
                <Input type="number" min={0} value={draft.weeklyLimit}
                  onChange={(e) => setDraft({ ...draft, weeklyLimit: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>每月下单上限</Label>
                <Input type="number" min={0} value={draft.monthlyLimit}
                  onChange={(e) => setDraft({ ...draft, monthlyLimit: Number(e.target.value) })} />
              </div>
            </div>
          )}

          {mode === 'operators' && (
            <div className="space-y-2 max-h-[320px] overflow-auto">
              {mockOperators.map((op) => {
                const checked = draft.operatorIds.includes(op.id);
                return (
                  <label key={op.id} className="flex items-center gap-3 p-2.5 rounded border hover:bg-accent cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        setDraft({
                          ...draft,
                          operatorIds: c
                            ? [...draft.operatorIds, op.id]
                            : draft.operatorIds.filter((id) => id !== op.id),
                        });
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{op.name}</div>
                      <div className="text-xs text-muted-foreground">已处理 {op.ordersHandled} 单 · 平均 {op.avgProcessingMinutes} 分钟/单</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
