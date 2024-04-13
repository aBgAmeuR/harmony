'use client';

import { useTimeRangeStore } from "@/lib/state";
import { Title } from "@mantine/core";
import Image from "next/image";
import { DetailCard } from "../../_components/detail-card";
import { ErrorList } from "../../_components/error-list";
import { SpotifyBtn } from "@/components/ui/spotify-btn";
import { ErrorDetail } from "../../_components/error-detail";
import { getAlbums } from "@/lib/store";

const DetailsAlbum = ({ id }: { id: string }) => {
  const { timeRange } = useTimeRangeStore()
  const album = getAlbums(timeRange, id)[0]
  if (!album) return <ErrorDetail msg="Album not found" href="/ranking/albums" />

  return (
    <>
      <section className="bg-secondary">
        <div className="px-4 py-8 mx-auto w-full max-w-4xl flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className='size-40 flex justify-center items-center object-cover overflow-hidden rounded-sm'>
              <Image src={album.image_url} alt={album.name} width={160} height={160} />
            </div>
            <Title order={1}>{album.name}</Title>
          </div>
          <SpotifyBtn href={album.href} />
        </div>
      </section>
      <section className="px-4 py-8 mx-auto w-full max-w-4xl grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Title order={3} className="mb-2">Artist</Title>
          <DetailCard
            title={album.artist.name}
            ms_played={album.ms_played}
            total_played={album.total_played}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Title order={3} className="mb-2">Top Tracks</Title>
          {album.tracks ? album.tracks.map((track, index) => (
            <div className='flex items-center w-full' key={index}>
              <Title order={3} className='w-16 text-center'>{`#${index + 1}`}</Title>
              <DetailCard
                title={track.name}
                ms_played={track.ms_played}
                total_played={track.total_played}
              />
            </div>
          )) : <ErrorList />}
        </div>
      </section>
    </>
  )
}

export default DetailsAlbum;