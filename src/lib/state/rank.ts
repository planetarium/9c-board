import { Address } from ".";

export interface RankingInfo {
    exp: string;
    updatedAt: string;
    level: string;
    avatarAddress: string;
    stageClearedBlockIndex: string;
    armorId: string;
    avatarName: string;
    agentAddress: string;
};

interface AddressRankingInfoMap {
    [address: string]: RankingInfo
};

export interface RankingState {
    map: AddressRankingInfoMap
    address: Address
};
