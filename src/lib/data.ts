// Sample data for the business dashboard

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastContact: string;
  status: "active" | "pending" | "completed";
}

export interface Message {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  channel: "email" | "phone" | "sms" | "in-person";
}

export interface FinancialEntry {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  jobId?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  crew: string;
}

export interface Crew {
  id: string;
  name: string;
  members: CrewMember[];
  jobsCompleted: number;
  jobsScheduled: number;
  avgCompletionTime: number; // hours
  rating: number; // 1-5
  revenue: number;
}

export interface Job {
  id: string;
  customer: string;
  crewId: string;
  crewName: string;
  description: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  scheduledDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  amount: number;
}

// --- Sample Data ---

export const customers: Customer[] = [
  { id: "c1", name: "Sarah Johnson", email: "sarah@example.com", phone: "(555) 123-4567", lastContact: "2026-01-30", status: "active" },
  { id: "c2", name: "Mike Peterson", email: "mike.p@example.com", phone: "(555) 234-5678", lastContact: "2026-01-28", status: "active" },
  { id: "c3", name: "Linda Garcia", email: "lgarcia@example.com", phone: "(555) 345-6789", lastContact: "2026-01-25", status: "pending" },
  { id: "c4", name: "Tom Williams", email: "twilliams@example.com", phone: "(555) 456-7890", lastContact: "2026-01-22", status: "completed" },
  { id: "c5", name: "Rachel Chen", email: "rchen@example.com", phone: "(555) 567-8901", lastContact: "2026-02-01", status: "active" },
  { id: "c6", name: "David Brown", email: "dbrown@example.com", phone: "(555) 678-9012", lastContact: "2026-01-20", status: "pending" },
  { id: "c7", name: "Jessica Taylor", email: "jtaylor@example.com", phone: "(555) 789-0123", lastContact: "2026-01-15", status: "completed" },
  { id: "c8", name: "Chris Martinez", email: "cmartinez@example.com", phone: "(555) 890-1234", lastContact: "2026-02-02", status: "active" },
];

export const messages: Message[] = [
  { id: "m1", customerId: "c8", customerName: "Chris Martinez", subject: "Schedule change request", preview: "Hi, I need to move my appointment from Thursday to...", date: "2026-02-02", read: false, channel: "email" },
  { id: "m2", customerId: "c5", customerName: "Rachel Chen", subject: "Quote for backyard project", preview: "Thanks for coming out yesterday. Could you send over...", date: "2026-02-01", read: false, channel: "email" },
  { id: "m3", customerId: "c1", customerName: "Sarah Johnson", subject: "Re: Weekly service", preview: "Everything looked great this week! Quick question about...", date: "2026-01-30", read: true, channel: "email" },
  { id: "m4", customerId: "c2", customerName: "Mike Peterson", subject: "Payment confirmation", preview: "Just sent the payment through. Can you confirm...", date: "2026-01-28", read: true, channel: "sms" },
  { id: "m5", customerId: "c3", customerName: "Linda Garcia", subject: "New service inquiry", preview: "I was referred by a neighbor. I'm looking for...", date: "2026-01-25", read: true, channel: "phone" },
  { id: "m6", customerId: "c6", customerName: "David Brown", subject: "Follow-up on estimate", preview: "Wanted to follow up on the estimate you gave me last...", date: "2026-01-20", read: true, channel: "email" },
  { id: "m7", customerId: "c4", customerName: "Tom Williams", subject: "Season wrap-up", preview: "Thanks for the great work this season. Will we be on...", date: "2026-01-22", read: true, channel: "in-person" },
];

export const financials: FinancialEntry[] = [
  { id: "f1", description: "Johnson residence - weekly service", amount: 150, type: "income", category: "Service", date: "2026-01-30", jobId: "j1" },
  { id: "f2", description: "Peterson property - full cleanup", amount: 450, type: "income", category: "Service", date: "2026-01-28", jobId: "j2" },
  { id: "f3", description: "Equipment fuel", amount: -85, type: "expense", category: "Fuel", date: "2026-01-29" },
  { id: "f4", description: "Garcia estimate visit", amount: 0, type: "income", category: "Estimate", date: "2026-01-25" },
  { id: "f5", description: "Williams - season final", amount: 600, type: "income", category: "Service", date: "2026-01-22", jobId: "j3" },
  { id: "f6", description: "New trimmer purchase", amount: -320, type: "expense", category: "Equipment", date: "2026-01-21" },
  { id: "f7", description: "Crew payroll - Week 4", amount: -2800, type: "expense", category: "Payroll", date: "2026-01-24" },
  { id: "f8", description: "Chen property - landscape design", amount: 1200, type: "income", category: "Service", date: "2026-02-01", jobId: "j4" },
  { id: "f9", description: "Vehicle maintenance", amount: -210, type: "expense", category: "Vehicle", date: "2026-01-27" },
  { id: "f10", description: "Martinez property - maintenance", amount: 200, type: "income", category: "Service", date: "2026-02-02", jobId: "j5" },
  { id: "f11", description: "Insurance premium", amount: -450, type: "expense", category: "Insurance", date: "2026-01-15" },
  { id: "f12", description: "Brown estimate visit", amount: 0, type: "income", category: "Estimate", date: "2026-01-20" },
  { id: "f13", description: "Crew payroll - Week 5", amount: -2800, type: "expense", category: "Payroll", date: "2026-01-31" },
  { id: "f14", description: "Advertising - local paper", amount: -150, type: "expense", category: "Marketing", date: "2026-01-18" },
  { id: "f15", description: "Taylor - final invoice", amount: 350, type: "income", category: "Service", date: "2026-01-15" },
];

