import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/card";
import { BarChart2, Calendar, Music } from "lucide-react";

import { ThemeImage } from "../theme-image";

const features = [
  {
    title: "Music Insights",
    description:
      "Discover your most played songs, artists, albums and analyze your music preferences.",
    icon: Music,
    component: (
      <ThemeImage
        darkSrc="/images/ranking-dark.png"
        lightSrc="/images/ranking-light.png"
        alt="Top songs, artists, albums"
        height={160 * 2}
        width={313 * 2}
        className="w-full"
      />
    ),
  },
  {
    title: "Listening History",
    description:
      "Visualize your listening history and track how your taste evolves over time.",
    icon: Calendar,
    component: (
      <ThemeImage
        darkSrc="/images/activity-dark.png"
        lightSrc="/images/activity-light.png"
        alt="Listening History"
        height={160 * 2}
        width={227 * 2}
        className="w-full"
      />
    ),
  },
  {
    title: "Advanced Statistics",
    description:
      "Dive deep into your listening patterns with advanced analytics and visualizations.",
    icon: BarChart2,
    component: (
      <ThemeImage
        darkSrc="/images/listening-habits-dark.png"
        lightSrc="/images/listening-habits-light.png"
        alt="Listening Habits"
        height={160 * 2}
        width={269 * 2}
        className="w-full"
      />
    ),
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Discover Harmony's Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col overflow-hidden w-full">
              <CardHeader className="pb-1">
                <feature.icon className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left grow">
                <h3 className="mb-1 text-lg font-semibold">{feature.title}</h3>
                <p className="leading-snug text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
              <CardFooter className="justify-end pb-0 pr-0">
                <div className="h-40 w-full rounded-tl-md bg-background overflow-hidden p-px">
                  {feature.component}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
