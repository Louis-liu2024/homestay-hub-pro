import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Store,
  Plug,
  ClipboardCheck,
  RefreshCw,
  CalendarIcon,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { Channel, Shop } from "@/lib/types";

type Platform = Extract<Channel, "飞猪" | "携程" | "美团"> | "其他";
const PLATFORMS: Platform[] = ["飞猪", "携程", "美团", "其他"];

const SHOP_KEY = "hotelos.shops.list";

const STEPS = [
  { id: 1, title: "店铺名称", icon: Store },
  { id: 2, title: "平台配置", icon: Plug },
  { id: 3, title: "飞猪 API", icon: Plug },
  { id: 4, title: "确认创建", icon: ClipboardCheck },
];

/** 日期选择按钮：整框可点击，日历图标居右，支持年份快捷切换 */
function DateField({
  value,
  onChange,
  placeholder = "请选择日期",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const date = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-10 justify-between font-normal text-[13px]",
            !value && "text-muted-foreground",
          )}
        >
          {value ? format(date!, "yyyy-MM-dd") : placeholder}
          <CalendarIcon className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          captionLayout="dropdown"
          fromYear={2000}
          toYear={2100}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export function ShopWizard() {
  const navigate = useNavigate();
  const { setHasShop } = useAuth();
  const [step, setStep] = useState(1);

  // Step1
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");

  // Step2 - 单选平台
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [openTime, setOpenTime] = useState("");
  const [expireTime, setExpireTime] = useState("");

  // Step3 - 飞猪 API
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);

  // 创建成功弹框
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdShopId, setCreatedShopId] = useState<string>("");

  const isFeizhu = platform === "飞猪";

  const next = () => {
    if (step === 1) {
      if (!name.trim()) return toast.error("请输入店铺名称");
      if (!shortName.trim()) return toast.error("请输入店铺简称");
    }
    if (step === 2) {
      if (!platform) return toast.error("请选择一个平台");
      if (!openTime) return toast.error("请选择开店时间");
      if (!expireTime) return toast.error("请选择平台授权有效期");
    }
    // 没选飞猪，跳过 step 3
    if (step === 2 && !isFeizhu) {
      setStep(4);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const prev = () => {
    if (step === 4 && !isFeizhu) {
      setStep(2);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const testConnection = async () => {
    if (!appKey.trim() || !appSecret.trim()) {
      toast.error("请先填写 AppKey 与 AppSecret");
      return;
    }
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTesting(false);
    setTested(true);
    toast.success("连接测试通过");
  };

  const reconfigureApi = () => {
    setTested(false);
  };

  const goNextFromStep3 = () => {
    if (!appKey.trim() || !appSecret.trim()) {
      toast.error("请填写 AppKey 与 AppSecret");
      return;
    }
    if (!tested) {
      toast.error("请先点击「连接测试」并通过后再继续");
      return;
    }
    setStep(4);
  };

  const handleCreate = () => {
    const newId = `shop_${Date.now()}`;
    const channel: Channel = platform === "其他" ? "途家" : (platform as Channel);
    const newShop: Shop = {
      id: newId,
      name,
      shortName,
      region: "华东",
      city: "-",
      address: "-",
      channels: [channel],
      publishTime: openTime,
      openTime,
      expireTime,
      apiConfigs:
        isFeizhu && tested && appKey
          ? [
              {
                id: `ac_${Date.now()}`,
                channel: "飞猪",
                apiUrl: "https://eco.taobao.com/router/rest",
                shopAccountId: appKey,
                apiKey: appSecret,
              },
            ]
          : [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const list: Shop[] = raw ? JSON.parse(raw) : [];
      list.unshift(newShop);
      localStorage.setItem(SHOP_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setHasShop(true);
    setCreatedShopId(newId);
    setSuccessOpen(true);
  };

  const goConfigureRules = () => {
    setSuccessOpen(false);
    navigate({ to: "/shops/$shopId", params: { shopId: createdShopId } });
  };

  const skipConfigure = () => {
    setSuccessOpen(false);
    navigate({ to: "/shops" });
  };

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto text-[13px]">
      {/* Stepper */}
      <Card className="border-border/60 bg-card mb-5">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={`text-[11px] whitespace-nowrap ${
                        isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Step {s.id} · {s.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 mx-2 ${
                        step > s.id ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card">
        <CardContent className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div>
                <h3 className="text-base font-semibold">配置店铺名称</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  店铺名称用于在系统内标识本店铺，建议清晰易识别
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  店铺名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-10"
                  placeholder="例如：上海外滩希尔顿酒店"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  店铺简称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-10"
                  placeholder="例如：外滩希尔顿"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  简称用于列表与卡片中的简短展示
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h3 className="text-base font-semibold">配置平台</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  选择本店铺接入的 OTA 平台（仅可选择一个），并填写开店时间与平台授权有效期
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs">
                  选择平台 <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLATFORMS.map((p) => {
                    const selected = platform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={cn(
                          "relative h-16 rounded-xl border-2 transition-all flex items-center justify-center text-[14px] font-medium",
                          selected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/40",
                        )}
                      >
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {platform && (
                <div className="space-y-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge className="text-[11px]">{platform}</Badge>
                    <span className="text-[12px] text-muted-foreground">平台时间设置</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        开店时间 <span className="text-destructive">*</span>
                      </Label>
                      <DateField
                        value={openTime}
                        onChange={setOpenTime}
                        placeholder="选择开店时间"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1.5">
                        平台授权有效期 <span className="text-destructive">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              平台授权到期后将无法继续推送/同步数据，请在到期前完成续期
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <DateField
                        value={expireTime}
                        onChange={setExpireTime}
                        placeholder="选择有效期"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && isFeizhu && (
            <>
              <div>
                <h3 className="text-base font-semibold">飞猪 API 配置</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  配置 AppKey 与 AppSecret 后即可与飞猪平台数据互通
                </p>
              </div>

              <TooltipProvider>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      AppKey <span className="text-destructive">*</span>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          登录飞猪商家后台 → 应用管理 → 我的应用 → 复制对应应用的 AppKey
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      placeholder="请输入飞猪 AppKey"
                      value={appKey}
                      disabled={tested}
                      onChange={(e) => setAppKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      AppSecret <span className="text-destructive">*</span>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          飞猪商家后台 → 应用管理 → 应用详情 → 查看 AppSecret，请妥善保管
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      type={tested ? "password" : "text"}
                      placeholder="请输入飞猪 AppSecret"
                      value={appSecret}
                      disabled={tested}
                      onChange={(e) => setAppSecret(e.target.value)}
                    />
                  </div>

                  {tested && (
                    <div className="flex items-center gap-2 text-[12px] text-success bg-success/10 rounded-md px-3 py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      连接测试通过，配置已锁定
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {tested ? (
                      <Button variant="outline" className="flex-1" onClick={reconfigureApi}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        更换配置
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={testConnection}
                        disabled={testing}
                      >
                        {testing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            测试中...
                          </>
                        ) : (
                          "连接测试"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </TooltipProvider>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h3 className="text-base font-semibold">确认信息</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  请核对以下信息，确认无误后即可创建店铺
                </p>
              </div>

              <dl className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden">
                <Row label="店铺名称" value={name} />
                <Row label="店铺简称" value={shortName} />
                <Row
                  label="平台"
                  value={
                    platform ? (
                      <Badge variant="secondary" className="text-[11px]">
                        {platform}
                      </Badge>
                    ) : (
                      "-"
                    )
                  }
                />
                <Row label="开店时间" value={openTime || "-"} />
                <Row label="平台授权有效期" value={expireTime || "-"} />
                {isFeizhu && (
                  <Row
                    label="飞猪 API"
                    value={
                      tested ? (
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 已配置并测试通过
                        </span>
                      ) : (
                        <span className="text-muted-foreground">未配置</span>
                      )
                    }
                  />
                )}
              </dl>
            </>
          )}

          {/* Footer 按钮 */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            {step > 1 ? (
              <Button variant="ghost" onClick={prev} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> 上一步
              </Button>
            ) : (
              <span />
            )}
            {step === 4 ? (
              <Button onClick={handleCreate} className="gap-1">
                <Check className="h-4 w-4" /> 确认创建
              </Button>
            ) : step === 3 ? (
              <Button onClick={goNextFromStep3} className="gap-1">
                下一步 <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={next} className="gap-1">
                下一步 <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 创建成功弹窗 */}
      <Dialog open={successOpen} onOpenChange={(o) => !o && skipConfigure()}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-center">店铺创建成功</DialogTitle>
            <DialogDescription className="text-center">
              店铺已成功创建。建议您前往店铺详情页配置店铺规则（提前预定、加价、取消政策等），也可以稍后再配置。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={skipConfigure}>
              稍后再配置
            </Button>
            <Button onClick={goConfigureRules} className="gap-1">
              <Settings2 className="h-4 w-4" />
              前往配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center px-3.5 py-2.5 text-[13px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value || "-"}</dd>
    </div>
  );
}
