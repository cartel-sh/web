import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "空白",
  description: "to unite the universe.",
};

export default function Home() {
  return (
    <div className="flex flex-col gap-5 w-screen h-screen justify-center items-center text-center p-8">
      <h1 className="text-4xl">
        under construction,{" "}
        <b className="drop-shadow-glow">to unite the universe.</b>
      </h1>
    </div>
  );
}