<p align="center"><img src="https://socialify.git.ci/abgameur/harmony/image?description=1&amp;logo=data%3Aimage%2Fsvg%2Bxml%2C%253Csvg%2520viewBox%253D%25220%25200%252032%252033%2522%2520xmlns%253D%2522http%253A%252F%252Fwww.w3.org%252F2000%252Fsvg%2522%2520%253E%253Crect%2520%2520%2520%2520%2520%2520%2520%2520transform%253D%2522rotate(-4%25200%25202.0908)%2522%2520%2520%2520%2520%2520%2520%2520%2520y%253D%25222.0908%2522%2520%2520%2520%2520%2520%2520%2520%2520width%253D%252229.979%2522%2520%2520%2520%2520%2520%2520%2520%2520height%253D%252230.024%2522%2520%2520%2520%2520%2520%2520%2520%2520rx%253D%25224.0258%2522%2520%2520%2520%2520%2520%2520%2520%2520fill%253D%2522%2523141414%2522%2520%2520%2520%2520%2520%2520%252F%253E%253Cg%2520fill%253D%2522%25231ED760%2522%2520clipPath%253D%2522url(%2523clip0_148_68)%2522%253E%253Cpath%2520d%253D%2522m9.292%252017.838-1.5451%25200.1081c-0.58857%25200.0411-1.0288%25200.6008-0.98337%25201.2499l0.40003%25205.7208c0.0454%25200.6492%25200.5592%25201.1421%25201.1478%25201.101l1.545-0.1081c0.58859-0.0411%25201.0288-0.6008%25200.98339-1.25l-0.4001-5.7207c-0.0453-0.6492-0.55915-1.1421-1.1477-1.101z%2522%2520%252F%253E%253Cpath%2520d%253D%2522m13.59%25206.7296-1.5451%25200.10804c-0.5885%25200.04115-1.0287%25200.60079-0.9834%25201.25l1.1522%252016.476c0.0454%25200.6491%25200.5592%25201.1421%25201.1478%25201.1009l1.545-0.108c0.5886-0.0412%25201.0288-0.6008%25200.9834-1.25l-1.1522-16.476c-0.0454-0.64921-0.5592-1.1421-1.1477-1.101z%2522%2520%252F%253E%253Cpath%2520d%253D%2522m19.149%252013.663-1.5451%25200.108c-0.5885%25200.0412-1.043%25200.3971-1.0152%25200.7951l0.7063%252010.1c0.0278%25200.3979%25200.5274%25200.6871%25201.1159%25200.646l1.5451-0.1081c0.5885-0.0411%25201.043-0.3971%25201.0152-0.795l-0.7063-10.1c-0.0278-0.3979-0.5274-0.6872-1.1159-0.646z%2522%2520%252F%253E%253Cpath%2520d%253D%2522m23.924%25209.3848-1.5451%25200.10804c-0.5885%25200.04115-1.0225%25200.69003-0.9694%25201.4492l0.8892%252012.716c0.0531%25200.7592%25200.5732%25201.3414%25201.1617%25201.3002l1.5451-0.108c0.5885-0.0412%25201.0225-0.6901%25200.9694-1.4492l-0.8892-12.716c-0.0531-0.75928-0.5732-1.3414-1.1617-1.3003z%2522%2520%252F%253E%253C%252Fg%253E%253C%252Fsvg%253E&amp;name=1&amp;owner=1&amp;pattern=Plus&amp;stargazers=1&amp;theme=Light" alt="project-image"></p>

## Overview

Harmony is a web app that gives you statistics on your Spotify account. You can upload your Spotify data and get insights on your listening habits and more detailed information about your account.

<!-- 
export const data = {
  header: {
    name: "Harmony",
    Logo: Icons.logo
  },
  stats: [
    {
      title: "Top",
      url: "/top",
      icon: ListOrdered,
      items: [
        {
          title: "Tracks",
          url: "/top/tracks",
          icon: AudioLines
        },
        {
          title: "Artists",
          url: "/top/artists",
          icon: UserRoundPen
        }
      ]
    },
    {
      title: "Recently Played",
      url: "/recently-played",
      icon: History
    }
  ],
  package: [
    {
      title: "Overview",
      url: "/overview",
      icon: LayoutDashboard
    },
    {
      title: "Rankings",
      url: "/rankings",
      icon: TrendingUp,
      items: [
        {
          title: "Tracks",
          url: "/rankings/tracks",
          icon: AudioLines
        },
        {
          title: "Albums",
          url: "/rankings/albums",
          icon: Disc3
        },
        {
          title: "Artists",
          url: "/rankings/artists",
          icon: UserRoundPen
        }
      ]
    },
    {
      title: "Stats",
      url: "/stats",
      icon: ChartNoAxesCombined,
      items: [
        {
          title: "Numbers",
          url: "/stats/numbers",
          icon: Binary
        },
        {
          title: "Listening Habits",
          url: "/stats/listening-habits",
          icon: ChartLine
        },
        {
          title: "Activity",
          url: "/stats/activity",
          icon: TrendingUpDown
        }
      ]
    }
  ],
  advanced: [
    {
      title: "Milestones",
      url: "/milestones",
      icon: Milestone
    },
    {
      title: "Comparisons",
      url: "/comparisons",
      icon: ArrowRightLeft,
      items: [
        {
          title: "Year-over-Year",
          url: "/comparisons/year-over-year",
          icon: CalendarRange
        },
        {
          title: "Artist vs Artist",
          url: "/comparisons/artist-vs-artist",
          icon: UsersRound
        }
      ]
    }
  ],
  settings: [
    {
      title: "Package",
      url: "/settings/package",
      icon: Package
    },
    {
      title: "About",
      url: "/settings/about",
      icon: Info
    }
  ],
  navSecondary: [
    {
      title: "Github",
      url: "https://github.com/aBgAmeuR/Harmony",
      icon: Github
    }
  ]
};
 -->

## Features

- **Top Tracks**: Get a list of your top tracks.
- **Top Artists**: Get a list of your top artists.
- **Recently Played**: Get a list of your recently played tracks.
- **Overview**: Get an overview of your account.
- **Rankings**: Get rankings of your tracks, albums, and artists.
- **Stats**: Get advanced statistics about your account.
- **Milestones**: Get milestones of your account.
- **Comparisons**: Compare artists and years.
- **Settings**: Change settings and get information about the app.

## Built With

[![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadcnUI](https://img.shields.io/badge/shadcn%2Fui-000?style=for-the-badge&logo=shadcnui&logoColor=fff)](https://ui.shadcn.com/)
[![Spotify Web API](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com/documentation/web-api/)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.
