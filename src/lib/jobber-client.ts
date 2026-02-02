import { JOBBER_CONFIG, getValidAccessToken } from "./jobber-config";

// Generic GraphQL request function
async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Jobber. Please connect your account.");
  }

  const response = await fetch(JOBBER_CONFIG.graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jobber API error (${response.status}): ${text}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`Jobber GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// --- Clients ---
export interface JobberClient {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  emails: { address: string; primary: boolean }[];
  phones: { number: string; primary: boolean }[];
  billingAddress: {
    street1: string;
    street2: string | null;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  balance: number;
  isCompany: boolean;
  createdAt: string;
}

export async function fetchClients(first = 50): Promise<{ nodes: JobberClient[]; totalCount: number }> {
  const query = `
    query GetClients($first: Int!) {
      clients(first: $first) {
        nodes {
          id
          firstName
          lastName
          companyName
          emails { address primary }
          phones { number primary }
          billingAddress {
            street1
            street2
            city
            province
            postalCode
          }
          balance
          isCompany
          createdAt
        }
        totalCount
      }
    }
  `;
  const data = await graphqlRequest<{ clients: { nodes: JobberClient[]; totalCount: number } }>(query, { first });
  return data.clients;
}

// --- Jobs ---
export interface JobberJob {
  id: string;
  title: string;
  jobNumber: string;
  startAt: string | null;
  endAt: string | null;
  closedAt: string | null;
  jobStatus: string;
  total: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  visitSchedule: {
    arrivalWindow: {
      startAt: string;
      endAt: string;
    };
  } | null;
  lineItems: {
    nodes: {
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
}

export async function fetchJobs(first = 50): Promise<{ nodes: JobberJob[]; totalCount: number }> {
  const query = `
    query GetJobs($first: Int!) {
      jobs(first: $first) {
        nodes {
          id
          title
          jobNumber
          startAt
          endAt
          closedAt
          jobStatus
          total
          client {
            id
            firstName
            lastName
          }
          lineItems {
            nodes {
              name
              description
              quantity
              unitPrice
              totalPrice
            }
          }
        }
        totalCount
      }
    }
  `;
  const data = await graphqlRequest<{ jobs: { nodes: JobberJob[]; totalCount: number } }>(query, { first });
  return data.jobs;
}

// --- Invoices ---
export interface JobberInvoice {
  id: string;
  invoiceNumber: string;
  subject: string | null;
  status: string;
  issuedDate: string;
  dueDate: string;
  total: number;
  amountDue: number;
  amountPaid: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lineItems: {
    nodes: {
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
}

export async function fetchInvoices(first = 50): Promise<{ nodes: JobberInvoice[]; totalCount: number }> {
  const query = `
    query GetInvoices($first: Int!) {
      invoices(first: $first) {
        nodes {
          id
          invoiceNumber
          subject
          status
          issuedDate
          dueDate
          total
          amountDue
          amountPaid
          client {
            id
            firstName
            lastName
          }
          lineItems {
            nodes {
              name
              description
              quantity
              unitPrice
              totalPrice
            }
          }
        }
        totalCount
      }
    }
  `;
  const data = await graphqlRequest<{ invoices: { nodes: JobberInvoice[]; totalCount: number } }>(query, { first });
  return data.invoices;
}

// --- Quotes ---
export interface JobberQuote {
  id: string;
  quoteNumber: string;
  quoteStatus: string;
  title: string;
  total: number;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export async function fetchQuotes(first = 50): Promise<{ nodes: JobberQuote[]; totalCount: number }> {
  const query = `
    query GetQuotes($first: Int!) {
      quotes(first: $first) {
        nodes {
          id
          quoteNumber
          quoteStatus
          title
          total
          createdAt
          client {
            id
            firstName
            lastName
          }
        }
        totalCount
      }
    }
  `;
  const data = await graphqlRequest<{ quotes: { nodes: JobberQuote[]; totalCount: number } }>(query, { first });
  return data.quotes;
}
