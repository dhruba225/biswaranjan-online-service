"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, CheckCircle, Download } from "lucide-react";
import { generateInvoice, InvoiceData } from "@/lib/pdf";

type ServiceEntry = {
    id: string; // temp id for UI only
    description: string;
    amount: string;
    serviceDate: string;
    acknowledgementNumber: string;
};

export default function AddServicePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastSubmittedData, setLastSubmittedData] = useState<InvoiceData | null>(null);

    // Form State
    const [mobileNumber, setMobileNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");

    const [services, setServices] = useState<ServiceEntry[]>([
        {
            id: Math.random().toString(),
            description: "",
            amount: "",
            serviceDate: new Date().toISOString().split("T")[0],
            acknowledgementNumber: ""
        }
    ]);

    // Customer State
    const [customerId, setCustomerId] = useState<string | null>(null);

    const handleMobileBlur = async () => {
        if (!mobileNumber || mobileNumber.length < 10) return;

        setIsSearching(true);
        try {
            const res = await fetch(`/api/customers/search?mobile=${mobileNumber}`);
            if (res.ok) {
                const data = await res.json();
                if (data.customer) {
                    setFullName(data.customer.fullName);
                    setAddress(data.customer.address || "");
                    setCustomerId(data.customer.id);
                    toast.success("Existing customer found & auto-filled");
                } else {
                    setCustomerId(null);
                    setFullName("");
                    setAddress("");
                    toast.info("New customer. Please fill in their details.");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const addServiceRow = () => {
        setServices([...services, {
            id: Math.random().toString(),
            description: "",
            amount: "",
            serviceDate: new Date().toISOString().split("T")[0],
            acknowledgementNumber: ""
        }]);
    };

    const removeServiceRow = (id: string) => {
        if (services.length === 1) return;
        setServices(services.filter(s => s.id !== id));
    };

    const handleServiceChange = (id: string, field: keyof ServiceEntry, value: string) => {
        setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    mobileNumber,
                    fullName,
                    address,
                    services: services.map(s => ({
                        description: s.description,
                        amount: parseFloat(s.amount),
                        serviceDate: s.serviceDate,
                        acknowledgementNumber: s.acknowledgementNumber
                    }))
                }),
            });

            if (res.ok) {
                toast.success("Service record(s) added successfully");
                setLastSubmittedData({
                    customerName: fullName,
                    mobileNumber,
                    address,
                    services: services.map(s => ({
                        description: s.description,
                        amount: s.amount,
                        serviceDate: s.serviceDate,
                        acknowledgementNumber: s.acknowledgementNumber
                    }))
                });
                setIsSuccess(true);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to add service records");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess && lastSubmittedData) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8">
                <Card className="border-slate-200 shadow-sm text-center py-16">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Services Added Successfully!</h2>
                    <p className="text-slate-500 mb-10 text-lg">The customer's ledger has been updated.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={() => generateInvoice(lastSubmittedData)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-base py-6 px-8 h-auto"
                        >
                            <Download className="mr-2 h-5 w-5" /> Download Invoice PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.push("/dashboard");
                                router.refresh();
                            }}
                            className="text-base py-6 px-8 h-auto"
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Service</h1>
                <p className="text-slate-500 mt-2">Log new services and attach them to a customer.</p>
            </div>

            <Card className="border-slate-200 shadow-sm relative overflow-visible">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle>Customer Details</CardTitle>
                        <CardDescription>Enter mobile number to auto-fill existing customer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        onBlur={handleMobileBlur}
                                        required
                                        className="bg-white pr-10"
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    readOnly={!!customerId}
                                    required
                                    className={customerId ? "bg-slate-50 text-slate-500" : "bg-white"}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder="Street, City, Zip"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    readOnly={!!customerId}
                                    className={customerId ? "bg-slate-50 text-slate-500" : "bg-white"}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-slate-900">Services List</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addServiceRow} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                    <Plus className="mr-2 h-4 w-4" /> Add Another Service
                                </Button>
                            </div>

                            <div className="grid gap-6">
                                {services.map((service, index) => (
                                    <div key={service.id} className="relative p-5 border border-slate-200 rounded-lg bg-slate-50/50">
                                        {services.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeServiceRow(service.id)}
                                                className="absolute -top-3 -right-3 bg-white border border-slate-200 shadow-sm rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors z-10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Service {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Description <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="e.g. Adhar Update"
                                                    value={service.description}
                                                    onChange={(e) => handleServiceChange(service.id, "description", e.target.value)}
                                                    required
                                                    className="bg-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Amount (₹) <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={service.amount}
                                                    onChange={(e) => handleServiceChange(service.id, "amount", e.target.value)}
                                                    required
                                                    className="bg-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Service Date <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="date"
                                                    value={service.serviceDate}
                                                    onChange={(e) => handleServiceChange(service.id, "serviceDate", e.target.value)}
                                                    required
                                                    className="bg-white"
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Acknowledgement Number (Optional)</Label>
                                                <Input
                                                    placeholder="e.g. ACK-2023-991"
                                                    value={service.acknowledgementNumber}
                                                    onChange={(e) => handleServiceChange(service.id, "acknowledgementNumber", e.target.value)}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/50 flex justify-end gap-4 py-4 rounded-b-xl z-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isSearching} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Saving..." : `Save ${services.length} Service${services.length > 1 ? 's' : ''}`}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
