import type { NextPage, GetServerSideProps } from "next"
import { networkToSDK } from "../../../utils/headlessGraphQLClient";
import { decode } from "bencodex";
import React from "react";
import { JSONTree } from "react-json-tree";

interface RawStatePageProps {
    state: string | null
}

function toJSON(state: unknown): any {
    if (state === null) {
        return null;
    }

    if (typeof state === "string" || typeof state === "number") {
        return state;
    }

    if (typeof state === "bigint") {
        return Number(state);
    }

    if (state instanceof Buffer) {
        return "(bytes-hex) " + state.toString("hex");
    }

    if (state instanceof Uint8Array) {
        return "(bytes-hex) " + Buffer.from(state).toString("hex");
    }

    if (state instanceof Array) {
        return state.map(toJSON);
    }

    if (state instanceof Map) {
        const obj: Record<string, any> = {};
        for (const [key, value] of state.entries()) {
            obj[toJSON(key) as string] = toJSON(value);
        }

        return obj;
    }

    return state;
}

const RawStatePage: NextPage<RawStatePageProps> = ({ state }) => {
    if (state === null) {
        return (
            <h1>There is no such state.</h1>
        )
    }

    const data = toJSON(decode(Buffer.from(state, "hex")) || null);
    const theme = {
        scheme: 'monokai',
        author: 'wimer hazenberg (http://www.monokai.nl) / Dogeon Lee',
        description: "Base on monokai theme, base00 is updated.",
        base00: '#000000',
        base01: '#383830',
        base02: '#49483e',
        base03: '#75715e',
        base04: '#a59f85',
        base05: '#f8f8f2',
        base06: '#f5f4f1',
        base07: '#f9f8f5',
        base08: '#f92672',
        base09: '#fd971f',
        base0A: '#f4bf75',
        base0B: '#a6e22e',
        base0C: '#a1efe4',
        base0D: '#66d9ef',
        base0E: '#ae81ff',
        base0F: '#cc6633',
    };

    return (
        <div className="p-10">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigator.clipboard.writeText(state)}>Copy raw state (hex) to clipboard</button>
            <div className="m-4">
                <JSONTree data={data} sortObjectKeys hideRoot invertTheme={true} theme={theme} valueRenderer={(raw) => {
                    if (typeof raw === "string" && raw.startsWith("\"(bytes-hex)")) {
                        const substr = raw.substring(13, raw.length - 1);
                        if (/^[0-9a-fA-F]{40}$/.test(substr)) {
                            return <a href={`0x${substr}`}><strong className="text-blue-500">{`0x${substr}`}</strong><span> (Address-like)</span></a>
                        }

                        if (/^[0-9a-fA-F]{32}$/.test(substr)) {
                            const guidBuffer = Buffer.from(substr, "hex");
                            const guid = `${guidBuffer.subarray(0, 4).reverse().toString("hex")
                                }-${guidBuffer.subarray(4, 6).reverse().toString("hex")
                                }-${guidBuffer.subarray(6, 8).reverse().toString("hex")
                                }-${guidBuffer.subarray(8, 10).toString("hex")
                                }-${guidBuffer.subarray(10).toString("hex")
                                }`

                            return <span>{guid} (Guid-like)</span>
                        }
                    }

                    return <span>{raw as any}</span>;
                }} />
            </div>
        </div>
    )
}

type HexString = string;

type Address = string & { __new_type_id: "Address" };
function isAddress(value: any): value is Address {
    return typeof value === "string" && value.startsWith("0x") && value.length === 42;
}

export const getServerSideProps: GetServerSideProps<RawStatePageProps> = async (context) => {
    const network = context.query.network;
    if (typeof (network) !== "string") {
        throw new Error("Network parameter is not a string.");
    }

    const address = context.query.address;
    if (!isAddress(address)) {
        throw new Error("Address parameter is not an address.");
    }

    const sdk = networkToSDK(network);

    const blockIndexString = context.query.blockIndex || context.query.index;
    const blockIndex = blockIndexString === undefined ? -1 : Number(blockIndexString);
    const hash = (await sdk.GetBlockHashByBlockIndex({
        index: (blockIndex as unknown) as string,  // Break assumption ID must be string.
    })).chainQuery.blockQuery?.block?.hash;

    let rawState;
    try {
        rawState = (await sdk.RawState({ address, hash })).state as HexString | null;;
    } catch (e) {
        console.warn(e)
        rawState = null;
    }

    return {
        props: {
            state: rawState,
        }
    }
}

export default RawStatePage
