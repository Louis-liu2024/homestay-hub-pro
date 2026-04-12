import { createFileRoute } from "@tanstack/react-router";
import { PriceCalculator } from "@/components/PriceCalculator";

export const Route = createFileRoute("/_app/price-calculator")({
  head: () => ({
    meta: [
      { title: "价格计算器 — 酒店SaaS管理平台" },
      { name: "description", content: "配置不同标签、品牌、时间段的发布价格涨幅比" },
    ],
  }),
  component: PriceCalculator,
});
