"use client";

import { useRouter } from "next/navigation";

import { useOEE } from "@/components/oee/OEEContext";
import LoginScreen from "@/components/oee/screens/LoginScreen";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useOEE();

  return (
    <LoginScreen
      onLogin={(u) => {
        setUser(u);
        router.replace("/overview");
      }}
    />
  );
}
