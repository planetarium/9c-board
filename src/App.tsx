import React, { useEffect } from 'react';
import './App.css';
import axios from "axios";

interface RankingRowProps {
  data: [string, RankingInfo]
}

type Address = string

interface RankingInfo {
  exp: string;
  updatedAt: string;
  level: string;
  avatarAddress: string;
  stageClearedBlockIndex: string;
  armorId: string;
  avatarName: string;
  agentAddress: string;
}

interface AddressRankingInfoMap {
  [address: string]: RankingInfo
}

interface RankingState {
  map: AddressRankingInfoMap
  address: Address
}

interface RankingStateResponse {
  value: RankingState
}

const RankingRow: React.FC<RankingRowProps> = (props) => (
  <div>{props.data[1].avatarName.split(' ')[0]}#{props.data[0].substring(0, 6)} - exp={props.data[1].exp}</div>
);

const HOST = "http://a4af4ffa3787011ea824802399f8ed0e-2108883843.ap-northeast-2.elb.amazonaws.com";

const App: React.FC = () => {
  const [value, setValue] = React.useState<RankingState>();

  const getStateUrl = (address: string) => `${HOST}/state/${address}`;

  const loadRankingState = () => {
    const RANKING_STATE_URL = getStateUrl("0000000000000000000000000000000000000001");
    axios.get<RankingStateResponse>(RANKING_STATE_URL).then(({ data: { value } }) => {
      setValue(value);
    });
  }

  useEffect(() => loadRankingState());
  
  const rankingRows = value === undefined
    ? (<>Loading</>)
    : Object.entries(value?.map || []).map((xs: [string, RankingInfo]) => (<RankingRow data={xs}/>));

  return (
    <>
      <h1>Ranking</h1>
      {rankingRows}
    </>
  );
}

export default App;
