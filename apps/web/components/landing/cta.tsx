import Balancer from "react-wrap-balancer";
import { Card, CardContent, CardFooter } from "@repo/ui/card";

import { GetDemoBtn } from "../get-demo-btn";
import { GetStartedBtn } from "./get-started-btn";

export const CTASection = () => {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

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
          <GetStartedBtn size="lg">Get Started for Free</GetStartedBtn>
          {!isMaintenance ? (
            <GetDemoBtn
              label="Get a demo ->"
              className="w-fit"
              variant="link"
            />
          ) : null}
        </CardFooter>
      </Card>
    </section>
  );
};
