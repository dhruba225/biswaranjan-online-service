"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
            <div className="w-full md:w-72 md:flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
