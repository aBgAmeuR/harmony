import { Title } from "@mantine/core";
import { Logo } from "./logo";
import { Navigation, NavigationButton, NavigationLink } from "./ui/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BarChart, ChevronLeft, PieChart, Settings, TrendingUp } from "lucide-react";
import { BackBtn } from "./ui/back-btn";

type Props = {
  currentPath: string;
  showSecondaryNav?: boolean;
  redirect?: string;
};

export const MainNavigation = (props: Props) => {
  return (
    <header className="bg-secondary z-10 sticky top-0">
      <div className="border-b border-secondary">
        <div className="px-4 h-16 mx-auto w-full max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Logo className="size-8 mx-2" />
            <Title order={2}>Harmony</Title>
          </div>
          <Navigation currentPath={props.currentPath}>
            <NavigationLink title="Overview" path="/overview" icon={<PieChart size={20} />} />
            <NavigationLink title="Ranking" path="/ranking" fakePath="/ranking/tracks" icon={<TrendingUp size={20} />} />
            <NavigationLink title="Stats" path="/stats" icon={<BarChart size={20} />} />
            <NavigationLink title="Settings" path="/settings" icon={<Settings size={20} />} />
          </Navigation>
        </div>
      </div>
      {props.showSecondaryNav ? (
        <div className="border-b border-secondary">
          <nav className={cn("px-4 h-16 mx-auto w-full max-w-4xl flex items-center justify-center", props.currentPath.includes('/ranking') ? 'justify-between' : null)}>
            {props.redirect ? (
              <BackBtn>
                <ChevronLeft />
                <p>Back</p>
              </BackBtn>
            ) : null}
            {!props.redirect && props.currentPath.includes('/ranking') ? (
              <Navigation currentPath={props.currentPath}>
                <NavigationLink title="Tracks" path="/ranking/tracks" />
                <NavigationLink title="Albums" path="/ranking/albums" />
                <NavigationLink title="Artists" path="/ranking/artists" />
              </Navigation>
            ) : null}
            <Navigation>
              <NavigationButton title="6 months" value="6months" />
              <NavigationButton title="Year" value="1year" />
              <NavigationButton title="Lifetime" value="alltime" />
            </Navigation>
          </nav>
        </div>
      ) : null
      }
    </header >
  )
}
