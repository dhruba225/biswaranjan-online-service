import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getDashboardData() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total Income Today
    const dailyRevenueAgg = await prisma.service.aggregate({
        where: {
            serviceDate: {
                gte: startOfDay,
            },
        },
        _sum: {
            amount: true,
        },
    });

    // Total Income This Month
    const monthlyRevenueAgg = await prisma.service.aggregate({
        where: {
            serviceDate: {
                gte: startOfMonth,
            },
        },
        _sum: {
            amount: true,
        },
    });

    // Total Customers
    const totalCustomers = await prisma.customer.count();

    // Recent Services Table
    const recentServices = await prisma.service.findMany({
        take: 10,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            customer: true,
        },
    });

    return {
        dailyRevenue: dailyRevenueAgg._sum.amount || 0,
        monthlyRevenue: monthlyRevenueAgg._sum.amount || 0,
        totalCustomers,
        recentServices,
    };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1 sm:mb-2">Admin Dashboard</h1>
                <p className="text-slate-500 mt-2">Overview of all services and financial insights.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Daily Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{data.dailyRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Monthly Income</CardTitle>
                        <IndianRupee className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{data.monthlyRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{data.totalCustomers}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Recent Services</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {data.recentServices.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No services found. Add a new service to get started.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Description</th>
                                        <th className="px-4 py-3 font-medium">Ack No.</th>
                                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentServices.map((service: any) => (
                                        <tr key={service.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3">{new Date(service.serviceDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{service.customer.fullName}</td>
                                            <td className="px-4 py-3 text-slate-500">{service.description}</td>
                                            <td className="px-4 py-3 text-slate-500">{service.acknowledgementNumber || "-"}</td>
                                            <td className="px-4 py-3 text-right font-medium">₹{service.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
