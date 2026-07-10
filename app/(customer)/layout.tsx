import { Header } from "@/components/layout/header";
import { CUSTOMER_NAV } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  let isDbError = false;
  try {
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (error) {
    // Jangan langsung redirect saat error transient (timeout DB, dll)
    console.error("Session verification error:", error);
    isDbError = true;
  }

  if (!session && !isDbError) {
    redirect("/login");
  }

  const userName = session?.user?.name || "Pengguna";

  return (
    <div className="flex min-h-svh flex-col">
      <Header
        userName={userName}
        navItems={CUSTOMER_NAV as unknown as { label: string; href: string; icon: string }[]}
        profileUrl="/dashboard/profile"
      />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
