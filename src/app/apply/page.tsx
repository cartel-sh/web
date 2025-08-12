import { ApplicationForm } from "@/components/forms/application-form";
import { BackgroundFlower } from "@/components/ui/background-flower";
import { Web3Provider } from "@/components/providers/web3-provider";

export default function ApplyPage() {
  return (
    <Web3Provider>
      <>
        <BackgroundFlower flowerNumber={1} rotation={15} className="top-20 left-10" size={180} />
        <BackgroundFlower flowerNumber={6} rotation={-45} className="top-1/3 right-20" size={160} />
        <BackgroundFlower flowerNumber={3} rotation={30} className="bottom-20 left-1/4" size={140} />
        <BackgroundFlower flowerNumber={8} rotation={-20} className="bottom-1/3 right-1/3" size={150} />
        <main className="min-h-screen p-8 md:p-16 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Join the Cartel
            </h1>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-foreground/30 rounded-lg p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Application Form</h2>
              <p className="text-muted-foreground">
                Tell us about yourself and why you want to join our collective of indie builders.
                We're looking for passionate developers, designers, and creators who align with our mission.
              </p>
            </div>

            <ApplicationForm />
          </div>
        </div>
        </main>
      </>
    </Web3Provider>
  );
}