import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/lib/db";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/lib/utils";
import { getServerSession } from "next-auth";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
    try {
        const result = CreateStreamSchema.parse(await req.json());

        const isYt = result.url.match(YT_REGEX);

        if (!isYt) {
            return NextResponse.json({
                message: "Invalid URL",
            }, { status: 400 })
        }

        const extractedId = result.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        // console.log(res);
        const thumbnail = res.thumbnail.thumbnails
        thumbnail.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1);

        const bigthumb = thumbnail[thumbnail.length - 1].url;
        const smallthumb = thumbnail.length > 1 ? thumbnail[thumbnail.length - 2].url : thumbnail[thumbnail.length - 1].url

        const existingActiveStream = await prismaClient.stream.count({
            where: {
                userId: result.creatorId
            }
        })

        if(existingActiveStream > MAX_QUEUE_LEN) {
            return NextResponse.json({
                message: "Max queue length reached"
            }, {status: 411})
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: result.creatorId,
                url: result.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Can't find video",
                bigImg: bigthumb ?? "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/e66da21e-18d6-473e-b91a-abadcae8a0fa/f9ac7ce6-87dc-45ac-9876-5cf52d65570d.png",
                smallImg: smallthumb ?? "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/e66da21e-18d6-473e-b91a-abadcae8a0fa/f9ac7ce6-87dc-45ac-9876-5cf52d65570d.png"
            }
        })

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0
        }, { status: 200 })

    } catch (error) {
        console.log("Error while creating stream", error);
        return NextResponse.json({
            message: "Error while creating stream",
        }, { status: 411 })
    }

}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "Unauthorized",
        }, { status: 401 })
    }

    if (!creatorId) {
        return NextResponse.json({
            message: "Error"
        }, { status: 411 })
    }
    const [stream, activeStream] = await Promise.all([
        await prismaClient.stream.findMany({
            where: {
                userId: creatorId,
                played: false
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
        }),
        await prismaClient.currentStream.findFirst({
            where: {
                userId: creatorId
            },
            include: {
                stream: true
            }
        })
    ])
    return NextResponse.json({
        streams: stream.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream
    })
}

