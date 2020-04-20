import React, { useEffect } from 'react';
import { RankingInfo, RankingState } from '../lib/state/rank';
import { getState } from '../api/state';
import styled from 'styled-components';

interface RankingRowProps {
    data: [string, RankingInfo];
    rank: number;
}

const RankingRowComponent = styled.a`
    text-decoration: none;
    color: black;
    height: 25px;
    line-height: 25px;
    display: block;
`;

const RankingRow: React.FC<RankingRowProps> = (props) => (
    <RankingRowComponent href={`/state/${props.data[1].avatarAddress}`}>
        {props.rank}. {props.data[1].avatarName.split(' ')[0]}#{props.data[0].substring(0, 6)} - exp={props.data[1].exp}
    </RankingRowComponent>
);

export const RankPage: React.FC = () => {
    const [value, setValue] = React.useState<RankingState>();

    const RANKING_STATE_ADDRESS = "0000000000000000000000000000000000000001";

    const loadRankingState = () => {
        getState<RankingState>(RANKING_STATE_ADDRESS).then((value) => {
            setValue(value);
        });
    }

    useEffect(() => loadRankingState(), []);

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
        : Object.entries(value.map)
            .sort(compareFn)
            .map((xs: [string, RankingInfo], index: number) => (<RankingRow data={xs} rank={index + 1} />));

    return (
        <>
            <h1>Ranking</h1>
            <desc>If you click the name, you can see the avatar's state. <span role="img">😀</span></desc>
            <hr/>
            {rankingRows}
        </>
    );
}
