import type { EventInfo } from "@/lib/types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/orgs`
    : "http://localhost:5256/api/orgs";


export async function getEvents(orgId: string): Promise<EventInfo[]> {
  const res = await fetch(`${BASE}/${orgId}/events`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }
  return res.json();
}