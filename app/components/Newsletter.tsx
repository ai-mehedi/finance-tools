import { Mail } from "lucide-react";
import SubscribeForm from "./SubscribeForm";

type NewsletterProps = {
  heading?: string;
  subtitle?: string;
  variant?: "orange" | "soft";
};

export default function Newsletter({
  heading = "Get Weekly Money Tips & Updates",
  subtitle = "Subscribe to our newsletter and get the best financial tips, tools and guides straight to your inbox.",
  variant = "orange",
}: NewsletterProps) {
  const soft = variant === "soft";

  return (
    <section data-embed-hide className={`w-full ${soft ? "bg-white" : "bg-gradient-to-r from-orange-400 to-orange-600"}`}>
      <div className={`mx-auto container px-6 ${soft ? "py-6" : "py-8"}`}>
        <div
          className={`flex flex-col items-center gap-6 lg:flex-row lg:justify-between ${
            soft ? "rounded-2xl bg-gradient-to-r from-orange-100 to-orange-50 px-6 py-7 sm:px-10" : ""
          }`}
        >
          <div className="flex items-center gap-4 text-center lg:text-left">
            <span className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:flex ${soft ? "bg-orange-100 text-orange-500" : "bg-white/20 text-white"}`}>
              <Mail className="size-6" />
            </span>
            <div>
              <h2 className={`text-xl font-extrabold sm:text-2xl ${soft ? "text-zinc-900" : "text-white"}`}>
                {heading}
              </h2>
              <p className={`mt-1 max-w-md text-sm ${soft ? "text-zinc-600" : "text-white/85"}`}>
                {subtitle}
              </p>
            </div>
          </div>

          <SubscribeForm soft={soft} source="newsletter" />
        </div>
      </div>
    </section>
  );
}
