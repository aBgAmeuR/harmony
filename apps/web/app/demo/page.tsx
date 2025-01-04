import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";

import { AppHeader } from "~/components/app-header";
import { AppSidebar } from "~/components/navbar/app-sidebar";
import { SelectMonthRange } from "~/components/select-month-range";

import { ListeningPatternChart } from "../(app)/overview/listening-pattern-chart";
import { RankingList } from "../(app)/overview/ranking-list";
import { TopStatsCards } from "../(app)/overview/top-stats-cards";
import { TimeListenedChart } from "../(app)/stats/activity/time-listened-chart";

const data = {
  topStats: {
    listeningTime: 3652663873,
    totalPlays: 24302,
    totalPlaysPerDay: 66,
    uniqueArtists: 1829,
    mostActiveDay: {
      day: new Date("2024-08-16T01:52:18.000Z"),
      timePlayed: 710463,
      totalPlayed: 1,
    },
  },
  timeListened: {
    data: [
      { month: "Jan 2024", value: 350634325 },
      { month: "Feb 2024", value: 321876164 },
      { month: "Mar 2024", value: 364861887 },
      { month: "Apr 2024", value: 484255334 },
      { month: "May 2024", value: 433569500 },
      { month: "Jun 2024", value: 397732234 },
      { month: "Jul 2024", value: 336989449 },
      { month: "Aug 2024", value: 537931204 },
      { month: "Sep 2024", value: 282726789 },
      { month: "Oct 2024", value: 142086987 },
    ],
    average: 365266387,
  },
  listeningPattern: [
    { subject: "Morning", time: 809791883 },
    { subject: "Noon", time: 519416664 },
    { subject: "Afternoon", time: 1237612123 },
    { subject: "Early Evening", time: 490317013 },
    { subject: "Late Evening", time: 544522845 },
    { subject: "Night", time: 51003345 },
  ],
  topArtists: [
    {
      id: "699OTQXzgjhIYAHMy9RyPD",
      href: "https://open.spotify.com/artist/699OTQXzgjhIYAHMy9RyPD",
      image: "https://i.scdn.co/image/ab6761610000e5ebba50ca67ffc3097f6ea1710a",
      name: "Playboi Carti",
      stat1: "10871.42 minutes",
      stat2: "4136 streams",
    },
    {
      id: "0Y5tJX1MQlPlqiwlOH1tJY",
      href: "https://open.spotify.com/artist/0Y5tJX1MQlPlqiwlOH1tJY",
      image: "https://i.scdn.co/image/ab6761610000e5eb19c2790744c792d05570bb71",
      name: "Travis Scott",
      stat1: "6367.38 minutes",
      stat2: "1927 streams",
    },
    {
      id: "4O15NlyKLIASxsJ0PrXPfz",
      href: "https://open.spotify.com/artist/4O15NlyKLIASxsJ0PrXPfz",
      image: "https://i.scdn.co/image/ab6761610000e5eba8ce348f34f18241d3249fa9",
      name: "Lil Uzi Vert",
      stat1: "4245.27 minutes",
      stat2: "1415 streams",
    },
    {
      id: "5K4W6rqBFWDnAN6FQUkS6x",
      href: "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x",
      image: "https://i.scdn.co/image/ab6761610000e5eb6e835a500e791bf9c27a422a",
      name: "Kanye West",
      stat1: "4222.42 minutes",
      stat2: "1390 streams",
    },
    {
      id: "3gBZUcNeVumkeeJ19CY2sX",
      href: "https://open.spotify.com/artist/3gBZUcNeVumkeeJ19CY2sX",
      image: "https://i.scdn.co/image/ab6761610000e5eb95ccca370d8bd50e84c222bc",
      name: "Ken Carson",
      stat1: "3752.29 minutes",
      stat2: "1614 streams",
    },
  ],
  topTracks: [
    {
      id: "3w0w2T288dec0mgeZZqoNN",
      href: "https://open.spotify.com/track/3w0w2T288dec0mgeZZqoNN",
      image: "https://i.scdn.co/image/ab67616d0000b2730a31b4026a452ae8c3f97a76",
      name: "CARNIVAL",
      artists: "¥$, Kanye West, Ty Dolla $ign, Rich The Kid, Playboi Carti",
      stat1: "432.82 minutes",
      stat2: "113 streams",
    },
    {
      id: "3xby7fOyqmeON8jsnom0AT",
      href: "https://open.spotify.com/track/3xby7fOyqmeON8jsnom0AT",
      image: "https://i.scdn.co/image/ab67616d0000b2736cfd9a7353f98f5165ea6160",
      name: "Nightcrawler (feat. Swae Lee & Chief Keef)",
      artists: "Travis Scott, Swae Lee, Chief Keef",
      stat1: "405.34 minutes",
      stat2: "85 streams",
    },
    {
      id: "3yk7PJnryiJ8mAPqsrujzf",
      href: "https://open.spotify.com/track/3yk7PJnryiJ8mAPqsrujzf",
      image: "https://i.scdn.co/image/ab67616d0000b273e31a279d267f3b3d8912e6f1",
      name: "Location",
      artists: "Playboi Carti",
      stat1: "370.46 minutes",
      stat2: "140 streams",
    },
    {
      id: "2tudvzsrR56uom6smgOcSf",
      href: "https://open.spotify.com/track/2tudvzsrR56uom6smgOcSf",
      image: "https://i.scdn.co/image/ab67616d0000b273a46b07c291e6dfdee13b3ee8",
      name: "Like That",
      artists: "Future, Metro Boomin, Kendrick Lamar",
      stat1: "360.51 minutes",
      stat2: "98 streams",
    },
    {
      id: "2cZOYofOX4d6g0OXxkaIjA",
      href: "https://open.spotify.com/track/2cZOYofOX4d6g0OXxkaIjA",
      image: "https://i.scdn.co/image/ab67616d0000b273ca15942c726ec9c39796435e",
      name: "ALL RED",
      artists: "Playboi Carti",
      stat1: "333.12 minutes",
      stat2: "146 streams",
    },
  ],
};

export default async function DemoPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar disable />
      <SidebarInset>
        <AppHeader items={["Package", "Overview"]}>
          <SelectMonthRange />
        </AppHeader>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-2 max-w-screen-2xl w-full mx-auto">
          <TopStatsCards demoData={data.topStats} />
          <div className="flex flex-col md:flex-row gap-4">
            <TimeListenedChart data={data.timeListened} className="flex-1" />
            <ListeningPatternChart data={data.listeningPattern} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RankingList
              type="dashboardArtists"
              className="col-span-1"
              demoData={data.topArtists}
            />
            <RankingList
              type="dashboardTracks"
              className="col-span-1"
              demoData={data.topTracks}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
