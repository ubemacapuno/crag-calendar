"use client";

import { useEffect, useState } from "react";

import { getTotalLoggedClimbs } from "@/app/dashboard/crag/actions";
import ClimbingStats from "@/components/climbing-stats";

import CragClient from "./page.client";

export default function CragPage() {
  const [totalClimbs, setTotalClimbs] = useState(0);

  useEffect(() => {
    const fetchTotalClimbs = async () => {
      const total = await getTotalLoggedClimbs();
      setTotalClimbs(total);
    };
    fetchTotalClimbs();
  }, []);

  // TODO: Add all climbing stats that need updated
  const updateClimbingStats = async () => {
    const total = await getTotalLoggedClimbs();
    setTotalClimbs(total);

    // TODO: Any stats regarding grades need to be updated if any grades are changed
    // TODO: Any stats regarding attempts need to be updated if any attempts are changed
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="mb-4 text-2xl font-bold">Climbing Log</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <CragClient onClimbsChange={updateClimbingStats} />
        </div>
        <div className="w-full md:w-1/2">
          <ClimbingStats totalClimbs={totalClimbs} />
        </div>
      </div>
    </div>
  );
}
