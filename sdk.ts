import { GetServerSidePropsContext } from "next/types";
import { getSdk } from "./generated/graphql-request";
import { GraphQLClient } from "graphql-request"

function parseNetworkConfMap(confMapString: string): Map<string, ReturnType<typeof getSdk>> {
    const map = new Map();
    for (const pair of confMapString.split(',')) {
        const [network, graphqlEndpoint] = pair.split('=');
        map.set(network, getSdk(new GraphQLClient(graphqlEndpoint)));
    }

    return map;
}


export const networkToSDK = (context: GetServerSidePropsContext) => {
    if (process.env.NETWORK_CONF_MAP === undefined) {
        throw new Error("All required environment variables are not set.");
    }

    const networkToSdkMap = parseNetworkConfMap(process.env.NETWORK_CONF_MAP);

    const network = context.query.network;
    if (typeof network !== "string") {
        throw new Error("Network name parameter is not a string.");
    }

    const sdk = networkToSdkMap.get(network);
    if (sdk === undefined) {
        throw new TypeError("There is no such network: " + network);
    }

    return sdk;
}
