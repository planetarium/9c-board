import type { NextPage, GetServerSideProps } from "next";
import { getSheet } from "../../../apiClient";
import { getNetworkType, getNodeType } from "../../../utils/network";

interface TableSheetPageProps {
  tableSheet: string | null;
}

const TableSheetPage: NextPage<TableSheetPageProps> = ({ tableSheet }) => {
  if (tableSheet === null) {
    return <h1>There is no such table sheet.</h1>;
  }

  const lines = tableSheet.split("\n");
  const headerLine = lines[0];
  const contentLines = lines.slice(1).filter((x) => x !== "");

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigator.clipboard.writeText(tableSheet)}
      >
        Copy sheet to clipboard
      </button>
      <table>
        <thead className="border-b">
          <tr key="header">
            {headerLine.split(",").map((h, index) => (
              <th
                className="text-sm mx-4 font-medium text-gray-900 px-6 py-4 text-left"
                key={`header-${index}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contentLines.map((contentLine, contentLineIndex) => (
            <tr key={`content-${contentLineIndex}`}>
              {contentLine.split(",").map((v, index) => (
                <td
                  className="text-sm mx-4 font-medium text-gray-900 px-6 py-4 text-left"
                  key={`content-${contentLineIndex}-${index}}`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network_info = context.query.network as string;
  const name = context.query.name as string;

  try {
    const sheet = await getSheet(
      getNodeType(network_info),
      getNetworkType(network_info),
      name
    );
    return { props: { tableSheet: sheet } };
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return { props: { tableSheet: null } };
  }
};

export default TableSheetPage;
