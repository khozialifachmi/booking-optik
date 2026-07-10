import { Header } from "@/components/layout/header";
import { ADMIN_NAV } from "@/lib/constants";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gunakan cache internal untuk menghindari render yang lambat
  let session;
  let isDbError = false;
  try {
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (e) {
    // Jangan langsung redirect saat error transient (timeout DB, dll)
    console.error("Admin Layout Session Error:", e);
    isDbError = true;
  }

  if (!session && !isDbError) {
    return redirect("/admin-login");
  }

  if (session && session.user.role !== "admin") {
    redirect("/dashboard"); // Redirect customer to their own dashboard
  }

  const userName = session?.user?.name || "Admin";

  return (
    <div className="flex min-h-svh flex-col">
      <Header
        userName={userName}
        navItems={ADMIN_NAV as unknown as { label: string; href: string; icon: string }[]}
        logoutUrl="/admin-login"
        profileUrl="/admin/profile"
      />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