export const crews: Crew[] = [
  {
    id: "crew1",
    name: "Alpha Crew",
    members: [
      { id: "cm1", name: "James Rivera", role: "Crew Lead", crew: "Alpha Crew" },
      { id: "cm2", name: "Alex Nguyen", role: "Technician", crew: "Alpha Crew" },
      { id: "cm3", name: "Marcus Cole", role: "Technician", crew: "Alpha Crew" },
    ],
    jobsCompleted: 42,
    jobsScheduled: 5,
    avgCompletionTime: 2.3,
    rating: 4.8,
    revenue: 18500,
  },
  {
    id: "crew2",
    name: "Bravo Crew",
    members: [
      { id: "cm4", name: "Sofia Ramirez", role: "Crew Lead", crew: "Bravo Crew" },
      { id: "cm5", name: "Tyler Brooks", role: "Technician", crew: "Bravo Crew" },
    ],
    jobsCompleted: 35,
    jobsScheduled: 4,
    avgCompletionTime: 2.8,
    rating: 4.5,
    revenue: 14200,
  },
  {
    id: "crew3",
    name: "Charlie Crew",
    members: [
      { id: "cm6", name: "Kevin Park", role: "Crew Lead", crew: "Charlie Crew" },
      { id: "cm7", name: "Amanda Foster", role: "Technician", crew: "Charlie Crew" },
      { id: "cm8", name: "Derek White", role: "Technician", crew: "Charlie Crew" },
      { id: "cm9", name: "Mia Scott", role: "Apprentice", crew: "Charlie Crew" },
    ],
    jobsCompleted: 48,
    jobsScheduled: 6,
    avgCompletionTime: 2.1,
    rating: 4.9,
    revenue: 22100,
  },
];

export const jobs: Job[] = [
  { id: "j1", customer: "Sarah Johnson", crewId: "crew1", crewName: "Alpha Crew", description: "Weekly lawn maintenance", status: "completed", scheduledDate: "2026-01-30", completedDate: "2026-01-30", estimatedHours: 2, actualHours: 1.8, amount: 150 },
  { id: "j2", customer: "Mike Peterson", crewId: "crew2", crewName: "Bravo Crew", description: "Full property cleanup", status: "completed", scheduledDate: "2026-01-28", completedDate: "2026-01-28", estimatedHours: 4, actualHours: 4.5, amount: 450 },
  { id: "j3", customer: "Tom Williams", crewId: "crew3", crewName: "Charlie Crew", description: "Season-end service", status: "completed", scheduledDate: "2026-01-22", completedDate: "2026-01-22", estimatedHours: 5, actualHours: 4.2, amount: 600 },
  { id: "j4", customer: "Rachel Chen", crewId: "crew1", crewName: "Alpha Crew", description: "Landscape design installation", status: "in-progress", scheduledDate: "2026-02-01", estimatedHours: 8, amount: 1200 },
  { id: "j5", customer: "Chris Martinez", crewId: "crew3", crewName: "Charlie Crew", description: "Property maintenance", status: "completed", scheduledDate: "2026-02-02", completedDate: "2026-02-02", estimatedHours: 2, actualHours: 1.5, amount: 200 },
  { id: "j6", customer: "Sarah Johnson", crewId: "crew1", crewName: "Alpha Crew", description: "Weekly lawn maintenance", status: "scheduled", scheduledDate: "2026-02-06", estimatedHours: 2, amount: 150 },
  { id: "j7", customer: "Linda Garcia", crewId: "crew2", crewName: "Bravo Crew", description: "Initial consultation & service", status: "scheduled", scheduledDate: "2026-02-05", estimatedHours: 3, amount: 300 },
  { id: "j8", customer: "David Brown", crewId: "crew3", crewName: "Charlie Crew", description: "Hedge trimming & cleanup", status: "scheduled", scheduledDate: "2026-02-04", estimatedHours: 3, amount: 275 },
];

// Helpers
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function getTotalRevenue(): number {
  return financials.filter((f) => f.type === "income").reduce((sum, f) => sum + f.amount, 0);
}

export function getTotalExpenses(): number {
  return financials.filter((f) => f.type === "expense").reduce((sum, f) => sum + Math.abs(f.amount), 0);
}

export function getProfit(): number {
  return getTotalRevenue() - getTotalExpenses();
}

export function getUnreadCount(): number {
  return messages.filter((m) => !m.read).length;
}

export function getActiveJobsCount(): number {
  return jobs.filter((j) => j.status === "in-progress" || j.status === "scheduled").length;
}
