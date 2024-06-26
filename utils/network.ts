import { NetworkType, NodeType } from "../constants/network";

export function getNetworkType(network: string): NetworkType {
  if (network.includes(NetworkType.Odin)) {
    return NetworkType.Odin;
  } else if (network.includes(NetworkType.Heimdall)) {
    return NetworkType.Heimdall;
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
    throw new Error();
  }
}
