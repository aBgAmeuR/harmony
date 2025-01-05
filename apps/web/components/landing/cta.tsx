import Balancer from "react-wrap-balancer";
import { buttonVariants } from "@repo/ui/button";
import { Card, CardContent, CardFooter } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

import { GetDemoBtn } from "../get-demo-btn";
import { Icons } from "../icons";

export const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 animate-appear opacity-0 delay-1000">
      <Card className="max-w-screen-xl mx-auto p-8 lg:p-16">
        <CardContent className="text-center grow">
          <h2 className="text-3xl font-bold mb-2">
            Unlock Your Musical Journey
          </h2>
          <h3 className="text-xl text-muted-foreground mb-0">
            <Balancer>
              Discover insights about your listening habits, favorite artists,
              and musical evolution. Let Harmony bring your Spotify data to
              life.
            </Balancer>
          </h3>
        </CardContent>
        <CardFooter className="flex justify-center pb-0">
          <Link
            href="/overview"
            className={cn(buttonVariants({ size: "lg" }))}
            aria-label="Get Started"
            data-testid="get-started-btn"
          >
            <Icons.spotify />
            Get Started for Free
          </Link>
          <GetDemoBtn label="Get a demo ->" className="w-fit" variant="link" />
        </CardFooter>
      </Card>
    </section>
  );
};
