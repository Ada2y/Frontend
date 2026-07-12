import Sidebar from '@/app/(dashboard)/_components/Sidebar';
import Topbar from '@/app/(dashboard)/_components/Topbar';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-full bg-background">
      <Sidebar />
      <div className="relative flex min-h-full flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
