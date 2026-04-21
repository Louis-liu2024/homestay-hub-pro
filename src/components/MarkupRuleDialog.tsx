import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MarkupRuleConfig {
  id: string;
  channel: string;
  priceMin: number;
  priceMax: number;
  breakfastMode: "any" | "specific";
  breakfastCounts: number[];
  dateMode: "range" | "monthly" | "weekly" | "specific";
  dateRange?: { from?: string; to?: string };
  monthlyDays: number[];
  weeklyDays: number[];
  specificDates: string[];
  holidayMode: "none" | "include" | "exclude";
  brandKeyword: string;
  roomKeyword: string;
  markupPercent: number;
  markupFixed: number;
  priority: number;
}

export const DEFAULT_MARKUP_RULE: MarkupRuleConfig = {
  id: "",
  channel: "",
  priceMin: 0,
  priceMax: 9999,
  breakfastMode: "any",
  breakfastCounts: [],
  dateMode: "range",
  dateRange: {},
  monthlyDays: [],
  weeklyDays: [],
  specificDates: [],
  holidayMode: "none",
  brandKeyword: "",
  roomKeyword: "",
  markupPercent: 0,
  markupFixed: 0,
  priority: 0,
};

const CHANNEL_OPTIONS = ["艺龙", "美团", "携程", "去哪儿", "同程", "飞猪"];
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MarkupRuleConfig | null;
  onSave: (rule: MarkupRuleConfig) => void;
}

