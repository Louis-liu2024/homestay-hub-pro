import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("hotelos.auth.user");
      if (!raw) {
        throw redirect({ to: "/login" });
      }
    }
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
