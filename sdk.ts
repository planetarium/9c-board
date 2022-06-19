import { getSdk } from "./generated/graphql-request";
import { GraphQLClient } from "graphql-request"

if (process.env.GRAPHQL_ENDPOINT === undefined || process.env.HASURA_ADMIN_SECRET === undefined) {
    throw new Error("All required environment variables are not set.");
}

const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT);
client.setHeader("x-hasura-admin-secret", process.env.HASURA_ADMIN_SECRET);
const headlessGraphQLSDK = getSdk(client);

export default headlessGraphQLSDK;