export function MarkupRuleDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [rule, setRule] = useState<MarkupRuleConfig>(DEFAULT_MARKUP_RULE);
  const [breakfastInput, setBreakfastInput] = useState("");
  const [specificDateOpen, setSpecificDateOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setRule(
        initial
          ? { ...DEFAULT_MARKUP_RULE, ...initial }
          : { ...DEFAULT_MARKUP_RULE, id: `m${Date.now()}` }
      );
      setBreakfastInput("");
    }
  }, [open, initial]);

  const update = <K extends keyof MarkupRuleConfig>(k: K, v: MarkupRuleConfig[K]) =>
    setRule((r) => ({ ...r, [k]: v }));

  const addBreakfast = () => {
    const n = Number(breakfastInput);
    if (!Number.isFinite(n) || n < 0) return;
    if (rule.breakfastCounts.includes(n)) return;
    update("breakfastCounts", [...rule.breakfastCounts, n].sort((a, b) => a - b));
    setBreakfastInput("");
  };

  const toggleWeekday = (d: number) => {
    const next = rule.weeklyDays.includes(d)
      ? rule.weeklyDays.filter((x) => x !== d)
      : [...rule.weeklyDays, d].sort();
    update("weeklyDays", next);
  };

  const toggleMonthDay = (d: number) => {
    const next = rule.monthlyDays.includes(d)
      ? rule.monthlyDays.filter((x) => x !== d)
      : [...rule.monthlyDays, d].sort((a, b) => a - b);
    update("monthlyDays", next);
  };

  const handleSave = () => {
    onSave(rule);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-base font-semibold">
            {initial ? "编辑加价规则" : "添加加价规则"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            按下方分区填写规则的适用范围与加价方式
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* 分区 1：基础信息 */}
          <Section title="基础信息" description="选择规则适用的渠道和价格区间">
            <div className="grid grid-cols-2 gap-4">
              <Field label="数据渠道" required>
                <Select
                  value={rule.channel}
                  onValueChange={(v) => update("channel", v)}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="请选择数据渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="text-sm">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="价格区间（元）">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-10 text-sm"
                    value={rule.priceMin}
                    onChange={(e) => update("priceMin", Number(e.target.value) || 0)}
                  />
                  <span className="text-muted-foreground text-sm">~</span>
                  <Input
                    type="number"
                    className="h-10 text-sm"
                    value={rule.priceMax}
                    onChange={(e) => update("priceMax", Number(e.target.value) || 0)}
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* 分区 2：适用条件 */}
          <Section title="适用条件" description="设置早餐、品牌与房型的匹配条件">
            <Field label="早餐数量">
              <RadioGroup
                value={rule.breakfastMode}
                onValueChange={(v) => update("breakfastMode", v as "any" | "specific")}
                className="flex items-center gap-6"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="any" /> 不限
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="specific" /> 指定数量
                </label>
              </RadioGroup>
              {rule.breakfastMode === "specific" && (
                <div className="mt-3 space-y-2 rounded-md border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="输入数量后回车或点击 +"
                      className="h-9 w-52 text-sm bg-background"
                      value={breakfastInput}
                      onChange={(e) => setBreakfastInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBreakfast();
                        }
                      }}
                    />
                    <Button size="sm" variant="outline" className="h-9" onClick={addBreakfast}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                    {rule.breakfastCounts.map((n) => (
                      <Badge
                        key={n}
                        variant="secondary"
                        className="text-xs gap-1 pl-2 pr-1 py-0.5"
                      >
                        {n} 份
                        <button
                          onClick={() =>
                            update(
                              "breakfastCounts",
                              rule.breakfastCounts.filter((x) => x !== n)
                            )
                          }
                          className="hover:bg-background/60 rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {rule.breakfastCounts.length === 0 && (
                      <span className="text-xs text-muted-foreground">暂未添加</span>
                    )}
                  </div>
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="品牌关键词">
                <Input
                  className="h-10 text-sm"
                  placeholder="如：如家、汉庭"
                  value={rule.brandKeyword}
                  onChange={(e) => update("brandKeyword", e.target.value)}
                />
              </Field>
              <Field label="房型关键词">
                <Input
                  className="h-10 text-sm"
                  placeholder="如：大床、双床"
                  value={rule.roomKeyword}
                  onChange={(e) => update("roomKeyword", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* 分区 3：日期设置 */}
          <Section title="日期设置" description="选择规则生效的日期范围与节假日策略">
            <Field label="日期模式">
              <RadioGroup
                value={rule.dateMode}
                onValueChange={(v) => update("dateMode", v as MarkupRuleConfig["dateMode"])}
                className="flex flex-wrap items-center gap-x-6 gap-y-2"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="range" /> 时间范围
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="monthly" /> 每月重复
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="weekly" /> 每周重复
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="specific" /> 指定日期
                </label>
              </RadioGroup>

              <div className="mt-3 rounded-md border bg-muted/30 p-3">
                {rule.dateMode === "range" && (
                  <div className="flex items-center gap-2">
                    <DatePopover
                      value={rule.dateRange?.from}
                      onChange={(v) =>
                        update("dateRange", { ...(rule.dateRange ?? {}), from: v })
                      }
                      placeholder="开始日期"
                    />
                    <span className="text-muted-foreground text-sm">至</span>
                    <DatePopover
                      value={rule.dateRange?.to}
                      onChange={(v) =>
                        update("dateRange", { ...(rule.dateRange ?? {}), to: v })
                      }
                      placeholder="结束日期"
                    />
                  </div>
                )}

                {rule.dateMode === "monthly" && (
                  <div className="grid grid-cols-7 gap-1.5 max-w-md">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const active = rule.monthlyDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleMonthDay(d)}
                          className={cn(
                            "h-9 rounded text-sm border transition-colors bg-background",
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                )}

                {rule.dateMode === "weekly" && (
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((w, i) => {
                      const active = rule.weeklyDays.includes(i);
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => toggleWeekday(i)}
                          className={cn(
                            "h-9 px-4 rounded text-sm border transition-colors bg-background",
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                )}

                {rule.dateMode === "specific" && (
                  <div className="space-y-2">
                    <Popover open={specificDateOpen} onOpenChange={setSpecificDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 text-sm bg-background">
                          <CalendarIcon className="h-4 w-4 mr-1.5" /> 添加日期
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="multiple"
                          captionLayout="dropdown"
                          selected={rule.specificDates.map((d) => new Date(d))}
                          onSelect={(dates) => {
                            update(
                              "specificDates",
                              (dates ?? []).map((d) => format(d, "yyyy-MM-dd"))
                            );
                          }}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {rule.specificDates.map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="text-xs gap-1 pl-2 pr-1 py-0.5"
                        >
                          {d}
                          <button
                            onClick={() =>
                              update(
                                "specificDates",
                                rule.specificDates.filter((x) => x !== d)
                              )
                            }
                            className="hover:bg-background/60 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {rule.specificDates.length === 0 && (
                        <span className="text-xs text-muted-foreground">暂未添加</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Field>

            <Field label="节假日">
              <RadioGroup
                value={rule.holidayMode}
                onValueChange={(v) => update("holidayMode", v as MarkupRuleConfig["holidayMode"])}
                className="flex items-center gap-6"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="none" /> 不限
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="include" /> 包含节假日
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="exclude" /> 排除节假日
                </label>
              </RadioGroup>
            </Field>
          </Section>

          {/* 分区 4：加价方式 */}
          <Section title="加价方式" description="设置加价公式与规则优先级">
            <div className="grid grid-cols-2 gap-4">
              <Field label="加价公式" required>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    className="h-10 text-sm"
                    value={rule.markupPercent}
                    onChange={(e) => update("markupPercent", Number(e.target.value) || 0)}
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                  <span className="text-muted-foreground text-sm">+</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-10 text-sm"
                    value={rule.markupFixed}
                    onChange={(e) => update("markupFixed", Number(e.target.value) || 0)}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">元</span>
                </div>
              </Field>

              <Field
                label="优先级"
                hint="数字越大优先级越高"
              >
                <Input
                  type="number"
                  className="h-10 text-sm"
                  value={rule.priority}
                  onChange={(e) => update("priority", Number(e.target.value) || 0)}
                />
              </Field>
            </div>
          </Section>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!rule.channel}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-2 border-l-2 border-primary pl-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="space-y-4 pl-2.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  );
}

function DatePopover({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-44 justify-start text-sm font-normal bg-background",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 mr-2 opacity-60" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value ? new Date(value) : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
