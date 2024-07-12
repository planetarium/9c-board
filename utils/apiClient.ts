import { GraphQLClient } from "graphql-request";
import { Network } from "../constants/network";
import { getSdk } from "../generated/mimir/graphql-request";

export type PlanetName = "odin" | "heimdall";

export const BASE_URL = "https://mimir.nine-chronicles.dev";

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

interface FetchOptions<TBody = undefined> {
  method?: "GET" | "POST";
  body?: TBody;
  headers?: HeadersInit;
}

async function fetchAPI<TResponse, TBody = undefined>(
  network: Network,
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  try {
    const { method = "GET", body, headers } = options;

    const config: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : null,
    };

    const url = `${BASE_URL}/${network}/${endpoint}`;
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as TResponse;
    } else if (contentType.includes("text/csv")) {
      return (await response.text()) as unknown as TResponse;
    } else {
      throw new Error(`Unsupported response format: ${contentType}`);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getBalance(
  network: Network,
  address: string,
  currencyTicker: string,
): Promise<any | null> {
  try {
    return await fetchAPI<any>(
      network,
      `/balances/${address}/${currencyTicker}`
    );
  } catch (error) {
    return null;
  }
}

// GraphQL
// function getGraphQLEndpoint(network: Network) {
//   return `${BASE_URL}/${network}/graphql`;
// }

// export function getGraphQLSDK(network: Network) {
//   const client = new GraphQLClient(getGraphQLEndpoint(network));
//   return getSdk(client);
// }
