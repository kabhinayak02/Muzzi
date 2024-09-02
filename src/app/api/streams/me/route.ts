import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest){
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if(!user){
        return NextResponse.json({
            message: "Unauthorized",
        }, { status: 401 })
    }

    const stream = await prismaClient.stream.findMany({
        where: {
            userId: user.id
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: user.id
                } 
            }
        }
    })
    return NextResponse.json({
        streams: stream.map(({_count, ...rest}) => ({
            ...rest,
            upvotesCount: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true: false 
        }))
    })
}