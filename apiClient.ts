import { NetworkType, NodeType } from "./constants/network";

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
      (nodeType === NodeType.Internal ? INTERNAL_BASE_URL : BASE_URL) +
      endpoint;

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

export async function getSheetNames(
  nodeType: NodeType,
  networkType: NetworkType
): Promise<string[]> {
  return await fetchAPI<string[]>(nodeType, `${networkType}/sheets/names`);
}

export async function getSheet(
  nodeType: NodeType,
  networkType: NetworkType,
  name: string
): Promise<string> {
  return await fetchAPI<string>(nodeType, `${networkType}/sheets/${name}`, {
    headers: { accept: "text/csv" },
  });
}

export async function getBalance(
  nodeType: NodeType,
  networkType: NetworkType,
  address: string,
  currencyTicker: string,
): Promise<any | null> {
  try {
    return await fetchAPI<any>(
      nodeType,
      `${networkType}/balances/${address}/${currencyTicker}`
    );
  } catch (error) {
    return null;
  }
}

export async function getAvatar(
  nodeType: NodeType,
  networkType: NetworkType,
  address: string
): Promise<any | null> {
  try {
    return await fetchAPI<any>(nodeType, `${networkType}/avatars/${address}`);
  }
  catch (error) {
    return null;
  }
}

export async function getAvatarInventory(
  nodeType: NodeType,
  networkType: NetworkType,
  avatarAddress: string
): Promise<any | null> {
  try {
    return await fetchAPI<any>(
      nodeType,
      `${networkType}/avatars/${avatarAddress}/inventory`
    );
  } catch (error) {
    return null;
  }
}
