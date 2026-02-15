import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
