'use client'

import { useTimeRangeStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Text } from '@mantine/core';
import Link from 'next/link';
import React, { PropsWithChildren } from 'react';

export type NavigationProps = PropsWithChildren<{
  currentPath?: string;
}>

export const Navigation = ({ currentPath, children }: NavigationProps) => {
  return (
    <nav className="flex gap-4">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement<any>(child, {
            current: currentPath?.includes(child.props.path)
          });
        }
        return child;
      })}
    </nav>
  )
}

type NavigationButtonProps = {
  title: string;
  value?: string;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({ title, value = title }) => {
  const { timeRange, setTimeRange } = useTimeRangeStore();

  const handleClick = () => {
    setTimeRange(value as any);
  }

  return (
    <button onClick={handleClick} className={`text-white px-3 py-1 rounded-lg ${timeRange === value ? 'bg-green' : 'hover:bg-tertiary'}`} >
      <Text fw={500} size="lg">{title}</Text>
    </button >
  )
}

type NavigationLinkProps = {
  title: string;
  path: string;
  current?: boolean;
  fakePath?: string;
  icon?: React.ReactNode;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ title, path, current = false, fakePath, icon }) => {
  return (
    <Link href={fakePath || path} className={cn('text-white px-3 py-1 rounded-lg flex gap-1 items-center', current ? 'bg-green' : 'hover:bg-tertiary')}>
      {icon}
      <Text fw={500} size="lg">{title}</Text>
    </Link>
  )
}