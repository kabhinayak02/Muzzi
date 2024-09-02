import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { z } from "zod";


const UpvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user) {
        return NextResponse.json({
            message: "Unauthorized",
        }, { status: 401 })
    }

    try {
        const data = UpvoteSchema.parse(await req.json());
        await prismaClient.upvotes.create({
            data: {
                userId: user.id,
                streamId: data.streamId
            }
        })

        return NextResponse.json({
            message: "Upvoted Successfully"
        }, {status: 200})
        
    } catch (error) {
        console.log("Error while upvoting", error);
        return NextResponse.json({
            message: "Error while upvoting",
        }, { status: 411 })   
    }
}