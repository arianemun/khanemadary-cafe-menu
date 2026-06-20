"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAdminT } from "@/lib/admin-i18n";
import { AdminLocaleSelect } from "@/components/admin/AdminLocaleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const { t } = useAdminT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("login.invalidCredentials"));
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("login.title")}</CardTitle>
          <AdminLocaleSelect triggerClassName="w-[8.5rem]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? t("login.signingIn") : t("login.login")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
