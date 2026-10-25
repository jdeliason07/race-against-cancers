import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  EVENT_DATE_DISPLAY, BENEFICIARY_NAME, BENEFICIARY_FIRST_NAME, BENEFICIARY_DESCRIPTION,
  RECOMMENDED_DONATION_AMOUNT, RECOMMENDED_DONATION_5K, RECOMMENDED_DONATION_FUN_RUN,
} from '@/config/site';
import { BROOKS_SHARE_PHOTO, BROOKS_TAGLINE } from '@/data/brooks';

export const alt = `Run for ${BENEFICIARY_FIRST_NAME} — ${BENEFICIARY_NAME}, ${BENEFICIARY_DESCRIPTION}. Race Against Cancers 2026: 10K, 5K & 1-Mile Walk at Riverview Park, Provo, ${EVENT_DATE_DISPLAY}. Suggested donations: 10K $${RECOMMENDED_DONATION_AMOUNT}, 5K $${RECOMMENDED_DONATION_5K} & 1-Mile Walk $${RECOMMENDED_DONATION_FUN_RUN}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [antonFont, photo] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Anton-Regular.ttf')),
    readFile(join(process.cwd(), 'public/images/brooks', BROOKS_SHARE_PHOTO)),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFF6FA',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '56px 72px',
        }}
      >
        {/* The words */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '640px' }}>
          {/* RACE AGAINST CANCERS */}
          <div style={{ display: 'flex', flexDirection: 'row', lineHeight: 1 }}>
            <span style={{ fontFamily: 'Anton', fontSize: '40px', color: '#1C1719' }}>RACE</span>
            <span style={{ fontFamily: 'Anton', fontSize: '40px', color: '#F0307A' }}>AGAINST</span>
            <span style={{ fontFamily: 'Anton', fontSize: '40px', color: '#1C1719' }}>CANCERS</span>
          </div>

          {/* The ask, as big as it will go */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '22px', lineHeight: 0.92 }}>
            <span style={{ fontFamily: 'Anton', fontSize: '148px', color: '#1C1719' }}>RUN FOR</span>
            <span style={{ fontFamily: 'Anton', fontSize: '148px', color: '#F0307A' }}>
              {BENEFICIARY_FIRST_NAME.toUpperCase()}
            </span>
          </div>

          {/* Who he is */}
          <div style={{ display: 'flex', marginTop: '26px', fontFamily: 'sans-serif', fontSize: '30px', color: '#1C1719' }}>
            {`${BENEFICIARY_NAME}, ${BENEFICIARY_DESCRIPTION}.`}
          </div>

          {/* Date & distance */}
          <div style={{ display: 'flex', marginTop: '18px', fontFamily: 'sans-serif', fontSize: '22px', color: '#6E5C64', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            10K, 5K &amp; 1-Mile Walk · {EVENT_DATE_DISPLAY}
          </div>

          {/* Entry donations — the shorter races' numbers get missed, so they go on the share card */}
          <div style={{ display: 'flex', marginTop: '10px', fontFamily: 'sans-serif', fontSize: '20px', color: '#6E5C64' }}>
            {`Suggested donations: 10K $${RECOMMENDED_DONATION_AMOUNT} · 5K $${RECOMMENDED_DONATION_5K} · 1-Mile Walk $${RECOMMENDED_DONATION_FUN_RUN}`}
          </div>
        </div>

        {/* His photo, as a taped-up polaroid like the ones on the site */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#FFFFFF',
            padding: '14px 14px 18px',
            borderRadius: '6px',
            boxShadow: '0 18px 40px -14px rgba(28,23,25,0.45)',
            transform: 'rotate(3deg)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', position: 'absolute', top: '-14px', left: '120px', width: '96px', height: '28px', background: 'rgba(248,180,208,0.8)', transform: 'rotate(-4deg)' }} />
          <img src={photoSrc} width={330} height={440} style={{ objectFit: 'cover', borderRadius: '2px' }} alt="" />
          <div style={{ display: 'flex', marginTop: '12px', fontFamily: 'Anton', fontSize: '28px', color: '#F0307A' }}>
            {BROOKS_TAGLINE.toUpperCase()}
          </div>
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
