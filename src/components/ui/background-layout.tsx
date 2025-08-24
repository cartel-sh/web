"use client";

export function BackgroundLayout() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none opacity-35 z-0"
      style={{
        backgroundImage: 'url(/images/paper_texture.webp)',
        backgroundRepeat: 'repeat',
        backgroundSize: '512px 512px',
        backgroundPosition: 'top left',
      }}
    />
  );
}
