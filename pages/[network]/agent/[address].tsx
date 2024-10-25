import type { NextPage, GetServerSideProps } from "next"
import { getHeadlessGraphQLSDK } from "../../../utils/headlessGraphQLClient";

interface Agent {
    avatars: Avatar[];
    address: string;
}

interface Avatar {
    address: string;
    name: string;
    level: number;
    actionPoint: number;
}

interface AgentPageProps {
    network: string;
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

const AgentPage: NextPage<AgentPageProps> = ({ agent, network }) => {
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
            <a href = {`/${network}/stake/${agent.address}`} ><button style={style}>Go to Stake</button></a>
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

    const mimir = getHeadlessGraphQLSDK(network);
    const agentJsonObj = (await mimir.Agent({ address: address })).stateQuery.agent;
    if (agentJsonObj === null || agentJsonObj === undefined) {
        return {
            props: {
                agent: null,
                network: network,
            }
        }
    }

    return {
        props: {
            agent: {
                avatars: agentJsonObj.avatarStates as Avatar[],
                address: address,
            },
            network: network,
        }
    }
}

export default AgentPage
