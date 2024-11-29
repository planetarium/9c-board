import { getSdk } from "../generated/headless/graphql-request";
import { GraphQLClient } from "graphql-request"

function parseNetworkConfMap(confMapString: string): Map<string, ReturnType<typeof getSdk>> {
    const map = new Map();
    for (const pair of confMapString.split(',')) {
        const [network, graphqlEndpoint] = pair.split('=');
        map.set(network, getSdk(new GraphQLClient(graphqlEndpoint)));
    }

    return map;
}

// This variable should have only mainnet-level networks.
const DEFAULT_NETWORK_CONF_ENV = "odin=https://9c-main-full-state.nine-chronicles.com/graphql,heimdall=https://heimdall-full-state.nine-chronicles.com/graphql";

export function getHeadlessGraphQLSDK(network: string) {
    const networkToSdkMap = parseNetworkConfMap(process.env.NETWORK_CONF_MAP || DEFAULT_NETWORK_CONF_ENV);
    const sdk = networkToSdkMap.get(network);
    if (sdk === undefined) {
        throw new TypeError("There is no such network: " + network);
    }

    return sdk;
}
