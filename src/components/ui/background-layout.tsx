"use client";

export function BackgroundLayout() {
  return (
    <>
      {/* Mobile: single background covering full viewport */}
      <div
        aria-hidden="true"
        className="md:hidden fixed inset-0 pointer-events-none opacity-35 z-0"
        style={{
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />

      {/* Desktop (md+): split backgrounds to avoid gaps and double overlays */}
      {/* Left/content region: from left edge to sidebar edge */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-y-0 left-0 pointer-events-none opacity-35 z-0"
        style={{
          right: '16rem',
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />
      {/* Sidebar region: fixed width strip on the right */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-y-0 right-0 pointer-events-none opacity-35 z-0"
        style={{
          width: '16rem',
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />
    </>
  );
}
