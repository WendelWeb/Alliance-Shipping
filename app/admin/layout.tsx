import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopBar from '@/components/admin/TopBar';
import { FloatingLanguageSwitcher } from '@/components/admin/FloatingLanguageSwitcher';
import { PageTransition } from '@/components/admin/PageTransition';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
