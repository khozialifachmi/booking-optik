import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8 relative">
      {/* Decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header (Logo & Theme Toggle) */}
        <div className="flex items-center justify-between px-2">
          <Logo size="lg" />
          <div className="bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <ThemeToggle />
          </div>
        </div>

        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        &copy; 2026 Optik Khayra. Hak cipta dilindungi.
      </p>
    </div>
  );
}
