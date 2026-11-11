import {
  AndroidIcon,
  AppleIcon,
  ComputerIcon,
  Icon,
  LaptopIcon,
  MoreHorizontalIcon,
  UnavailableIcon,
  WindowsOldIcon,
} from "@harmony/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

import { platformLabel } from "@/shared/lib/format";

export const InteractionsPlatform = ({ platform }: { platform: string }) => {
  const icon = platformIconMap[platform] ?? MoreHorizontalIcon;
  const platformName = platformLabel(platform);

  return (
    <Tooltip>
      <TooltipTrigger render={<Icon icon={icon} />} />
      <TooltipContent>
        <p>{platformName}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const platformIconMap: Record<string, typeof LaptopIcon> = {
  web_player: LaptopIcon,
  android: AndroidIcon,
  ios: AppleIcon,
  linux: ComputerIcon,
  windows: WindowsOldIcon,
  not_applicable: UnavailableIcon,
  other: MoreHorizontalIcon,
};
