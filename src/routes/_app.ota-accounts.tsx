import { createFileRoute } from "@tanstack/react-router";
import { OtaAccountManagement } from "@/components/OtaAccountManagement";

export const Route = createFileRoute("/_app/ota-accounts")({
  head: () => ({
    meta: [
      { title: "OTA账号 — 酒店SaaS管理平台" },
      { name: "description", content: "管理 OTA 平台账号、下单上限和操作人员分配" },
    ],
  }),
  component: OtaAccountManagement,
});
