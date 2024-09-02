import { NextResponse } from "next/server"
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "Unauthorized",
        }, { status: 403 })
    }

    const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: user.id,
            played: false
        },
        orderBy: {
            upvotes: {
                _count: "desc"
            }
        }
    })

    await Promise.all([
        prismaClient.currentStream.upsert({
            where: {
                userId: user.id, 
            },
            update: {
                streamId: mostUpvotedStream?.id
            },
            create: {
                userId: user.id,
                streamId: mostUpvotedStream?.id
            }
        }),
        prismaClient.stream.update({
            where: {
                id: mostUpvotedStream?.id ?? ""
            },
            data: {
                played: true,
                playedTs: new Date()
            }
        })
    ])

    return NextResponse.json({
        stream: mostUpvotedStream
    })
}   