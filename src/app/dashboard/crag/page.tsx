import ClimbingStats from "@/components/climbing-stats";

import CragClient from "./page.client";

export default function CragPage() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="mb-4 text-2xl font-bold">Climbing Log</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <CragClient />
        </div>
        <div className="w-full md:w-1/2">
          <ClimbingStats />
        </div>
      </div>
    </div>
  );
}
