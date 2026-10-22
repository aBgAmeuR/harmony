import { Icon } from "@harmony/icons";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";

import type { FigureView } from "../model/types";

import { Tip } from "./tip";

type FigureViewsProps = {
  views: FigureView[];
  value: string;
  onChange: (view: string) => void;
};

// Switches how a figure is drawn: icons when the views have one, labels otherwise.
export const FigureViews = ({ views, value, onChange }: FigureViewsProps) => (
  <Tabs value={value} onValueChange={(next) => onChange(String(next))}>
    <TabsList className="p-0.5 group-data-horizontal/tabs:h-7">
      {views.map((view) =>
        view.icon ? (
          <Tip key={view.value} label={view.label}>
            <TabsTrigger value={view.value} aria-label={view.label} className="w-6 flex-none px-0">
              <Icon icon={view.icon} size={14} />
            </TabsTrigger>
          </Tip>
        ) : (
          <TabsTrigger key={view.value} value={view.value} className="px-2">
            {view.label}
          </TabsTrigger>
        ),
      )}
    </TabsList>
  </Tabs>
);
