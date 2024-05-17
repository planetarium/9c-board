import type { NextPage, GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { getSheetNames } from "../../../apiClient";
import { getNetworkType, getNodeType } from "../../../utils/network";

export const config = { runtime: "edge" };

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network_info = context.query.network as string;

  try {
    const sheetNames = await getSheetNames(
      getNodeType(network_info),
      getNetworkType(network_info)
    );
    return { props: { sheetNames } };
  } catch (error) {
    console.error("Error fetching sheet names:", error);
    return { props: { sheetNames: [] } };
  }
};

interface SheetsNamesPageProps {
  sheetNames: string[];
}

const TableSheetsPage: NextPage<SheetsNamesPageProps> = ({ sheetNames }) => {
  const router = useRouter();
  const { network } = router.query;

  return (
    <div className="flex gap-2 m-4 w-full flex-wrap">
      {sheetNames.map((v, index) => {
        return (
          <div key={`${v}-${index}`}>
            <Link href={`/${network}/tablesheet/${v}`}>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {v}
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default TableSheetsPage;
