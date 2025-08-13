"use client";

export function BackgroundLayout() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-35 z-0"
        style={{
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />
    </>
  );
}
