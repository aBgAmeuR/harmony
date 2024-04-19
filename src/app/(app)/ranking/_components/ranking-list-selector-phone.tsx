import { Navigation, NavigationLink } from "@/components/ui/navigation";

type Props = {
  currentPath: string;
};

export const RankingListSelectorPhone = ({ currentPath }: Props) => {
  return (
    <header className="flex md:hidden bg-secondary z-10 sticky top-0 justify-center p-2 border-b border-secondary">
      <Navigation currentPath={currentPath} className="">
        <NavigationLink title="Tracks" path="/ranking/tracks" />
        <NavigationLink title="Albums" path="/ranking/albums" />
        <NavigationLink title="Artists" path="/ranking/artists" />
      </Navigation>
    </header>
  )
}
