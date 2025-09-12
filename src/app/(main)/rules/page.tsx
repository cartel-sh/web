export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-background rounded-lg border p-8">
        <h1 className="text-3xl font-bold mb-6">Community Guidelines</h1>

        <p className="text-muted-foreground mb-6">
          The Cartel community is strong because its members share a set of common values such as integrity, respect and accountability. We believe these are critical traits for founders to have. The continuing strength and value of this network hinges on the trustworthiness of its members. Founders who behave unethically put the reputation of the entire community at risk.
        </p>

        <p className="mb-4 font-semibold">Some examples of ethical behavior we expect from Cartel members are:</p>

        <ul className="space-y-3 list-disc list-inside text-muted-foreground">
          <li>Treating co-founders, members and employees with fairness and respect.</li>
          <li>Not using misleading, dishonest or illegal sales tactics.</li>
          <li>Not spamming members of the community, or shilling in any manner for funds, investors, consultants/advisors, events/conferences, politicians/campaigns, tokens/NFTs, content marketing or similar.</li>
          <li>Not engaging in any illegal activity.</li>
          <li>Being honest with investors and partners.</li>
          <li>Not harassing or threatening any co-founder, Cartel community member, employee, or anyone else.</li>
          <li>Keeping off-the-record or confidential information (whether about Cartel itself or a Cartel-affiliated company) private and secret.</li>
          <li>Ensuring your company resolves privacy and security issues promptly and appropriately.</li>
          <li>Treating emails and other communications shared within the Cartel network as confidential, and not forwarding to non-Cartel founders, investors, or the press.</li>
          <li>Not behaving in a way that damages the reputation of his/her company or of the Cartel.</li>
          <li>Being honest in the Cartel application process.</li>
          <li>Keeping your word, including honoring handshake deals, contractual obligations and the like.</li>
          <li>Generally operating in good faith and behaving in a professional and upstanding way.</li>
        </ul>

        <div className="mt-8 pt-6 border-t">
          <p className="text-muted-foreground">
            To maintain our community, if we determine (in our sole discretion) that a member has behaved unethically in our outside of the Cartel, we will revoke their Cartel member status.
            This includes access to all Cartel spaces, software, lists and events.
            All members in a company may be held responsible for the unethical actions of a single co-founder or a company employee, depending on the circumstances.
          </p>

          <p className="mt-4 font-semibold">
            We will stand behind you no matter how much you struggle, as long as you behave ethically.
          </p>
        </div>
      </div>
    </div>
  );
}