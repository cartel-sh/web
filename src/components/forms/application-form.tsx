"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect, useSignMessage, useEnsName } from 'wagmi';
import { normalize } from 'viem/ens';
import { Turnstile } from '@marsidev/react-turnstile';

interface FormData {
  walletAddress: string;
  ensName?: string;
  github: string;
  farcaster: string;
  lens: string;
  twitter: string;
  excitement: string;
  motivation: string;
  signature?: string;
  captchaToken?: string;
}

interface FormErrors {
  wallet?: string;
  excitement?: string;
  motivation?: string;
}

export function ApplicationForm() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const { data: ensName } = useEnsName({
    address: address,
    chainId: 1,
  });

  const [formData, setFormData] = useState<FormData>({
    walletAddress: "",
    github: "",
    farcaster: "",
    lens: "",
    twitter: "",
    excitement: "",
    motivation: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (address) {
      setFormData(prev => ({
        ...prev,
        walletAddress: address,
        ensName: ensName || undefined,
      }));
    }
  }, [address, ensName]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isConnected || !address) {
      newErrors.wallet = "Please connect your wallet";
    }

    if (!formData.excitement.trim()) {
      newErrors.excitement = "Please tell us what excites you";
    } else if (formData.excitement.length < 20) {
      newErrors.excitement = "Please provide more detail (at least 20 characters)";
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = "Please explain why you're a good fit";
    } else if (formData.motivation.length > 500) {
      newErrors.motivation = "Please keep it under 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!address) {
      setErrors({ wallet: "Wallet not connected" });
      return;
    }

    if (!captchaToken) {
      setSubmitStatus("error");
      setSubmitMessage("Please complete the captcha verification");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const message = `I am applying to join the Indie Cartel.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

      const signature = await signMessageAsync({
        message,
      });

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          walletAddress: address,
          ensName: ensName || undefined,
          signature,
          message,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage("Application received. We may contact you in the near future.");
        setFormData({
          walletAddress: address,
          ensName: ensName || undefined,
          github: "",
          farcaster: "",
          lens: "",
          twitter: "",
          excitement: "",
          motivation: "",
        });
        setCaptchaToken(null);
      } else {
        setSubmitStatus("error");
        setSubmitMessage(data.error || "Failed to submit application. Please try again.");
      }
    } catch (error: any) {
      setSubmitStatus("error");
      if (error?.message?.includes("User rejected") || error?.message?.includes("User denied")) {
        setSubmitMessage("Signature cancelled. Please sign the message to submit your application.");
      } else {
        setSubmitMessage("Failed to sign message or submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Wallet Address *
        </label>
        {!mounted ? (
          <div className="h-10 w-full rounded-none border border-foreground/30 bg-card/50 animate-pulse" />
        ) : !isConnected ? (
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => connect({ connector: connectors[0] })}
              disabled={isConnecting}
              className="w-full rounded-none"
              variant="outline"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            {errors.wallet && (
              <p className="text-xs text-destructive">{errors.wallet}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-none border border-foreground/30 bg-card/50">
              <div>
                {ensName ? (
                  <>
                    <p className="text-sm font-medium">{ensName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => disconnect()}
                size="sm"
                variant="ghost"
                className="rounded-none"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="github" className="block text-sm font-medium">
          GitHub (Optional)
        </label>
        <Input
          id="github"
          name="github"
          value={formData.github}
          onChange={handleChange("github")}
          placeholder="username"
          className="bg-transparent"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Social Profiles (What applies)</h3>

        <div className="space-y-2">
          <label htmlFor="farcaster" className="block text-xs text-muted-foreground">
            Farcaster
          </label>
          <Input
            id="farcaster"
            name="farcaster"
            value={formData.farcaster}
            onChange={handleChange("farcaster")}
            placeholder="username"
            className="bg-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lens" className="block text-xs text-muted-foreground">
            Lens
          </label>
          <Input
            id="lens"
            name="lens"
            value={formData.lens}
            onChange={handleChange("lens")}
            placeholder="username"
            className="bg-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="twitter" className="block text-xs text-muted-foreground">
            Twitter / X
          </label>
          <Input
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange("twitter")}
            placeholder="username"
            className="bg-transparent"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="excitement" className="block text-sm font-medium">
          What excites you the most in life? *
        </label>
        <Textarea
          id="excitement"
          name="excitement"
          value={formData.excitement}
          onChange={handleChange("excitement")}
          error={!!errors.excitement}
          errorMessage={errors.excitement}
          disabled={isSubmitting}
          className="min-h-[100px] bg-transparent"
          placeholder="Share a story or theme that lights you up. Be specific."
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="motivation" className="block text-sm font-medium">
          Why do you think you're a good fit for the cartel? *
        </label>
        <Textarea
          id="motivation"
          name="motivation"
          value={formData.motivation}
          onChange={handleChange("motivation")}
          error={!!errors.motivation}
          errorMessage={errors.motivation}
          disabled={isSubmitting}
          className="min-h-[80px] bg-transparent"
          maxLength={500}
          placeholder="What can you contribute to the Cartel? What do you hope to gain?"
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.motivation.length}/500 characters
        </p>
      </div>

      {submitStatus !== "idle" && (
        <div
          className={cn(
            "p-4 rounded-md text-sm",
            submitStatus === "success"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {submitMessage}
        </div>
      )}

      {mounted && isConnected && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            options={{
              theme: 'auto',
              size: 'normal',
            }}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={!mounted || isSubmitting || !isConnected}
        className="w-full rounded-none"
        variant="default"
      >
        {isSubmitting ? "Signing & Submitting..." : "Submit Application"}
      </Button>

      {mounted && isConnected && (
        <p className="text-xs text-center text-muted-foreground">
          You will be asked to sign a message to verify wallet ownership
        </p>
      )}
    </form>
  );
}