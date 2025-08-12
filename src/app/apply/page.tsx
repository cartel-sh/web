import { ApplicationForm } from "@/components/forms/application-form";
import { Web3Provider } from "@/components/providers/web3-provider";

export default function ApplyPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen p-8 md:p-16 relative">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card/50 backdrop-blur-sm border border-foreground/30 rounded-none p-8 md:p-12">
            <div className="mb-8 text-center">
              <h2 className="mb-4 font-[family-name:var(--font-tangerine)] text-5xl md:text-7xl">Application Letter</h2>
            </div>

            <div className="text-left">
              <ApplicationForm />
            </div>
          </div>
        </div>
      </div>
    </Web3Provider>
  );
}