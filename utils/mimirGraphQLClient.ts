import { GraphQLClient } from "graphql-request";
import { NetworkType, NodeType } from "../constants/network";

function getUrl(nodeType: NodeType) {
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
    if (key === nodeType) {
      return value;
    }
  }

  throw new Error("There is no such network: " + nodeType);
}

export function getClient(nodeType: NodeType) {
  const url = getUrl(nodeType);
  return new GraphQLClient(url);
}

export function getSdk(networkType: NetworkType, nodeType: NodeType) {
  const planetName = networkType.toUpperCase();
  const client = getClient(nodeType);
  return {
    client,
    sheetNames: () => {
      const query = `
        query {
            sheetNames(planetName: ${planetName})
        }
      `;
      return client
        .request(query, undefined, { accept: "application/json" })
        .then((data) => data.sheetNames);
    },
    sheet: (sheetName: string) => {
      const query = `
        query {
            sheet(planetName: ${planetName}, sheetName: "${sheetName}") {
                csv
            }
        }
      `;
      return client
        .request(query, undefined, { accept: "application/json" })
        .then((data) => data.sheet.csv);
    },
  };
}
