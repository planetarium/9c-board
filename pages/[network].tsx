import type { NextPage, GetServerSideProps } from "next";
import { getHeadlessGraphQLSDK } from "../../../utils/headlessGraphQLClient";
import { useRef, useState } from "react";

interface NetworkPageProps {
    network: string;
}

interface Feature {
    name: string;
    hint: string;
    targetTemplate: string;
}

const SUPPORTED_FEATURES: Feature[] = [
    {
        name: 'agent',
        hint: 'Fill with agent address.',
        targetTemplate: "agent/<value>"
    },
    {
        name: 'avatar',
        hint: 'Fill with avatar address.',
        targetTemplate: "avatar/<value>"
    },
    {
        name: 'stake',
        hint: 'Fill with agent address.',
        targetTemplate: "stake/<value>"
    },
    {
        name: 'raw',
        hint: 'Fill with any address to lookup raw state.',
        targetTemplate: "raw/<value>"
    },
    {
        name: 'tablesheet',
        hint: 'Fill with table name. (e.g., StakePolicySheet)',
        targetTemplate: "tablesheet/<value>"
    },
] as const;

const NetworkPage: NextPage<NetworkPageProps> = ({ network }) => {
    const [input, setInput] = useState("");
    const [feature, setFeature] = useState(0);
    const currentFeature = SUPPORTED_FEATURES[feature];
    const url = `${network}/${currentFeature.targetTemplate.replace("<value>", input)}`;
    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2">
            <p className="text-4xl font-extrabold pb-4">{network}</p>
            <p>{currentFeature.hint}</p>
            <div className="flex flex-row">
                <select onChange={e => setFeature(Number(e.target.value))} className="flex text-center border-2 border-solid border-black p-3">
                    {SUPPORTED_FEATURES.map((feature, index) => <option key={index} value={index}>{feature.name}</option>)}
                </select>
                <input onChange={e => setInput(e.target.value)} className="border-solid border-black border-2 p-3 w-96" />
                <a href={url}><button className="ml-5 border-2 border-black border-solid p-3 w-24">GO</button></a>
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<NetworkPageProps> = async (
    context
) => {
    const network = context.query.network;
    if (typeof (network) !== "string") {
        throw new Error("Network parameter is not a string.");
    }

    return {
        props: {
            network,
        },
    };
};

export default NetworkPage;
