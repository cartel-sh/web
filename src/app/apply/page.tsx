import { ApplicationForm } from "@/components/forms/application-form";
import { Web3Provider } from "@/components/providers/web3-provider";

export default function ApplyPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-16 relative">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card/50 backdrop-blur-sm border border-foreground/30 rounded-none p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="mb-3 sm:mb-4 font-[family-name:var(--font-italianno)]" style={{
                fontSize: 'clamp(2.5rem, 7vw, 4.5rem)'
              }}>Application Letter</h2>
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