import { ColorSwatch, Paper, Text } from "@mantine/core";

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

interface LineChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
  average?: number;
}

export function LineChartTooltip({ label, payload, average }: LineChartTooltipProps) {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md" className='bg-secondary'>
      <Text fw={600} mb={5}>
        At {label}
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