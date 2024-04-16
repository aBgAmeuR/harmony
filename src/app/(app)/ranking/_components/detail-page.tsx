'use client'

import { PresentationSection } from '@/components/presentation-section'
import { getRankingData } from '@/lib/store'
import { DetailList } from './detail-list'
import { ErrorDetail } from './error-detail'

const listConfig = {
  'artists': {
    list1: {
      title: 'Tracks',
      key: 'tracks',
    },
    list2: {
      title: 'Albums',
      key: 'albums',
    }
  },
  'albums': {
    list1: {
      title: 'Artist',
      key: 'artist',
    },
    list2: {
      title: 'Tracks',
      key: 'tracks',
    }
  },
  'tracks': {
    list1: {
      title: 'Artist',
      key: 'artist',
    },
    list2: {
      title: 'Album',
      key: 'album',
    }
  }
} as const

type DetailPageProps = {
  type: 'artists' | 'albums' | 'tracks'
  id: string
}

const DetailPage = ({ type, id }: DetailPageProps) => {
  const data = getRankingData(type, id)[0]
  if (!data) return <ErrorDetail msg="Details not found" href={`/ranking/${type}`} />

  return (
    <>
      <PresentationSection name={data.name} image_url={data.image_url} href={data.href} image_rounded={type === 'artists' ? 'circle' : 'rounded'} />
      <section className="px-4 py-8 mx-auto w-full max-w-4xl grid grid-cols-2 gap-4">
        <DetailList title={listConfig[type].list1.title} dataKey={listConfig[type].list1.key} data={data} />
        <DetailList title={listConfig[type].list2.title} dataKey={listConfig[type].list2.key} data={data} />
      </section>
    </>
  )
}

export default DetailPage
