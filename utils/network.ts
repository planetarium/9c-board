import { NodeType } from "../constants/network";
import { PlanetName } from "../generated/mimir/graphql-request";

export function getPlanetName(network: string): PlanetName {
  if (network.toLowerCase().includes(PlanetName.Odin.toLowerCase())) {
    return PlanetName.Odin;
  } else if (network.toLowerCase().includes(PlanetName.Heimdall.toLowerCase())) {
    return PlanetName.Heimdall;
  } else {
    throw new Error();
  }
}

export function getNodeType(node: string): NodeType {
  if (node.includes(NodeType.Internal)) {
    return NodeType.Internal;
  } else if (node.includes(NodeType.Main)) {
    return NodeType.Main;
  } else {
    throw new Error(node);
  }
}
