import React from 'react';
import styled from 'styled-components';
import { useRankingMapQuery, RankingRowFragment } from "../generated/graphql"

interface RankingRowProps {
    data: RankingRowFragment;
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
    <RankingRowComponent href={`/state/${props.data.avatarAddress}`}>
        {props.rank}. {props.data.avatarName.split(' ')[0]}#{props.data.avatarAddress.substring(2, 8)} - exp={props.data.exp}
    </RankingRowComponent>
);

export const RankPage: React.FC = () => {
    const { loading, data, refetch, error } = useRankingMapQuery({
        variables: {
            index: 0,
        }
    });

    const compareNumber = (x: number, y: number) => {
        if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        }

        return 0;
    }

    const compareFn = (x: RankingRowFragment, y: RankingRowFragment) => compareNumber(x.exp, y.exp);
    const rankingRows = loading || data === undefined
        ? (<>Loading</>)
        : data.stateQuery.rankingMap?.rankingInfos.slice().sort(compareFn)
            .map((x, index) => (<RankingRow data={x} rank={index + 1} />));

    if (error) {
        console.error(error);
        return (
            <button onClick={_ => refetch()}>Retry button</button>
        )
    }

    return (
        <>
            <h1>Ranking</h1>
            <desc>If you click the name, you can see the avatar's state. <span role="img" aria-label="Smiling face">😀</span></desc>
            <hr/>
            {rankingRows}
        </>
    );
}
