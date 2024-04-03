import type { NextPage, GetServerSideProps } from "next"
import { networkToSDK } from "../../../sdk";
import { Sdk } from "../../../generated/graphql-request";

export const runtime = 'edge';

interface TableSheetPageProps {
    tableSheet: string | null,
}

const TableSheetPage: NextPage<TableSheetPageProps> = ({tableSheet}) => {
    if (tableSheet === null) {
        return (
            <h1>There is no such table sheet.</h1>
        )
    }

    const lines = tableSheet.split("\n");
    const headerLine = lines[0];
    const contentLines = lines.slice(1).filter(x => x !== "");

    return (
        <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigator.clipboard.writeText(tableSheet)}>Copy sheet to clipboard</button>
            <table>
                <thead className="border-b">
                    <tr key="header">
                        {headerLine.split(",").map((h, index) => (<th className="text-sm mx-4 font-medium text-gray-900 px-6 py-4 text-left" key={`header-${index}`}>{h}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {contentLines.map((contentLine, contentLineIndex) => (
                        <tr key={`content-${contentLineIndex}`}>
                            {contentLine.split(",").map((v, index) => (<td className="text-sm mx-4 font-medium text-gray-900 px-6 py-4 text-left" key={`content-${contentLineIndex}-${index}}`}>{v}</td>))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const getHash = async (hash: string | undefined, index: string | undefined, sdk: Sdk) => {
    if (hash !== undefined && index !== undefined) {
        throw new Error("Both hash and index parameters are defined.");
    }

    if (hash !== undefined) {
        return hash;
    }

    if (index === undefined) {
        return undefined;
    }

    const indexHash = (await sdk.GetBlockHashByBlockIndex({index})).chainQuery.blockQuery?.block?.hash;
    if (indexHash === undefined) {
        throw new Error("Block hash is not found.");
    }

    return indexHash;
};

export const getServerSideProps: GetServerSideProps<TableSheetPageProps> = async (context) => {
    const name = context.query.name;
    const hash = context.query.hash;
    const index = context.query.index;

    if (typeof name !== "string") {
        throw new Error("Table sheet name parameter is not a string.");
    }

    if (hash !== undefined && typeof hash !== "string") {
        throw new Error("Block hash parameter is not a string.");
    }

    if (index !== undefined && typeof index !== "string") {
        throw new Error("Block index parameter is not a string.");
    }

    const sdk = networkToSDK(context);

    const blockHash = await getHash(hash, index, sdk);

    const address = require("node:crypto").createHmac("sha1", Buffer.from(name, "utf8"))
        .update(Buffer.from("0000000000000000000000000000000000000003", "hex"))
        .digest("hex");

    try {
        const state = Buffer.from((await sdk.RawState({address, hash: blockHash})).state, "hex");
        const tableSheet = require('bencodex').decode(state);

        if (typeof tableSheet !== "string") {
            throw new Error("Unexpected table sheet type");
        }

        if (tableSheet === null || tableSheet === undefined) {
            return {
                props: {
                    tableSheet: null,
                }
            }
        }

        return {
            props: {
                tableSheet,
            }
        }   
    } catch {
        return {
            props: {
                tableSheet: null,
            }
        }
    }
}

export default TableSheetPage
