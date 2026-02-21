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
    const mobile = searchParams.get("mobile");

    if (!mobile) {
        return NextResponse.json({ message: "Mobile number required" }, { status: 400 });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { mobileNumber: mobile },
            include: {
                services: {
                    orderBy: { serviceDate: "desc" }
                }
            }
        });

        return NextResponse.json({ customer });
    } catch (error) {
        console.error("Error searching customer:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
