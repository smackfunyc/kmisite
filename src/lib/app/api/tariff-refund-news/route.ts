import { NextResponse } from 'next/server';
import { getStoredNewsFeed, refreshTariffRefundNews } from '@/lib/tariffRefundNews';

export const dynamic = 'force-dynamic';

export async function GET() {
    const stored = await getStoredNewsFeed();

    if (stored.items.length > 0) {
        return NextResponse.json(stored, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    }

    const refreshed = await refreshTariffRefundNews();

    return NextResponse.json(refreshed, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}