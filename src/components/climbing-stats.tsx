"use client";

import { Mountain } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClimbingStatsProps {
  totalClimbs: number;
}

export default function ClimbingStats({ totalClimbs }: ClimbingStatsProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Climbing Stats</CardTitle>
        <Mountain className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalClimbs}</div>
        <p className="text-xs text-muted-foreground">Total logged climbs</p>
      </CardContent>
    </Card>
  );
}
