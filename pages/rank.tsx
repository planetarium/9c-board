import type { NextPage, GetServerSideProps } from 'next'
import { RankRow, RankRowProps } from '../components/rank/RankRow'
import SDK from "../sdk"

interface RankProps {
  rows: RankRowProps[]
}

const Rank: NextPage<RankProps> = ({ rows }) => {
  return (
    <div className="h-screen w-full md:w-auto">
      {rows.map((row) => <RankRow key={row.rank} {...row}/>)}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<RankProps> = async (context) => {
  const page = context.query.page || "0";
  if (typeof(page) !== "string") {
    throw new Error("Page parameter is not a string.");
  }

  const res = await SDK.RankingMap({
    index: parseInt(page),
  });
  let rows = res.stateQuery.rankingMap?.rankingInfos.map((info, index) => {
    return {
    name: info.avatarName,
    rank: index,
    avatarAddress: info.avatarAddress,
  }}) || [];
  return {
    props: {
      rows
    }
  }
}

export default Rank
