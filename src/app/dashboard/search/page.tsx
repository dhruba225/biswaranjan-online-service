"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, User as UserIcon, Calendar, IndianRupee, Download } from "lucide-react";
import { toast } from "sonner";
import { generateInvoice } from "@/lib/pdf";

type Service = {
    id: string;
    description: string;
    amount: number;
    serviceDate: string;
    acknowledgementNumber: string | null;
    status: string;
};

type Customer = {
    id: string;
    fullName: string;
    mobileNumber: string;
    address: string | null;
    createdAt: string;
    services: Service[];
};

export default function SearchCustomerPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);
        setHasSearched(true);
        setSelectedCustomer(null);
        setCustomers([]);

        try {
            const res = await fetch(`/api/customers/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                const results = data.customers || [];
                setCustomers(results);

                if (results.length === 1) {
                    setSelectedCustomer(results[0]);
                } else if (results.length === 0) {
                    toast.info("No customers found.");
                }
            } else {
                toast.error("Failed to search. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during search");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1 sm:mb-2">Search Customer</h1>
                <p className="text-slate-500 mt-2">Find customers and their full service history by their name or mobile number.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Enter name or mobile number..."
                                className="pl-10 h-12 text-lg bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-base">
                            {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {hasSearched && !isSearching && customers.length > 1 && !selectedCustomer && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Found {customers.length} Customers</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {customers.map((c) => (
                            <Card key={c.id} className="hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
                                            <UserIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">{c.fullName}</h3>
                                            <p className="text-sm text-slate-500">{c.mobileNumber}</p>
                                            <p className="text-sm text-slate-500 mt-1">{c.services.length} Total Services</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {hasSearched && !isSearching && selectedCustomer && (
                <div className="space-y-6">
                    {customers.length > 1 && (
                        <div className="flex">
                            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                                &larr; Back to Results
                            </Button>
                        </div>
                    )}
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                    <UserIcon className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-xl">{selectedCustomer.fullName}</CardTitle>
                                <CardDescription>Customer Profile</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Mobile Number</p>
                                    <p className="font-medium text-slate-900">{selectedCustomer.mobileNumber}</p>
                                </div>
                                {selectedCustomer.address && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Address</p>
                                        <p className="font-medium text-slate-900">{selectedCustomer.address}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Customer Since</p>
                                    <p className="font-medium text-slate-900">
                                        {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="pt-4 border-t mt-4">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Services</p>
                                    <p className="text-2xl font-bold text-indigo-600">{selectedCustomer.services.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 border-slate-200 shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle>Service History</CardTitle>
                                <CardDescription>A complete log of every service received.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {selectedCustomer.services.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 block">No services found for this customer.</div>
                                ) : (
                                    <ul className="divide-y divide-slate-200">
                                        {selectedCustomer.services.map((service) => (
                                            <li key={service.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-lg text-slate-900">{service.description}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                            {service.status}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const sameDayServices = selectedCustomer.services.filter(s =>
                                                                    new Date(s.serviceDate).toDateString() === new Date(service.serviceDate).toDateString()
                                                                );

                                                                generateInvoice({
                                                                    customerName: selectedCustomer.fullName,
                                                                    mobileNumber: selectedCustomer.mobileNumber,
                                                                    address: selectedCustomer.address || undefined,
                                                                    services: sameDayServices.map(s => ({
                                                                        description: s.description,
                                                                        amount: s.amount.toString(),
                                                                        serviceDate: s.serviceDate,
                                                                        acknowledgementNumber: s.acknowledgementNumber || "-"
                                                                    }))
                                                                });
                                                            }}
                                                            className="h-7 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 shadow-sm"
                                                        >
                                                            <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6 mt-4 text-sm text-slate-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {new Date(service.serviceDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center font-medium text-slate-900">
                                                        <IndianRupee className="mr-1 h-4 w-4" />
                                                        {service.amount.toFixed(2)}
                                                    </div>
                                                    {service.acknowledgementNumber && (
                                                        <div className="flex items-center text-slate-500">
                                                            <span className="font-medium text-slate-700 mr-1">Ack:</span> {service.acknowledgementNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {hasSearched && !isSearching && customers.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <UserIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">No Customer Found</h3>
                    <p className="mt-1 text-sm text-slate-500">We couldn&apos;t find anyone matching that search.</p>
                </div>
            )}
        </div>
    );
}
