import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [
		{ title: "空白" },
		{ name: "description", content: "to unite the universe." },
	];
};

export default function Index() {
	return (
		<div className="flex flex-col gap-5 w-screen h-screen justify-center items-center text-center p-8">
			<h1 className="text-4xl">
				under construction,{" "}
				<b className="drop-shadow-glow">to unite the universe.</b>
			</h1>
		</div>
	);
}
