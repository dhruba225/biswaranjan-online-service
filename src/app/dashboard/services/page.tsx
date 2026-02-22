"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, IndianRupee, FilterX, Download } from "lucide-react";
import { toast } from "sonner";
import { generateInvoice } from "@/lib/pdf";

type Customer = {
    fullName: string;
    mobileNumber: string;
    address: string | null;
};

type Service = {
    id: string;
    description: string;
    amount: number;
    serviceDate: string;
    acknowledgementNumber: string | null;
    customer: Customer;
};

export default function AllServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters State
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (minAmount) queryParams.append("minAmount", minAmount);
            if (maxAmount) queryParams.append("maxAmount", maxAmount);
            if (startDate) queryParams.append("startDate", startDate);
            if (endDate) queryParams.append("endDate", endDate);

            const res = await fetch(`/api/services?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setServices(data.services || []);
            } else {
                toast.error("Failed to load services");
            }
        } catch (error) {
            toast.error("An error occurred loading services");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []); // Initial load

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchServices();
    };

    const clearFilters = () => {
        setMinAmount("");
        setMaxAmount("");
        setStartDate("");
        setEndDate("");
        // Need to trigger a fetch immediately without waiting for state to settle 
        // to avoid a complex useEffect structure for this simple clear action
        setIsLoading(true);
        fetch("/api/services")
            .then(res => res.json())
            .then(data => setServices(data.services || []))
            .catch(() => toast.error("Failed to reload services"))
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Services</h1>
                <p className="text-slate-500 mt-2">View and filter every service transaction.</p>
            </div>

            {/* Filters Form */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-lg flex justify-between items-center">
                        <span>Filters</span>
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                            <FilterX className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minAmount">Min Amount (₹)</Label>
                            <Input
                                id="minAmount"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxAmount">Max Amount (₹)</Label>
                            <Input
                                id="maxAmount"
                                type="number"
                                min="0"
                                placeholder="No limit"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 w-full mb-0.5">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Apply Filters
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <p className="text-lg font-medium text-slate-900 mb-1">No services found</p>
                            <p>Try adjusting your filter parameters to see more results.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Mobile</th>
                                        <th className="px-6 py-4 font-medium">Description</th>
                                        <th className="px-6 py-4 font-medium">Ack No.</th>
                                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {services.map((service) => (
                                        <tr key={service.id} className="last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(service.serviceDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{service.customer.fullName}</td>
                                            <td className="px-6 py-4 text-slate-500">{service.customer.mobileNumber}</td>
                                            <td className="px-6 py-4 text-slate-500">{service.description}</td>
                                            <td className="px-6 py-4 text-slate-500">{service.acknowledgementNumber || "-"}</td>
                                            <td className="px-6 py-4 text-right font-medium text-indigo-700">₹{service.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Group all services for this customer on this specific day
                                                        const sameDayServices = services.filter(s =>
                                                            s.customer.mobileNumber === service.customer.mobileNumber &&
                                                            new Date(s.serviceDate).toDateString() === new Date(service.serviceDate).toDateString()
                                                        );

                                                        generateInvoice({
                                                            customerName: service.customer.fullName,
                                                            mobileNumber: service.customer.mobileNumber,
                                                            address: service.customer.address || undefined,
                                                            services: sameDayServices.map(s => ({
                                                                description: s.description,
                                                                amount: s.amount.toString(),
                                                                serviceDate: s.serviceDate,
                                                                acknowledgementNumber: s.acknowledgementNumber || "-"
                                                            }))
                                                        });
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                                >
                                                    <Download className="h-4 w-4 mr-1" /> PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900">
                                        <td colSpan={5} className="px-6 py-4 text-right">Filtered Total:</td>
                                        <td className="px-6 py-4 text-right text-indigo-700">
                                            ₹{services.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
