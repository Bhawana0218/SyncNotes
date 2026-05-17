import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/Top-Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopNavbar />
          <div
            className="flex-1 overflow-y-auto"
            style={{ background: "var(--background)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
