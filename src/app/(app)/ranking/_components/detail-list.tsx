import { Album, Artist, Simplified, Track } from "@/types"
import { Title } from "@mantine/core"
import { DetailCard } from "./detail-card"

const setTypeOfData = (key: string, data: Track | Artist | Album): Simplified | Simplified[] => {
  if ("artist" in data && "album" in data) {
    return key === "artist" ? data.artist : data.album
  } else if ("artist" in data && "tracks" in data) {
    return key === "artist" ? data.artist : data.tracks
  } else {
    return key === "albums" ? data.albums : data.tracks
  }
}

type DetailListProps = {
  title: string
  dataKey: 'tracks' | 'albums' | 'artist' | 'album'
  data: Track | Artist | Album
}

export const DetailList = ({ title, dataKey, data }: DetailListProps) => {
  const listData = setTypeOfData(dataKey, data)

  return (
    <div className="flex flex-col gap-2">
      <Title order={3} className="mb-2">{title}</Title>
      {Array.isArray(listData) ? listData?.map((item, index) => (
        <div className='flex items-center w-full' key={index}>
          <Title order={3} className='w-16 text-center'>{`#${index + 1}`}</Title>
          <DetailCard
            title={item.name}
            ms_played={item.ms_played}
            total_played={item.total_played}
          />
        </div>
      )) : (
        <div className='flex items-center w-full'>
          <DetailCard
            title={listData.name}
            ms_played={listData.ms_played}
            total_played={listData.total_played}
          />
        </div>
      )}
    </div>
  )
}