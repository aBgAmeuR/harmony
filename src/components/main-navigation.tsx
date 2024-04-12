import { Title } from "@mantine/core";
import { Logo } from "./logo";
import { Navigation, NavigationButton, NavigationLink } from "./ui/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
            <NavigationLink title="Overview" path="/overview" />
            <NavigationLink title="Ranking" path="/ranking" fakePath="/ranking/tracks" />
            <NavigationLink title="Stats" path="/stats" />
            <NavigationLink title="Settings" path="/settings" />
          </Navigation>
        </div>
      </div>
      {props.showSecondaryNav ? (
        <div className="border-b border-secondary">
          <nav className={cn("px-4 h-16 mx-auto w-full max-w-4xl flex items-center justify-center", props.currentPath.includes('/ranking') ? 'justify-between' : null)}>
            {props.redirect ? (
              <Link href={props.redirect} className="cursor-pointer py-2 pl-1 pr-3 flex items-center gap-2 rounded-lg hover:bg-tertiary">
                <ChevronLeft />
                <p>Back</p>
              </Link>
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
