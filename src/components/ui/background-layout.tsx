"use client";

export function BackgroundLayout() {
  const squareTilesSvg = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" fill="none"/>
      <rect x="6" y="6" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
    </svg>
  `)}`;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none opacity-35 z-0"
      style={{
        backgroundImage: `url("${squareTilesSvg}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '16px 16px',
        backgroundPosition: 'top left',
      }}
    />
  );
}
