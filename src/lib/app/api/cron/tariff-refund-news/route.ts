import { NextRequest, NextResponse } from 'next/server';
import { refreshTariffRefundNews } from '@/lib/tariffRefundNews';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const expected = process.env.CRON_SECRET;

    if (!expected || secret !== expected) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const feed = await refreshTariffRefundNews();

        return NextResponse.json({
            ok: true,
            refreshedAt: feed.lastUpdated,
            count: feed.items.length,
        });
    } catch (error) {
        console.error('Cron refresh failed', error);

        return NextResponse.json(
            { ok: false, error: 'Refresh failed' },
            { status: 500 }
        );
    }
}