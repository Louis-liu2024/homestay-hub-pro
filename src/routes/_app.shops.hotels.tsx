import { createFileRoute } from "@tanstack/react-router";
import { DataPoolList } from "@/components/DataPoolList";

export const Route = createFileRoute("/_app/shops/hotels")({
  head: () => ({
    meta: [{ title: "酒店列表 — 酒店SaaS管理平台" }],
  }),
  component: DataPoolList,
});
