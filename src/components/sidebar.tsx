"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, FileText, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Add Service", href: "/dashboard/add", icon: FileText },
    { name: "Search Customers", href: "/dashboard/search", icon: Search },
    { name: "All Services", href: "/dashboard/services", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="w-full md:w-72 md:h-screen md:sticky top-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col z-20 shadow-sm shrink-0">
            {/* Header / Brand */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 w-full">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full shadow-sm drop-shadow-sm flex-shrink-0 bg-white"
                    />
                    <span className="font-bold text-sm md:text-base tracking-tight text-slate-900 leading-tight">
                        Biswaranjan<br />Online Service
                    </span>
                </div>
                {/* Mobile Sign Out */}
                <div className="md:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-row md:flex-col flex-1 overflow-x-auto md:overflow-y-auto w-full scrollbar-hide border-b md:border-b-0 border-slate-100">
                <nav className="flex flex-row md:flex-col min-w-max md:min-w-0 flex-1 px-4 py-2 md:py-6 gap-2 md:gap-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600",
                                        "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 flex-shrink-0"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop Footer */}
            <div className="hidden md:block border-t border-slate-200 p-4 shrink-0 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="text-sm font-medium text-slate-700 truncate w-40">
                        {session?.user?.email}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
