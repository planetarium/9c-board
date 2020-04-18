import React, { useEffect } from 'react';
import { RankingInfo, RankingState } from '../lib/state/rank';
import axios from "axios";

interface RankingRowProps {
    data: [string, RankingInfo]
}

interface RankingStateResponse {
    value: RankingState
}

const RankingRow: React.FC<RankingRowProps> = (props) => (
    <div>{props.data[1].avatarName.split(' ')[0]}#{props.data[0].substring(0, 6)} - exp={props.data[1].exp}</div>
);

// FIXME: code redundancy.
const HOST = "https://9c-state.planetarium.dev";

export const RankPage: React.FC = () => {
    const [value, setValue] = React.useState<RankingState>();

    const getStateUrl = (address: string) => `${HOST}/state/${address}`;

    const loadRankingState = () => {
        const RANKING_STATE_URL = getStateUrl("0000000000000000000000000000000000000001");
        axios.get<RankingStateResponse>(RANKING_STATE_URL).then(({ data: { value } }) => {
            setValue(value);
        });
    }

    useEffect(() => loadRankingState());

    const compareNumber = (x: number, y: number) => {
        if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        } else {
            return 0;
        }
    }

    const compareFn = (xs: [string, RankingInfo], ys: [string, RankingInfo]) => {
        const exps = [Number(xs[1].exp), Number(ys[1].exp)];
        return compareNumber(exps[0], exps[1]);
    }

    const rankingRows = value === undefined
        ? (<>Loading</>)
        : Object.entries(value.map).sort(compareFn).map((xs: [string, RankingInfo]) => (<RankingRow data={xs} />));

    return (
        <>
            <h1>Ranking</h1>
            {rankingRows}
        </>
    );
}
