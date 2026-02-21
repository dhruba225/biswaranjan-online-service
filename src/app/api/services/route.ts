import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    try {
        const whereClause: any = {};

        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) whereClause.amount.gte = parseFloat(minAmount);
            if (maxAmount) whereClause.amount.lte = parseFloat(maxAmount);
        }

        if (startDate || endDate) {
            whereClause.serviceDate = {};
            if (startDate) whereClause.serviceDate.gte = new Date(startDate);
            if (endDate) whereClause.serviceDate.lte = new Date(endDate);
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                customer: true
            },
            orderBy: {
                serviceDate: "desc"
            }
        });

        return NextResponse.json({ services });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { customerId, mobileNumber, fullName, address, services } = data;

        if (!mobileNumber || !fullName || !services || !Array.isArray(services) || services.length === 0) {
            return NextResponse.json({ message: "Missing required fields or services array" }, { status: 400 });
        }

        let finalCustomerId = customerId;

        // If no existing customer ID was provided, create a new customer
        if (!finalCustomerId) {
            const newCustomer = await prisma.customer.create({
                data: {
                    mobileNumber,
                    fullName,
                    address: address || null,
                }
            });
            finalCustomerId = newCustomer.id;
        }

        // Create the service records in bulk
        const serviceRecords = services.map((s: any) => ({
            customerId: finalCustomerId,
            description: s.description,
            amount: parseFloat(s.amount),
            serviceDate: new Date(s.serviceDate),
            acknowledgementNumber: s.acknowledgementNumber || null
        }));

        await prisma.service.createMany({
            data: serviceRecords,
        });

        return NextResponse.json({ message: "Services created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
