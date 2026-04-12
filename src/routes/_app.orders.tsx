import { createFileRoute } from "@tanstack/react-router";
import { OrderManagement } from "@/components/OrderManagement";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [
      { title: "订单管理 — 酒店SaaS管理平台" },
      { name: "description", content: "查看和管理用户订房订单" },
    ],
  }),
  component: OrderManagement,
});
