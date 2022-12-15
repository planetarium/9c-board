import type { NextPage, GetServerSideProps } from "next"
import SDK from "../../sdk";

interface TableSheetPageProps {
    tableSheet: string | null,
}

const TableSheetPage: NextPage<TableSheetPageProps> = ({tableSheet}) => {
    if (tableSheet === null) {
        return (
            <h1>There is no such table sheet.</h1>
        )
    }

    const lines = tableSheet.split("\r\n");
    const headerLine = lines[0];
    const contentLines = lines.slice(1).filter(x => x !== "");

    return (
        <div>
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

export const getServerSideProps: GetServerSideProps<TableSheetPageProps> = async (context) => {
    const name = context.query.name;

    if (typeof name !== "string") {
        throw new Error("Table sheet name parameter is not a string.");
    }

    const address = require("node:crypto").createHmac("sha1", Buffer.from(name, "utf8"))
        .update(Buffer.from("0000000000000000000000000000000000000003", "hex"))
        .digest("hex");

    try {
        const state = Buffer.from((await SDK.RawState({address})).state, "hex");
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
