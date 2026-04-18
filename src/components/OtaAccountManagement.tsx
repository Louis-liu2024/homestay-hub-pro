import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { mockOtaAccounts, mockOperators, mockOrders } from "@/lib/mock-data";
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Settings2, ExternalLink, Trash2,
  Eye, EyeOff, ShieldCheck, KeyRound, UserPlus, X,
  Copy, Mail, Check,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORMS: Channel[] = ['携程', '美团', 'Booking', '飞猪', '去哪儿', 'Agoda', '途家', '小红书'];
const LEVELS: OtaAccount['memberLevel'][] = ['普通会员', '银卡', '金卡', '钻石', '黑卡'];
const ADMIN_PHONE = '138****8888'; // 超管手机号（演示）

const PLATFORM_LOGIN_URLS: Record<Channel, string> = {
  '携程': 'https://ebooking.ctrip.com/',
  '美团': 'https://epassport.meituan.com/account/unitivelogin',
  'Booking': 'https://admin.booking.com/',
  '飞猪': 'https://hotel.fliggy.com/',
  '去哪儿': 'https://bb.qunar.com/',
  'Agoda': 'https://ycs.agoda.com/',
  '途家': 'https://landlord.tujia.com/',
  '小红书': 'https://ad.xiaohongshu.com/',
};

const levelStyles: Record<OtaAccount['memberLevel'], string> = {
  '普通会员': 'bg-muted text-muted-foreground border-border',
  '银卡': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  '金卡': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
  '钻石': 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
  '黑卡': 'bg-zinc-900 text-zinc-100 border-zinc-700',
};

type DialogMode = 'create' | 'edit' | 'limits' | 'batchAssign' | null;

const emptyAccount = (): Omit<OtaAccount, 'id' | 'totalOrders' | 'dailyAvgOrders' | 'createdAt'> => ({
  name: '',
  platform: '携程',
  memberLevel: '普通会员',
  phone: '',
  loginAccount: '',
  password: '',
  dailyLimit: 20,
  weeklyLimit: 120,
  monthlyLimit: 480,
  operatorIds: [],
});

function maskPassword(pwd?: string) {
  if (!pwd) return '——';
  return '•'.repeat(Math.min(pwd.length, 12));
}

