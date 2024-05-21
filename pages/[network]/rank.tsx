import type { NextPage, GetServerSideProps } from 'next'
import { RankRow, RankRowProps } from '../../components/rank/RankRow'
import { networkToSDK } from '../../sdk'

interface RankProps {
  rows: RankRowProps[]
}

const Rank: NextPage<RankProps> = ({ rows }) => {
  return (
    <div className="h-screen w-full md:w-auto">
      {rows.map((row) => <RankRow key={row.rank} {...row} />)}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<RankProps> = async (context) => {
  const network = context.query.network;
  if (typeof(network) !== "string") {
    throw new Error("Network parameter is not a string.");
  }

  const page = context.query.page || "0";
  if (typeof(page) !== "string") {
    throw new Error("Page parameter is not a string.");
  }

  const sdk = networkToSDK(network);

  const res = await sdk.RankingMap({
    index: parseInt(page),
  });
  let rows = res.stateQuery.rankingMap?.rankingInfos.map((info: any, index: any) => {
    return {
      name: info.avatarName,
      rank: index,
      avatarAddress: info.avatarAddress,
    }
  }) || [];
  return {
    props: {
      rows
    }
  }
}

export default Rank
