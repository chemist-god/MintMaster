import { Outlet } from "react-router-dom";
import Header from "@/components/shared/header";

export default function AppLayout() {
  return (
    <main className="min-h-screen bg-[#030303] text-white relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black">
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#111113_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1a1a1a,transparent)]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </div>

      {/* Floating elements for futuristic feel */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl" />
      </div>
    </main>
  );
}