export function OtaAccountManagement() {
  const [accounts, setAccounts] = useState<OtaAccount[]>(mockOtaAccounts);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [mode, setMode] = useState<DialogMode>(null);
  const [editing, setEditing] = useState<OtaAccount | null>(null);
  const [draft, setDraft] = useState(emptyAccount());
  const [showPwdInForm, setShowPwdInForm] = useState(false);

  // Selection for batch assign
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchOperatorIds, setBatchOperatorIds] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'replace' | 'append'>('append');

  // Detail drawer
  const [detail, setDetail] = useState<OtaAccount | null>(null);

  // OTP verification (for viewing password in edit dialog)
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const matchSearch = !search || a.name.includes(search) || a.phone.includes(search) || (a.loginAccount ?? '').includes(search);
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

  const allChecked = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));
  const someChecked = selectedIds.length > 0 && !allChecked;

  const toggleAll = () => {
    setSelectedIds(allChecked ? [] : filtered.map((a) => a.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyAccount());
    setShowPwdInForm(false);
    setMode('create');
  };

  const openEdit = (a: OtaAccount, m: Exclude<DialogMode, null | 'batchAssign'>) => {
    setEditing(a);
    setDraft({
      name: a.name, platform: a.platform, memberLevel: a.memberLevel, phone: a.phone,
      loginAccount: a.loginAccount ?? '', password: a.password ?? '',
      dailyLimit: a.dailyLimit, weeklyLimit: a.weeklyLimit, monthlyLimit: a.monthlyLimit,
      operatorIds: [...a.operatorIds],
    });
    setShowPwdInForm(false);
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
      // sync detail if open
      if (detail?.id === editing.id) {
        setDetail({ ...editing, ...draft });
      }
    }
    setMode(null);
  };

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success("账号已删除");
  };

  // OTP flow
  const requestOtp = () => {
    setOtpOpen(true);
    setOtpSent(false);
    setOtpCode("");
  };
  const sendOtp = () => {
    setOtpSent(true);
    toast.success(`验证码已发送至超管手机号 ${ADMIN_PHONE}`);
  };
  const verifyOtp = () => {
    if (otpCode.trim().length < 4) {
      toast.error("请输入完整验证码");
      return;
    }
    // Demo: accept any 4+ digit code
    setShowPwdInForm(true);
    setOtpOpen(false);
    toast.success("验证通过，已显示密码");
  };

  // Batch assign
  const openBatchAssign = () => {
    if (selectedIds.length === 0) {
      toast.error("请先勾选账号");
      return;
    }
    setBatchOperatorIds([]);
    setBatchMode('append');
    setMode('batchAssign');
  };

  const applyBatchAssign = () => {
    if (batchOperatorIds.length === 0) {
      toast.error("请选择操作人员");
      return;
    }
    setAccounts((prev) => prev.map((a) => {
      if (!selectedIds.includes(a.id)) return a;
      const next = batchMode === 'replace'
        ? [...batchOperatorIds]
        : Array.from(new Set([...a.operatorIds, ...batchOperatorIds]));
      return { ...a, operatorIds: next };
    }));
    toast.success(`已为 ${selectedIds.length} 个账号${batchMode === 'replace' ? '替换' : '追加'}操作人员`);
    setMode(null);
    setSelectedIds([]);
  };

  const operatorById = (id: string) => mockOperators.find((o) => o.id === id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OTA账号</h1>
          <p className="text-sm text-muted-foreground mt-1">管理各 OTA 平台账号、密码、下单上限及操作人员分配</p>
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
              placeholder="搜索账号名 / 登录账号 / 手机号"
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
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-md bg-accent/60 border">
                <span className="text-sm">已选 <b>{selectedIds.length}</b> 项</span>
                <Button size="sm" variant="default" onClick={openBatchAssign}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> 批量分配操作人员
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="ml-auto text-sm text-muted-foreground">共 {filtered.length} 个账号</div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>账号名</TableHead>
                <TableHead>平台</TableHead>
                <TableHead>会员等级</TableHead>
                <TableHead>登录账号</TableHead>
                <TableHead className="text-right">总下单量</TableHead>
                <TableHead className="text-right">日均下单</TableHead>
                <TableHead>下单上限 (日/周/月)</TableHead>
                <TableHead>绑定手机</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right w-[140px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(a.id)}
                      onCheckedChange={() => toggleOne(a.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      className="font-medium text-left hover:text-primary hover:underline underline-offset-2"
                      onClick={() => setDetail(a)}
                    >
                      {a.name}
                    </button>
                  </TableCell>
                  <TableCell><Badge variant="outline">{a.platform}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={levelStyles[a.memberLevel]}>{a.memberLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.loginAccount || '——'}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.totalOrders.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.dailyAvgOrders}</TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {a.dailyLimit} / {a.weeklyLimit} / {a.monthlyLimit}
                  </TableCell>
                  <TableCell className="text-xs">{a.phone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-0.5 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a, 'limits')} title="配置上限">
                        <Settings2 className="h-3.5 w-3.5" />
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
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-10">暂无账号</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit / Limits Dialog */}
      <Dialog open={mode === 'create' || mode === 'edit' || mode === 'limits'} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' && '新建OTA账号'}
              {mode === 'edit' && '编辑账号信息'}
              {mode === 'limits' && '配置下单上限'}
            </DialogTitle>
            {mode === 'limits' && <DialogDescription>设置该账号的日/周/月最大下单数量</DialogDescription>}
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
                <div className="space-y-1.5">
                  <Label>登录账号</Label>
                  <Input value={draft.loginAccount} onChange={(e) => setDraft({ ...draft, loginAccount: e.target.value })} placeholder="平台登录用户名" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> 密码
                  </Label>
                  <div className="relative">
                    <Input
                      type={mode === 'create' || showPwdInForm ? 'text' : 'password'}
                      value={draft.password}
                      onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                      placeholder="请输入密码"
                      className="pr-9"
                    />
                    {mode === 'edit' && (
                      <button
                        type="button"
                        onClick={() => showPwdInForm ? setShowPwdInForm(false) : requestOtp()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title={showPwdInForm ? '隐藏' : '查看（需验证码）'}
                      >
                        {showPwdInForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {mode === 'edit' && !showPwdInForm && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> 查看密码需通过超管手机号验证码验证
                    </p>
                  )}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Assign Dialog */}
      <Dialog open={mode === 'batchAssign'} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量分配操作人员</DialogTitle>
            <DialogDescription>
              将操作人员分配到已选的 <b>{selectedIds.length}</b> 个账号
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>分配方式</Label>
              <Select value={batchMode} onValueChange={(v) => setBatchMode(v as 'replace' | 'append')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">追加（保留原有人员）</SelectItem>
                  <SelectItem value="replace">替换（覆盖原有人员）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-auto border rounded-md p-2">
              {mockOperators.map((op) => {
                const checked = batchOperatorIds.includes(op.id);
                return (
                  <label key={op.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        setBatchOperatorIds(c
                          ? [...batchOperatorIds, op.id]
                          : batchOperatorIds.filter((id) => id !== op.id));
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>取消</Button>
            <Button onClick={applyBatchAssign}>确认分配</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 安全验证
            </DialogTitle>
            <DialogDescription>
              查看密码需要通过超管手机号 <b>{ADMIN_PHONE}</b> 接收的短信验证码验证
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>验证码</Label>
              <div className="flex gap-2">
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入 6 位验证码"
                  inputMode="numeric"
                />
                <Button variant="outline" onClick={sendOtp} disabled={otpSent} className="shrink-0">
                  {otpSent ? '已发送' : '发送验证码'}
                </Button>
              </div>
              {otpSent && <p className="text-[11px] text-muted-foreground">演示环境：输入任意 4-6 位数字即可通过</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtpOpen(false)}>取消</Button>
            <Button onClick={verifyOtp} disabled={!otpSent}>验证</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <AccountDetailSheet
        account={detail}
        onClose={() => setDetail(null)}
        onChange={(updated) => {
          setAccounts((prev) => prev.map((a) => a.id === updated.id ? updated : a));
          setDetail(updated);
        }}
        operatorLookup={operatorById}
        orders={mockOrders}
      />
    </div>
  );
}

// ===================== Detail Sheet =====================

interface DetailProps {
  account: OtaAccount | null;
  onClose: () => void;
  onChange: (a: OtaAccount) => void;
  operatorLookup: (id: string) => ReturnType<typeof mockOperators.find>;
  orders: typeof mockOrders;
}

function AccountDetailSheet({ account, onClose, onChange, operatorLookup, orders }: DetailProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [pendingOps, setPendingOps] = useState<string[]>([]);
  const [shareTargets, setShareTargets] = useState<string[] | null>(null);

  if (!account) return null;

  const assignedOps = account.operatorIds.map(operatorLookup).filter(Boolean) as Array<NonNullable<ReturnType<typeof operatorLookup>>>;
  const availableOps = mockOperators.filter((o) => !account.operatorIds.includes(o.id));
  const accountOrders = orders.filter((o) => o.accountId === account.id);

  const removeOperator = (id: string) => {
    onChange({ ...account, operatorIds: account.operatorIds.filter((x) => x !== id) });
    toast.success("已移除操作人员");
  };

  const confirmAddOperators = () => {
    if (pendingOps.length === 0) {
      setAddOpen(false);
      return;
    }
    const added = [...pendingOps];
    onChange({ ...account, operatorIds: [...account.operatorIds, ...pendingOps] });
    setPendingOps([]);
    setAddOpen(false);
    toast.success("已新增操作人员");
    // 弹出凭据分享对话框
    setShareTargets(added);
  };

  return (
    <Sheet open={!!account} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {account.name}
            <Badge variant="outline">{account.platform}</Badge>
            <Badge variant="outline" className={levelStyles[account.memberLevel]}>{account.memberLevel}</Badge>
          </SheetTitle>
          <SheetDescription>账号详情 · 操作人员 · 下单记录</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="operators">操作人员 ({assignedOps.length})</TabsTrigger>
            <TabsTrigger value="orders">下单记录 ({accountOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Field label="账号ID" value={account.id} />
              <Field label="账号名" value={account.name} />
              <Field label="所属平台" value={account.platform} />
              <Field label="会员等级" value={account.memberLevel} />
              <Field label="登录账号" value={account.loginAccount || '——'} />
              <PasswordField password={account.password} />
              <Field label="绑定手机号" value={account.phone} />
              <Field label="创建时间" value={account.createdAt} />
              <Field label="累计下单" value={account.totalOrders.toLocaleString()} />
              <Field label="日均下单" value={String(account.dailyAvgOrders)} />
              <Field label="每日上限" value={String(account.dailyLimit)} />
              <Field label="每周上限" value={String(account.weeklyLimit)} />
              <Field label="每月上限" value={String(account.monthlyLimit)} />
            </div>
          </TabsContent>

          <TabsContent value="operators" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">该账号当前可被以下人员使用</div>
              <Button size="sm" onClick={() => { setPendingOps([]); setAddOpen(true); }} disabled={availableOps.length === 0}>
                <UserPlus className="h-3.5 w-3.5 mr-1" /> 新增操作人员
              </Button>
            </div>
            {assignedOps.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 border rounded-md">尚未分配操作人员</div>
            ) : (
              <div className="space-y-2">
                {assignedOps.map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <div className="text-sm font-medium">{op.name}</div>
                      <div className="text-xs text-muted-foreground">已处理 {op.ordersHandled} 单 · 平均 {op.avgProcessingMinutes} 分钟/单</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeOperator(op.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {addOpen && (
              <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                <div className="text-sm font-medium">选择要新增的操作人员</div>
                {availableOps.map((op) => {
                  const checked = pendingOps.includes(op.id);
                  return (
                    <label key={op.id} className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => setPendingOps(c ? [...pendingOps, op.id] : pendingOps.filter((x) => x !== op.id))}
                      />
                      <div className="flex-1 text-sm">{op.name}</div>
                      <span className="text-xs text-muted-foreground">{op.ordersHandled} 单</span>
                    </label>
                  );
                })}
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                  <Button size="sm" onClick={confirmAddOperators}>确认新增</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">使用该账号下单的最新记录</div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders" search={{ accountId: account.id } as any}>
                  在订单管理中查看 <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            {accountOrders.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 border rounded-md">该账号暂无下单记录</div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>酒店</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountOrders.slice(0, 10).map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs">{o.orderNo}</TableCell>
                        <TableCell className="text-xs">{o.hotelName}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{o.status}</Badge></TableCell>
                        <TableCell className="text-right text-xs tabular-nums">¥{o.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>

      <ShareCredentialsDialog
        account={account}
        operatorIds={shareTargets}
        onClose={() => setShareTargets(null)}
      />
    </Sheet>
  );
}

interface ShareDialogProps {
  account: OtaAccount;
  operatorIds: string[] | null;
  onClose: () => void;
}

function ShareCredentialsDialog({ account, operatorIds, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const operators = (operatorIds ?? []).map((id) => mockOperators.find((o) => o.id === id)).filter(Boolean) as NonNullable<ReturnType<typeof mockOperators.find>>[];
  const portalUrl = PLATFORM_LOGIN_URLS[account.platform];

  const credentialsText =
    `【${account.platform} 后台账号】\n` +
    `账号名称：${account.name}\n` +
    `登录地址：${portalUrl}\n` +
    `登录账号：${account.loginAccount || '——'}\n` +
    `登录密码：${account.password || '——'}\n` +
    `绑定手机：${account.phone}\n` +
    `\n请妥善保管，勿外传。`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleSendEmail = () => {
    const emails = operators.map((o) => o.email).filter(Boolean) as string[];
    if (emails.length === 0) {
      toast.error("操作人员未配置邮箱");
      return;
    }
    // 演示：模拟发送
    setSent(true);
    toast.success(`凭据已通过邮件发送至 ${emails.length} 位操作人员`);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setCopied(false);
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={operatorIds !== null} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> 分享 OTA 后台凭据
          </DialogTitle>
          <DialogDescription>
            将该 OTA 账号的后台链接和登录凭据发送给新分配的操作人员
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border bg-muted/40 p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground w-16 shrink-0">分享对象</span>
              <span className="flex flex-wrap gap-1">
                {operators.map((o) => (
                  <Badge key={o.id} variant="secondary" className="text-[11px]">
                    {o.name}{o.email ? ` · ${o.email}` : ''}
                  </Badge>
                ))}
              </span>
            </div>
          </div>

          <div className="rounded-md border bg-background">
            <pre className="text-xs p-3 whitespace-pre-wrap break-all font-mono leading-relaxed text-foreground/90">
              {credentialsText}
            </pre>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> 凭据为敏感信息，邮件发送将自动加密并记录审计日志
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose}>稍后再说</Button>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? '已复制' : '一键复制'}
          </Button>
          <Button onClick={handleSendEmail} disabled={sent}>
            <Mail className="h-3.5 w-3.5 mr-1" />
            {sent ? '已发送' : '邮件发送'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</div>
    </div>
  );
}

function PasswordField({ password }: { password?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const openOtp = () => {
    setOtpOpen(true);
    setOtpSent(false);
    setOtpCode("");
  };

  const sendOtp = () => {
    setOtpSent(true);
    toast.success(`验证码已发送至超管手机号 ${ADMIN_PHONE}`);
  };

  const verifyOtp = () => {
    if (otpCode.trim().length < 4) {
      toast.error("请输入完整验证码");
      return;
    }
    setRevealed(true);
    setOtpOpen(false);
    toast.success("验证通过，已显示密码");
  };

  return (
    <>
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground">登录密码</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono tracking-wider">
            {revealed ? (password || '——') : maskPassword(password)}
          </span>
          {password && (
            <button
              type="button"
              onClick={() => revealed ? setRevealed(false) : openOtp()}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={revealed ? '隐藏密码' : '查看密码（需验证码）'}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        {!revealed && password && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3" /> 查看密码需通过超管手机号验证码
          </p>
        )}
      </div>

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 安全验证
            </DialogTitle>
            <DialogDescription>
              查看密码需要通过超管手机号 <b>{ADMIN_PHONE}</b> 接收的短信验证码验证
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>验证码</Label>
              <div className="flex gap-2">
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入 6 位验证码"
                  inputMode="numeric"
                />
                <Button variant="outline" onClick={sendOtp} disabled={otpSent} className="shrink-0">
                  {otpSent ? '已发送' : '发送验证码'}
                </Button>
              </div>
              {otpSent && <p className="text-[11px] text-muted-foreground">演示环境：输入任意 4-6 位数字即可通过</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtpOpen(false)}>取消</Button>
            <Button onClick={verifyOtp} disabled={!otpSent}>验证</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
