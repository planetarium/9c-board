import { GraphQLClient } from "graphql-request";
import { Network } from "../constants/network";
import { getSdk } from "../generated/mimir/graphql-request";

// This variable should have only mainnet-level networks.
const DEFAULT_MIMIR_GRAPHQL_URL_MAP_ENV = "odin=https://mimir.nine-chronicles.dev/odin/graphql,heimdall=https://mimir.nine-chronicles.com/heimdall/graphql";

function getUrl(network: Network) {
  const map = process.env.MIMIR_GRAPHQL_URL_MAP || DEFAULT_MIMIR_GRAPHQL_URL_MAP_ENV;

  const pairs = map.split(",").map((pair) => {
    if (pair.indexOf("=") === -1) {
      throw new Error(
        "MIMIR_GRAPHQL_URL_MAP is not well-formed." +
        " It should be a comma-separated list of key-value pairs."
      );
    }

    return pair.split("=");
  });
  for (const [key, value] of pairs) {
    if (key === network) {
      return value;
    }
  }

  throw new Error("There is no such network: " + network);
}

export function getMimirGraphQLClient(network: Network) {
  const url = getUrl(network);
  return new GraphQLClient(url, { errorPolicy: "ignore" });
}

export function getMimirGraphQLSDK(network: Network) {
  return getSdk(getMimirGraphQLClient(network));
}
