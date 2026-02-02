import { NextResponse } from "next/server";
import { fetchClients } from "@/lib/jobber-client";
import { isConnected } from "@/lib/jobber-config";

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ error: "Not connected to Jobber" }, { status: 401 });
  }

  try {
    const clients = await fetchClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching Jobber clients:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
