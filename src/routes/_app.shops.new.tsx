import { createFileRoute } from "@tanstack/react-router";
import { ShopWizard } from "@/components/ShopWizard";

export const Route = createFileRoute("/_app/shops/new")({
  head: () => ({
    meta: [{ title: "新建店铺 — 酒店SaaS管理平台" }],
  }),
  component: ShopWizard,
});
