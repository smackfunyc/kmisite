import { NextResponse } from 'next/server';
import { getStoredNewsFeed, isFeedStale, refreshTariffRefundNews } from '@/lib/tariffRefundNews';

export const dynamic = 'force-dynamic';

export async function GET() {
    const stored = await getStoredNewsFeed();

    if (!isFeedStale(stored)) {
        return NextResponse.json(stored, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    }

    try {
        const refreshed = await refreshTariffRefundNews();

        return NextResponse.json(refreshed, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('News refresh failed, serving cached feed if available.', error);

        if (stored.items.length > 0) {
            return NextResponse.json(stored, {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            });
        }

        throw error;
    }
}
