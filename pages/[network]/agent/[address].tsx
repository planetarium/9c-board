import type { NextPage, GetServerSideProps } from "next"
import { getSdk } from "../../../utils/mimirGraphQLClient";
import { getNetworkType, getNodeType } from "../../../utils/network";

interface Agent {
    avatars: Avatar[];
}

interface Avatar {
    name: string;
    address: string;
    level: number;
    actionPoint: number;
}

interface AgentPageProps {
    agent: Agent | null
}

const AgentPage: NextPage<AgentPageProps> = ({ agent }) => {
    if (agent === null) {
        return (
            <h1>There is no such agent.</h1>
        )
    }

    return (
        <div>
            {agent.avatars.map(avatar => <p key={avatar.address} style={{
                margin: "2rem",
                padding: "1rem",
                borderColor: "black",
                border: "solid 1px"
            }}><a href={`../avatar/${avatar.address}`}>Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120)</a></p>)}
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<AgentPageProps> = async (context) => {
    const network = context.query.network;
    if (typeof (network) !== "string") {
        throw new Error("Network parameter is not a string.");
    }

    const address = context.query.address;
    if (typeof (address) !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const nodeType = getNodeType(network);
    const networkType = getNetworkType(network);
    const sdk = getSdk(networkType, nodeType);
    const agentJsonObj = await sdk.agent(address);
    if (agentJsonObj === null || agentJsonObj === undefined) {
        return {
            props: {
                agent: null,
            }
        }
    }

    return {
        props: {
            agent: {
                avatars: agentJsonObj.avatars
            },
        }
    }
}

export default AgentPage
