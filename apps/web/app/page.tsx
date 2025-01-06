import { CTASection } from "~/components/landing/cta";
import { Demo } from "~/components/landing/demo";
import { FAQ } from "~/components/landing/faq";
import { Features } from "~/components/landing/features";
import { Footer } from "~/components/landing/footer";
import { Hero } from "~/components/landing/hero";
import { Navbar } from "~/components/landing/navbar";

export default async function HomePage() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />
      <Hero />
      <Demo />
      <Features />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
