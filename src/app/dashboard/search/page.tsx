"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, User as UserIcon, Calendar, IndianRupee } from "lucide-react";
import { toast } from "sonner";

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
    const [mobileNumber, setMobileNumber] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobileNumber) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            const res = await fetch(`/api/customers/search?mobile=${mobileNumber}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data.customer || null);
                if (!data.customer) {
                    toast.info("No customer found with that mobile number.");
                }
            } else {
                setCustomer(null);
                toast.error("Failed to search. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during search");
            setCustomer(null);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1 sm:mb-2">Search Ledger</h1>
                <p className="text-slate-500 mt-2">Find customers and their full service history by their mobile number.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Enter mobile number... (e.g. 9876543210)"
                                className="pl-10 h-12 text-lg bg-white"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-base">
                            {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {hasSearched && !isSearching && customer && (
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Customer Profile Card */}
                    <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                <UserIcon className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-xl">{customer.fullName}</CardTitle>
                            <CardDescription>Customer Profile</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Mobile Number</p>
                                <p className="font-medium text-slate-900">{customer.mobileNumber}</p>
                            </div>
                            {customer.address && (
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Address</p>
                                    <p className="font-medium text-slate-900">{customer.address}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-slate-500">Customer Since</p>
                                <p className="font-medium text-slate-900">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="pt-4 border-t mt-4">
                                <p className="text-sm font-medium text-slate-500 mb-1">Total Services</p>
                                <p className="text-2xl font-bold text-indigo-600">{customer.services.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service History List */}
                    <Card className="md:col-span-2 border-slate-200 shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle>Service History</CardTitle>
                            <CardDescription>A complete log of every service received.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {customer?.services?.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 block">No services found for this customer.</div>
                            ) : (
                                <ul className="divide-y divide-slate-200">
                                    {customer?.services?.map((service) => (
                                        <li key={service.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-lg text-slate-900">{service.description}</h4>
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    {service.status}
                                                </span>
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
            )}

            {hasSearched && !isSearching && !customer && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <UserIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">No Customer Found</h3>
                    <p className="mt-1 text-sm text-slate-500">We couldn&apos;t find anyone with that mobile number.</p>
                </div>
            )}
        </div>
    );
}
