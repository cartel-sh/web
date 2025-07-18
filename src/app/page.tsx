import type { Metadata } from "next";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { BackgroundFlower } from "@/components/ui/background-flower";
import { RollingText } from "@/components/animate-ui/text/rolling";

export const metadata: Metadata = {
  title: "Cartel",
  description: "Accelerating decentralized social",
};

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
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

      <Navigation />

      <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">
        <header className="mb-20 pt-20 flex justify-center">
          <div className="flex items-center gap-8 mb-6">
            <Image
              src="/images/skull.png"
              alt="Skull"
              width={300}
              height={300}
              className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 -m-10"
            />
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl  font-bold">
                <RollingText
                  text="Indie Cartel"
                />
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-muted-foreground mt-2">
                Accelerating decentralized social
              </p>
            </div>
          </div>
        </header>

        <section id="manifesto" className="mb-20 text-center">
          {/* <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Manifesto</h2> */}
          <div className="max-w-3xl mx-auto">
            <div className="border rounded-lg p-8 md:p-10 lg:p-12 border-foreground/30 transition-colors bg-card/50">
              <div className="prose prose-invert prose-lg max-w-none text-foreground/60 font-bold text-left">
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  We reject the hyper-individualism. Instead, we build infra grounded in togetherness,
                  where cryptographic tools foster connection rather than alienation.
                </p>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  Technology alone cannot heal broken trust, but technology built with right ethics and care can create the conditions for healing.
                </p>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  We reimagine cryptographic tools as instruments of communion, not alienation.
                </p>
                <p className="text-lg md:text-xl leading-relaxed">
                  The future of social is built with care for all.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="border rounded-lg p-6 border-foreground/30 transition-colors bg-card/50">
              <h3 className="text-xl font-semibold mb-2">Project Alpha</h3>
              <p className="text-muted-foreground mb-4">
                Decentralized identity management system for cross-platform social interactions.
              </p>
              <a href="#" className="text-primary hover:underline">Learn more →</a>
            </div>
            <div className="border rounded-lg p-6 border-foreground/30 transition-colors bg-card/50">
              <h3 className="text-xl font-semibold mb-2">Project Beta</h3>
              <p className="text-muted-foreground mb-4">
                Open protocol for content monetization without intermediaries.
              </p>
              <a href="#" className="text-primary hover:underline">Learn more →</a>
            </div>
            <div className="border rounded-lg p-6 border-foreground/30 transition-colors bg-card/50">
              <h3 className="text-xl font-semibold mb-2">Project Gamma</h3>
              <p className="text-muted-foreground mb-4">
                Decentralized graph database for social connections and interactions.
              </p>
              <a href="#" className="text-primary hover:underline">Learn more →</a>
            </div>
          </div>
        </section>

        <section id="members" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Public Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full mx-auto mb-3"></div>
              <h4 className="font-semibold">Member 1</h4>
              <p className="text-sm text-muted-foreground">@handle</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full mx-auto mb-3"></div>
              <h4 className="font-semibold">Member 2</h4>
              <p className="text-sm text-muted-foreground">@handle</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full mx-auto mb-3"></div>
              <h4 className="font-semibold">Member 3</h4>
              <p className="text-sm text-muted-foreground">@handle</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full mx-auto mb-3"></div>
              <h4 className="font-semibold">Member 4</h4>
              <p className="text-sm text-muted-foreground">@handle</p>
            </div>
          </div>
        </section>

        <section id="aligned-communities" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Aligned Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mx-auto max-w-4xl">
            <div className="border rounded-lg p-6 border-foreground/30 transition-colors bg-card/50">
              <h3 className="text-xl font-semibold mb-2">Sapphirepunk</h3>
              <p className="text-muted-foreground mb-4">
                Reimagining technology with ethics, justice, and care. Building cryptographic tools that
                foster connection over alienation, commons over bunkers.
              </p>
              <a href="https://sapphirepunk.com" className="text-primary hover:underline">Learn more →</a>
            </div>
          </div>
        </section>

        <section id="apply" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Apply</h2>
          <div className="max-w-lg mx-auto">
            <div className="border-2 border-dashed border-foreground/30 rounded-lg p-12 bg-card/50">
              <p className="text-xl text-muted-foreground mb-4">Application process coming soon</p>
            </div>
          </div>
        </section>

        <footer className="py-6 border-t text-center">
          <p className="text-sm text-foreground/60">
            <span className="font-bold">© Cartel {new Date().getFullYear()}</span>
            <span className="italic ml-2">
              Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}