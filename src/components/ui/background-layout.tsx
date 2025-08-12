"use client";

import { BackgroundFlower } from "./background-flower";

export function BackgroundLayout() {
  return (
    <>
      {/* Paper texture layer: above base color, below flowers */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-35 z-0"
        style={{
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />

      {/* Background flowers sorted by vertical position (top to bottom) */}

      {/* Top section (top-10 to top-20) */}
      <BackgroundFlower flowerNumber={1} rotation={15} className="top-20 left-10" size={180} />
      <BackgroundFlower flowerNumber={11} rotation={20} className="top-10 left-1/2" size={150} />
      <BackgroundFlower flowerNumber={6} rotation={75} className="top-[12%] left-[16%]" size={140} />
      <BackgroundFlower flowerNumber={4} rotation={25} className="top-[15%] left-[80%]" size={190} />
      <BackgroundFlower flowerNumber={2} rotation={-30} className="top-20 right-20" size={160} />

      {/* Upper-middle section (top-1/4 to top-1/3) */}
      <BackgroundFlower flowerNumber={1} rotation={-40} className="top-1/4 right-10" size={160} />
      <BackgroundFlower flowerNumber={7} rotation={-35} className="top-[25%] left-[40%]" size={195} />
      <BackgroundFlower flowerNumber={7} rotation={30} className="top-1/3 left-1/4" size={110} />
      <BackgroundFlower flowerNumber={3} rotation={-10} className="top-1/3 right-1/3" size={165} />
      <BackgroundFlower flowerNumber={12} rotation={65} className="top-[35%] right-[15%]" size={198} />

      {/* Middle section (top-40 to top-1/2) */}
      <BackgroundFlower flowerNumber={9} rotation={-70} className="top-[45%] right-[60%]" size={115} />
      <BackgroundFlower flowerNumber={5} rotation={60} className="top-1/2 left-10" size={120} />
      <BackgroundFlower flowerNumber={6} rotation={-45} className="top-1/2 right-10" size={130} />

      {/* Lower-middle section (top-[60%] to top-2/3) */}
      <BackgroundFlower flowerNumber={5} rotation={-55} className="top-[60%] left-[20%]" size={100} />
      <BackgroundFlower flowerNumber={8} rotation={-60} className="top-2/3 right-1/4" size={125} />
      <BackgroundFlower flowerNumber={11} rotation={-25} className="top-[70%] left-[65%]" size={92} />

      {/* Bottom section (top-[80%] to bottom) */}
      <BackgroundFlower flowerNumber={6} rotation={80} className="top-[80%] right-[40%]" size={185} />
      <BackgroundFlower flowerNumber={3} rotation={45} className="bottom-10 left-20" size={170} />
      <BackgroundFlower flowerNumber={12} rotation={-20} className="bottom-10 left-1/2" size={180} />
      <BackgroundFlower flowerNumber={10} rotation={10} className="bottom-[15%] left-[35%]" size={188} />
      <BackgroundFlower flowerNumber={4} rotation={-15} className="bottom-20 right-10" size={190} />
      <BackgroundFlower flowerNumber={2} rotation={50} className="bottom-1/4 left-10" size={175} />
      <BackgroundFlower flowerNumber={8} rotation={40} className="bottom-[30%] right-[25%]" size={115} />
      <BackgroundFlower flowerNumber={10} rotation={-75} className="bottom-40 right-1/3" size={145} />
    </>
  );
}
