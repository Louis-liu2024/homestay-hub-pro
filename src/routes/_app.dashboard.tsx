import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "数据大盘 — 酒店SaaS管理平台" },
      { name: "description", content: "查看各店铺的订单大盘和数据分析" },
    ],
  }),
  component: Dashboard,
});
