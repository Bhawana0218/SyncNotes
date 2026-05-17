import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/Top-Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopNavbar />

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
