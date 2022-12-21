import { getSdk } from "./generated/graphql-request";
import { GraphQLClient } from "graphql-request"

if (process.env.MAINNET_GRAPHQL_ENDPOINT === undefined) {
    throw new Error("All required environment variables are not set.");
}

const client = new GraphQLClient(process.env.MAINNET_GRAPHQL_ENDPOINT);
const headlessGraphQLSDK = getSdk(client);

export default headlessGraphQLSDK;
