import { Tangerine } from "next/font/google";

const tangerine = Tangerine({ subsets: ["latin"], weight: "400" });

export function SiteFooter() {
  return (
    <footer className="py-3 border-t text-center">
      <p className={`${tangerine.className} text-xl text-foreground/60`}>
        <span className="font-black">© Cartel {new Date().getFullYear()}</span>
        <span className={`italic text-3xl ml-2`}>
          Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.
        </span>
      </p>
    </footer>
  );
}
