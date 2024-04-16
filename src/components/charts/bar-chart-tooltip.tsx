import { ChartData } from "@/types";
import { ColorSwatch, Paper, Text } from "@mantine/core";

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const formatMonthAndYear = (date: string) => {
  const [month, year] = date.split('/')
  return `${months[parseInt(month) - 1]} 20${year}`
}

interface BarChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
  average?: number;
  data: ChartData;
}

export function BarChartTooltip({ label, payload, average, data }: BarChartTooltipProps) {
  if (!payload) return null;

  const getStreamsValueFromMonth = (month: string) => {
    const monthData = data.find((item) => item.time === month)
    return monthData ? monthData.total_streams : 0
  }

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md" className='bg-secondary'>
      <Text fw={600} mb={5}>
        {formatMonthAndYear(label || '')}
      </Text>
      <div>
        {payload.map((item: any) => (
          <div key={item.name} className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color={item.color}
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Time
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(item.value)}
            </Text>
          </div>
        ))}
        <div className='flex items-center justify-between gap-4'>
          <div>
            <ColorSwatch
              color="#0db14d"
              size={12}
              withShadow={false}
              className='inline-block mr-2'
            />
            <Text fz="sm" className='inline-block'>
              Streams
            </Text>
          </div>
          <Text fw={600} fz="sm">
            {getStreamsValueFromMonth(label)}
          </Text>
        </div>
        {average ? (
          <div className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color="#dc2626"
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Average
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(average)}
            </Text>
          </div>
        ) : null}
      </div>
    </Paper>
  );
}