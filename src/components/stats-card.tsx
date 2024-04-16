import { cn } from "@/lib/utils";
import { Text } from "@mantine/core";

type Props = {
  icon: React.ReactNode;
  title: {
    textBefore?: string;
    value: string | number;
    textAfter?: string;
  }
  subtitle: string;
  className?: string;
}

export const StatsCard = ({ icon, title, subtitle, className }: Props) => {
  return (
    <div className={cn('p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center', className)}>
      {icon}
      <div className='flex flex-col w-full'>
        <Text fw={700} size="md" className="[&_span]:text-green">{title.textBefore} <span>{title.value}</span> {title.textAfter}</Text>
        <Text size="sm" c="dimmed">{subtitle}</Text>
      </div>
    </div>
  )
}
