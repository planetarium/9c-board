import { getSdk } from "./generated/graphql-request";
import { GraphQLClient } from "graphql-request"

if (process.env.MAINNET_GRAPHQL_ENDPOINT === undefined || process.env.INTERNAL_GRAPHQL_ENDPOINT === undefined) {
    throw new Error("All required environment variables are not set.");
}

const client = new GraphQLClient(process.env.MAINNET_GRAPHQL_ENDPOINT);
const headlessGraphQLSDK = getSdk(client);

const internalNetworkClient = new GraphQLClient(process.env.INTERNAL_GRAPHQL_ENDPOINT);
export const internalGraphQLSDK = getSdk(internalNetworkClient);

export default headlessGraphQLSDK;
