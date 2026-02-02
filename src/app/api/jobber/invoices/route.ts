import { NextResponse } from "next/server";
import { fetchInvoices } from "@/lib/jobber-client";
import { isConnected } from "@/lib/jobber-config";

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ error: "Not connected to Jobber" }, { status: 401 });
  }

  try {
    const invoices = await fetchInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching Jobber invoices:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
