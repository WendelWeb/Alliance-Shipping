import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopBar from '@/components/admin/TopBar';
import { FloatingLanguageSwitcher } from '@/components/admin/FloatingLanguageSwitcher';
import { PageTransition } from '@/components/admin/PageTransition';
import { ToastProvider } from '@/components/admin/Toast';
import { AdminCacheProvider } from '@/hooks/useAdminCache';

// Auth is handled by middleware (verifyAdminJwt) — no need to call
// getAdminSession() here, which would make this layout dynamic and
// force a server round-trip on every client-side navigation.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminCacheProvider>
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar (includes mobile header) */}
        <AdminSidebar />

        {/* Floating Language Switcher - Only visible below 400px */}
        <FloatingLanguageSwitcher />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar - Hidden on mobile since Sidebar has mobile header */}
          <div className="hidden lg:block">
            <AdminTopBar />
          </div>

          {/* Page Content - pt-14 for mobile fixed header (56px), lg:pt-0 for desktop */}
          <main className="py-6 px-4 sm:px-6 lg:px-8 pt-14 lg:pt-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ToastProvider>
    </AdminCacheProvider>
  );
}
