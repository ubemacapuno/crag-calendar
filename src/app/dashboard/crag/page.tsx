import CragClient from "./page.client";

export default function CragPage() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="mb-4 text-2xl font-bold">Climbing Log</h1>
      <CragClient />
    </div>
  );
}
