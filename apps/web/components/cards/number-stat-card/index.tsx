import React from "react";
import { Card } from "@repo/ui/card";
import { NumberFlow } from "@repo/ui/number";
import { minutesToHours } from "date-fns";
import { Clock } from "lucide-react";

export const NumberStatCard = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-75">Total Listening Time</p>
          <h2 className="text-4xl font-bold mt-2">
            <NumberFlow
              value={minutesToHours(data.listeningTime).toFixed(2)}
              suffix=" hours"
            />
          </h2>
        </div>
        <Clock className="size-8 opacity-75" />
      </div>
      <p className="mt-4 text-sm opacity-75">
        <NumberFlow
          value={Math.round(msToHours(data.listeningTime) / 24)}
          prefix="That's about "
          suffix=" days of non-stop music!"
        />
      </p>
    </Card>
  );
};