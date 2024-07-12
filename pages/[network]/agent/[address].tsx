import type { NextPage, GetServerSideProps } from "next"
import { getGraphQLSDK } from "../../../utils/mimirGraphQLClient";

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

function Avatar(avatar: Avatar) {
    const style = {
        margin: "2rem",
        padding: "1rem",
        borderColor: "black",
        border: "solid 1px",
    };

    if (avatar.name === null || avatar.name === undefined) {
        return (
            <p key={avatar.address} style={style}>
                <a href={`../avatar/${avatar.address}`}>Not found ({avatar.address})</a>
            </p>
        );
    }

    return (
        <p key={avatar.address} style={style}>
            <a href={`../avatar/${avatar.address}`}>
                Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120) ({avatar.address})
            </a>
        </p>
    );
}

const AgentPage: NextPage<AgentPageProps> = ({ agent }) => {
    if (agent === null) {
        return (
            <h1>There is no such agent.</h1>
        )
    }

    const style = {
        margin: "2rem",
        padding: "1rem",
        borderColor: "black",
        border: "solid 1px"
    };

    return (
        <div>
            {agent.avatars.map(avatar => <Avatar key={avatar.address} {...avatar} />)}
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

    const sdk = getGraphQLSDK(network);
    const agentJsonObj = (await sdk.GetAgent({ agentAddress: address, })).agent;
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
                avatars: agentJsonObj.avatars as Avatar[],
            },
        }
    }
}

export default AgentPage
