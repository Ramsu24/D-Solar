import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'D-Solar - Powering Filipino Energy Independence';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #f97316 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Sun circle decoration */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '80px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, #f97316 100%)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            D-Solar
          </h1>
          <div
            style={{
              width: '100px',
              height: '4px',
              background: '#f97316',
              display: 'flex',
            }}
          />
          <p
            style={{
              fontSize: '28px',
              color: '#e2e8f0',
              margin: 0,
              textAlign: 'center',
              maxWidth: '700px',
            }}
          >
            Powering Filipino Energy Independence
          </p>
          <p
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Solar Design • Installation • Financing • 25-Year Warranty
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
            d-solar.asia
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
