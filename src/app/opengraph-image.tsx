import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  EVENT_DATE_DISPLAY, CHARITY_NAME, RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_FUN_RUN,
} from '@/config/site';

export const alt = `Race Against Cancers 2026 — 5 Miler $${RECOMMENDED_DONATION_AMOUNT} & Family Fun Run $${RECOMMENDED_DONATION_FUN_RUN} · Benefiting Intermountain Cancer Center Utah Valley`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const antonFont = await readFile(join(process.cwd(), 'public/fonts/Anton-Regular.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Pink accent bar */}
        <div style={{ display: 'flex', width: '80px', height: '6px', background: '#F0307A', marginBottom: '48px', borderRadius: '999px' }} />

        {/* RACE AGAINST CANCERS */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0px', lineHeight: 1 }}>
          <span style={{ fontFamily: 'Anton', fontSize: '96px', color: '#1C1719', letterSpacing: '-0.01em' }}>RACE</span>
          <span style={{ fontFamily: 'Anton', fontSize: '96px', color: '#F0307A', letterSpacing: '-0.01em' }}>AGAINST</span>
          <span style={{ fontFamily: 'Anton', fontSize: '96px', color: '#1C1719', letterSpacing: '-0.01em' }}>CANCERS</span>
        </div>

        {/* Date & distance */}
        <div style={{ display: 'flex', marginTop: '28px', fontFamily: 'sans-serif', fontSize: '26px', color: '#6E5C64', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          5 Miler &amp; Fun Run · {EVENT_DATE_DISPLAY}
        </div>

        {/* Entry donations — the Fun Run number gets missed, so it goes on the share card */}
        <div style={{ display: 'flex', marginTop: '18px', fontFamily: 'sans-serif', fontSize: '22px', color: '#1C1719' }}>
          5 Miler ${RECOMMENDED_DONATION_AMOUNT} · Family Fun Run ${RECOMMENDED_DONATION_FUN_RUN}
        </div>

        {/* Charity */}
        <div style={{ display: 'flex', marginTop: '18px', fontFamily: 'sans-serif', fontSize: '18px', color: '#F0307A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Benefiting {CHARITY_NAME}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Anton',
          data: antonFont,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
