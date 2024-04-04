import type { NextPage, GetServerSideProps } from "next"
import { networkToSDK } from "../../../sdk";

export const config = { runtime: 'edge' };

interface Agent {
    gold: string;
    avatars: Avatar[];
}

interface Avatar {
    name: string;
    address: string;
    level: number;
    actionPoint: number;
}

interface AgentPageProps {
    agent: Agent | null,
    blockIndex: number,
}

const AgentPage: NextPage<AgentPageProps> = ({ agent, blockIndex }) => {
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
            }}><a href={`../avatar/${avatar.address}${blockIndex === -1 ? "" : `?blockIndex=${blockIndex}`}`}>Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120)</a></p>)}
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<AgentPageProps> = async (context) => {
    const address = context.query.address;
    if (typeof(address) !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const sdk = networkToSDK(context);

    const blockIndexString = context.query.blockIndex;
    const blockIndex = blockIndexString === undefined ? -1 : Number(blockIndexString);
    const hash = (await sdk.GetBlockHashByBlockIndex({
        index: (blockIndex as unknown) as string,  // Break assumption ID must be string.
    })).chainQuery.blockQuery?.block?.hash;

    const agent = await (await sdk.Agent({address})).stateQuery.agent;
    if (agent === null || agent === undefined) {
        return {
            props: {
                agent: null,
                blockIndex,
            }
        }
    }

    return {
        props: {
            agent: {
                gold: agent.gold,
                avatars: agent.avatarStates!
            },
            blockIndex
        }
    }
}

export default AgentPage
