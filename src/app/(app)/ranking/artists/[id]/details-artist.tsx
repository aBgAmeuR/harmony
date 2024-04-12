'use client';

import { useTimeRangeStore } from "@/lib/state";
import { getArtistDetails } from "@/lib/store";
import { Title } from "@mantine/core";
import Image from "next/image";
import { ErrorList } from "../../_components/error-list";
import { DetailCard } from "../../_components/detail-card";
import { SpotifyBtn } from "@/components/ui/spotify-btn";
import { ErrorDetail } from "../../_components/error-detail";

const DetailsArtist = ({ id }: { id: string }) => {
  const { timeRange } = useTimeRangeStore()
  const artist = getArtistDetails(timeRange, id)
  if (!artist) return <ErrorDetail msg="Artist not found" href="/ranking/artists" />

  return (
    <>
      <section className="bg-secondary">
        <div className="px-4 py-8 mx-auto w-full max-w-4xl flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className='size-40 flex justify-center items-center object-cover overflow-hidden rounded-full'>
              <Image src={artist.image_url} alt={artist.name} width={160} height={160} />
            </div>
            <Title order={1}>{artist.name}</Title>
          </div>
          <SpotifyBtn href={artist.href} />
        </div>
      </section>
      <section className="px-4 py-8 mx-auto w-full max-w-4xl grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Title order={3} className="mb-2">Top Tracks</Title>
          {artist.tracks ? artist.tracks.map((track, index) => (
            <div className='flex items-center w-full' key={index}>
              <Title order={3} className='w-16 text-center'>{`#${index + 1}`}</Title>
              <DetailCard
                title={track.name}
                ms_played={track.ms_played}
                total_played={track.total_played}
              />
            </div>
          )) : < ErrorList />}
        </div>
        <div className="flex flex-col gap-2">
          <Title order={3} className="mb-2">Top Albums</Title>
          {artist.albums ? artist.albums.map((album, index) => (
            <div className='flex items-center w-full' key={index}>
              <Title order={3} className='w-16 text-center'>{`#${index + 1}`}</Title>
              <DetailCard
                title={album.name}
                ms_played={album.ms_played}
                total_played={album.total_played}
              />
            </div>
          )) : < ErrorList />}
        </div>
      </section>
    </>
  )
}

export default DetailsArtist;