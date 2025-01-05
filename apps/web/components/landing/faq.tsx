import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Accordion, AccordionContent, AccordionItem } from "@repo/ui/accordion";
import { Music, Plus, RefreshCw, Share2, Shield, Zap } from "lucide-react";

const items = [
  {
    id: "1",
    icon: Music,
    title: "How does Harmony access my Spotify data?",
    content:
      "Harmony uses the official Spotify Web API and the Spotify data package that users upload. We only request the permissions you explicitly grant, and we never store your personal information except your package that you provided to us.",
  },
  {
    id: "2",
    icon: Shield,
    title: "Is my data safe with Harmony?",
    content:
      "Absolutely. We take privacy very seriously. Harmony only accesses the Spotify data you explicitly grant permission for and does not store any personal information.",
  },
  {
    id: "3",
    icon: Zap,
    title: "Can I use Harmony if I don't have a Spotify Premium account?",
    content:
      "Yes, Harmony works seamlessly with both Spotify Free and Premium accounts. There are no restrictions on using the app regardless of your account type.",
  },
  {
    id: "4",
    icon: RefreshCw,
    title: "How often is my data updated?",
    content:
      "Harmony fetches the latest Spotify data every 30 minutes via the Spotify Web API. Additionally, you can upload your Spotify data package once a day for even more detailed insights.",
  },
  {
    id: "5",
    icon: Share2,
    title: "Can I share my Harmony insights with friends?",
    content:
      "Currently, Harmony doesn't have a built-in sharing feature. However, you can take screenshots of your insights to share with friends. We're exploring the possibility of adding a sharing feature in future updates!",
  },
];

export function FAQ() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12 animate-appear opacity-0 delay-500">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full animate-appear opacity-0 delay-700"
          defaultValue="3"
        >
          {items.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="py-2">
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-2 text-left text-sm sm:text-base md:text-[15px] font-semibold leading-6 transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180">
                  <span className="flex items-center gap-3">
                    <item.icon
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 opacity-60"
                      aria-hidden="true"
                    />
                    <span>{item.title}</span>
                  </span>
                  <Plus
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 opacity-60 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent className="pb-2 ps-7 text-sm sm:text-base text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
