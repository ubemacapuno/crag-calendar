import { Mountain } from "lucide-react";

import { getTotalLoggedClimbs } from "@/app/dashboard/crag/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClimbingStats() {
  const totalGrades = await getTotalLoggedClimbs();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Climbing Stats</CardTitle>
        <Mountain className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalGrades}</div>
        <p className="text-xs text-muted-foreground">Total logged climbs</p>
      </CardContent>
    </Card>
  );
}
