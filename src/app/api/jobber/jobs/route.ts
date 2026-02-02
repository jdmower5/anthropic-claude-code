import { NextResponse } from "next/server";
import { fetchJobs } from "@/lib/jobber-client";
import { isConnected } from "@/lib/jobber-config";

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ error: "Not connected to Jobber" }, { status: 401 });
  }

  try {
    const jobs = await fetchJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching Jobber jobs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
