import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  breakfastCounts: number[]; // when specific
  dateMode: "range" | "monthly" | "weekly" | "specific";
  dateRange?: { from?: string; to?: string };
  monthlyDays: number[]; // 1-31
  weeklyDays: number[]; // 0-6 (Sun-Sat)
  specificDates: string[]; // yyyy-MM-dd
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
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {initial ? "编辑加价规则" : "添加加价规则"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            配置该规则适用的渠道、价格、日期及加价方式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 数据渠道 */}
          <Field label="数据渠道" required>
            <Select
              value={rule.channel}
              onValueChange={(v) => update("channel", v)}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="请选择数据渠道" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c} className="text-[13px]">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* 价格区间 */}
          <Field label="价格区间">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-9 w-28 text-[13px]"
                value={rule.priceMin}
                onChange={(e) => update("priceMin", Number(e.target.value) || 0)}
              />
              <span className="text-muted-foreground">~</span>
              <Input
                type="number"
                className="h-9 w-28 text-[13px]"
                value={rule.priceMax}
                onChange={(e) => update("priceMax", Number(e.target.value) || 0)}
              />
              <span className="text-[11px] text-muted-foreground">元</span>
            </div>
          </Field>

          {/* 早餐数量 */}
          <Field label="早餐数量">
            <RadioGroup
              value={rule.breakfastMode}
              onValueChange={(v) => update("breakfastMode", v as "any" | "specific")}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="any" /> 不限
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="specific" /> 指定数量
              </label>
            </RadioGroup>
            {rule.breakfastMode === "specific" && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="输入数量后回车或点击 +"
                    className="h-8 w-44 text-[13px]"
                    value={breakfastInput}
                    onChange={(e) => setBreakfastInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBreakfast();
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" className="h-8" onClick={addBreakfast}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rule.breakfastCounts.map((n) => (
                    <Badge
                      key={n}
                      variant="secondary"
                      className="text-[12px] gap-1 pl-2 pr-1"
                    >
                      {n} 份
                      <button
                        onClick={() =>
                          update(
                            "breakfastCounts",
                            rule.breakfastCounts.filter((x) => x !== n)
                          )
                        }
                        className="hover:bg-muted rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {rule.breakfastCounts.length === 0 && (
                    <span className="text-[11px] text-muted-foreground">暂未添加</span>
                  )}
                </div>
              </div>
            )}
          </Field>

          {/* 日期选择 */}
          <Field label="日期选择">
            <RadioGroup
              value={rule.dateMode}
              onValueChange={(v) => update("dateMode", v as MarkupRuleConfig["dateMode"])}
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="range" /> 时间范围
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="monthly" /> 每月重复
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="weekly" /> 每周重复
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="specific" /> 指定日期
              </label>
            </RadioGroup>

            <div className="mt-2">
              {rule.dateMode === "range" && (
                <div className="flex items-center gap-2">
                  <DatePopover
                    value={rule.dateRange?.from}
                    onChange={(v) =>
                      update("dateRange", { ...(rule.dateRange ?? {}), from: v })
                    }
                    placeholder="开始日期"
                  />
                  <span className="text-muted-foreground">至</span>
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
                <div className="grid grid-cols-7 gap-1 max-w-md">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                    const active = rule.monthlyDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleMonthDay(d)}
                        className={cn(
                          "h-8 rounded text-[12px] border transition-colors",
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
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((w, i) => {
                    const active = rule.weeklyDays.includes(i);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleWeekday(i)}
                        className={cn(
                          "h-8 px-3 rounded text-[12px] border transition-colors",
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
                      <Button variant="outline" size="sm" className="h-8 text-[12px]">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" /> 添加日期
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
                  <div className="flex flex-wrap gap-1.5">
                    {rule.specificDates.map((d) => (
                      <Badge
                        key={d}
                        variant="secondary"
                        className="text-[12px] gap-1 pl-2 pr-1"
                      >
                        {d}
                        <button
                          onClick={() =>
                            update(
                              "specificDates",
                              rule.specificDates.filter((x) => x !== d)
                            )
                          }
                          className="hover:bg-muted rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Field>

          {/* 节假日 */}
          <Field label="节假日">
            <RadioGroup
              value={rule.holidayMode}
              onValueChange={(v) => update("holidayMode", v as MarkupRuleConfig["holidayMode"])}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="none" /> 不限
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="include" /> 包含节假日
              </label>
              <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <RadioGroupItem value="exclude" /> 排除节假日
              </label>
            </RadioGroup>
          </Field>

          {/* 品牌/房型关键词 */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="品牌关键词">
              <Input
                className="h-9 text-[13px]"
                placeholder="如：如家、汉庭"
                value={rule.brandKeyword}
                onChange={(e) => update("brandKeyword", e.target.value)}
              />
            </Field>
            <Field label="房型关键词">
              <Input
                className="h-9 text-[13px]"
                placeholder="如：大床、双床"
                value={rule.roomKeyword}
                onChange={(e) => update("roomKeyword", e.target.value)}
              />
            </Field>
          </div>

          {/* 加价规则 */}
          <Field label="加价规则" required>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                className="h-9 w-24 text-[13px]"
                value={rule.markupPercent}
                onChange={(e) => update("markupPercent", Number(e.target.value) || 0)}
              />
              <span className="text-muted-foreground">%</span>
              <span className="text-muted-foreground">+</span>
              <Input
                type="number"
                step="0.01"
                className="h-9 w-24 text-[13px]"
                value={rule.markupFixed}
                onChange={(e) => update("markupFixed", Number(e.target.value) || 0)}
              />
              <span className="text-[11px] text-muted-foreground">元（支持小数）</span>
            </div>
          </Field>

          {/* 优先级 */}
          <Field label="优先级">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-9 w-28 text-[13px]"
                value={rule.priority}
                onChange={(e) => update("priority", Number(e.target.value) || 0)}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">数字越大优先级越高</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!rule.channel}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
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
            "h-9 w-44 justify-start text-[13px] font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 mr-2 opacity-60" />
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
