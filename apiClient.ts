import { GraphQLClient } from "graphql-request";
import { NetworkType, NodeType } from "./constants/network";
import { PlanetName, getSdk } from "./generated/mimir/graphql-request";

export const BASE_URL = "https://mimir.nine-chronicles.dev/";
export const INTERNAL_BASE_URL = "https://mimir-internal.nine-chronicles.dev/";

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

interface FetchOptions<TBody = undefined> {
  method?: "GET" | "POST";
  body?: TBody;
  headers?: HeadersInit;
}

function getBaseUrl(nodeType: NodeType) {
  if (nodeType === NodeType.Main) {
    return BASE_URL;
  } else if (nodeType === NodeType.Internal) {
    return INTERNAL_BASE_URL;
  }

  throw new TypeError(`Unexpected nodeType: ${nodeType}`);
}

async function fetchAPI<TResponse, TBody = undefined>(
  nodeType: NodeType,
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

    const url =
      getBaseUrl(nodeType) + endpoint;

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
  nodeType: NodeType,
  networkType: PlanetName,
  address: string,
  currencyTicker: string,
): Promise<any | null> {
  try {
    return await fetchAPI<any>(
      nodeType,
      `${networkType.toLowerCase()}/balances/${address}/${currencyTicker}`
    );
  } catch (error) {
    return null;
  }
}

// GraphQL
function getGraphQLEndpoint(nodeType: NodeType) {
  return `${getBaseUrl(nodeType)}/graphql`;
}

export function getGraphQLSDK(nodeType: NodeType) {
  const client = new GraphQLClient(getGraphQLEndpoint(nodeType));
  return getSdk(client);
}
