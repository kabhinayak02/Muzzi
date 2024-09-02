"use client"
import { useSession } from 'next-auth/react'

import StreamView from '@/components/StreamView';
import useRedirect from '@/hooks/useRedirect';

export default function Component() {
    const session = useSession();
    const redirect = useRedirect();
    try {
        if (!session.data?.user?.id) {
            // redirect();
            return (
                <h1>Please Log in....</h1>
            )
        }
        return <StreamView creatorId={session.data.user.id} playVideo={true} />
    } catch(error) {
        console.log("Error in Dashboard", error);
        return null
    }
}

export const dynamic = 'auto'