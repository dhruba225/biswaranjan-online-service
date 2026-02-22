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
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ message: "Search query required" }, { status: 400 });
    }

    try {
        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { mobileNumber: { contains: q } },
                    { fullName: { contains: q } },
                ]
            },
            include: {
                services: {
                    orderBy: { serviceDate: "desc" }
                }
            }
        });

        return NextResponse.json({ customers });
    } catch (error) {
        console.error("Error searching customer:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
