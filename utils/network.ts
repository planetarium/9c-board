import { PlanetName } from "./apiClient";

export function getPlanetName(network: string): PlanetName {
  if (network.toLowerCase().includes("odin")) {
    return "odin";
  } else if (network.toLowerCase().includes("heimdall")) {
    return "heimdall";
  } else {
    throw new Error();
  }
}
