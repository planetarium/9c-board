import type { NextPage, GetServerSideProps } from 'next'
import { RankRow, RankRowProps } from '../components/rank/RankRow'
import { getSdk } from "../generated/graphql-request"

import { GraphQLClient } from "graphql-request"

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
  if (process.env.GRAPHQL_ENDPOINT === undefined || process.env.HASURA_ADMIN_SECRET === undefined) {
    throw new Error("All required environment variables are not set.");
  }

  const page = context.query.page || "0";
  if (typeof(page) !== "string") {
    throw new Error("Page parameter is not a string.");
  }

  const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT);
  client.setHeader("x-hasura-admin-secret", process.env.HASURA_ADMIN_SECRET);
  const headlessGraphQLSDK = getSdk(client);
  const res = await headlessGraphQLSDK.RankingMap({
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
