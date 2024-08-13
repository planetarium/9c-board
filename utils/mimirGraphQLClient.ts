import { GraphQLClient } from "graphql-request";
import { Network } from "../constants/network";
import { getSdk } from "../generated/mimir/graphql-request";

function getUrl(network: Network) {
  const map = process.env.MIMIR_GRAPHQL_URL_MAP;
  if (map === undefined) {
    throw new Error("MIMIR_GRAPHQL_URL_MAP is not set.");
  }

  if (map === "") {
    throw new Error("MIMIR_GRAPHQL_URL_MAP is empty.");
  }

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
