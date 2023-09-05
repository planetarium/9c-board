import type { NextPage, GetServerSideProps } from "next"
import { networkToSDK } from "../../../network-util";
import { BencodexList, decode } from "bencodex";
import React from "react";
import * as crypto from "node:crypto";

interface StakeStateV1 {
    version: 1,
    deposit: number;
    cancellableBlockIndex: number;
    receivedBlockIndex: number;
    startedBlockIndex: number;
}

interface StakeStateV2 {
    version: 2,
    deposit: number,
    receivedBlockIndex: number;
    startedBlockIndex: number;
    contract: Contract
}

interface Contract {
    stakeRegularRewardSheetTableName: string;
    stakeRegularFixedRewardSheetTableName: string;

    rewardInterval: number;
    lockupInterval: number;
}

interface StakePageProps {
    stakeState: StakeStateV1 | StakeStateV2 | null,
    blockIndex: number,
}

const TableSheetLinkButton: React.FC<{ tableName: string, blockIndex: number }> = ({ tableName, blockIndex }) => {
    return <a href={`../tablesheet/${tableName}?index=${blockIndex}`}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Link</button>
    </a>
}

const StakePage: NextPage<StakePageProps> = ({ stakeState, blockIndex }) => {
    if (stakeState === null) {
        return (
            <h1>There is no such stakeState.</h1>
        )
    }

    if (stakeState.version === 1) {
        return (
            <div>
                <p>Version: {stakeState.version}</p>
                <p>Deposit: {stakeState.deposit}</p>
                <p>StartedBlockIndex: {stakeState.startedBlockIndex}</p>
                <p>ReceivedBlockIndex: {stakeState.receivedBlockIndex}</p>
                <p>CancellableBlockIndex: {stakeState.cancellableBlockIndex}</p>
            </div>
        )
    }

    if (stakeState.version === 2) {
        return (
            <div>
                <p>Version: {stakeState.version}</p>
                <p>Deposit: {stakeState.deposit}</p>
                <p>StartedBlcokIndex: {stakeState.startedBlockIndex}</p>
                <p>ReceivedBlockIndex: {stakeState.receivedBlockIndex}</p>
                <div>
                    <h3>Contract</h3>
                    <p>StakeRegularRewardSheet: {stakeState.contract.stakeRegularRewardSheetTableName} <TableSheetLinkButton tableName={stakeState.contract.stakeRegularRewardSheetTableName} blockIndex={blockIndex} /></p>
                    <p>StakeRegularFixedRewardSheet: {stakeState.contract.stakeRegularFixedRewardSheetTableName} <TableSheetLinkButton tableName={stakeState.contract.stakeRegularFixedRewardSheetTableName} blockIndex={blockIndex} /></p>
                    <p>Lockup Interval: {stakeState.contract.lockupInterval}</p>
                    <p>Reward Interval: {stakeState.contract.rewardInterval}</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            Maybe under construction... Contact developers.
        </div>
    )
}

type HexString = string;

function deserializeStakeState(state: HexString | null): Omit<StakeStateV1, "deposit"> | Omit<StakeStateV2, "deposit"> | null {
    if (state === null) {
        return null;
    }

    const decoded = decode(Buffer.from(state, "hex"));
    if (decoded instanceof Map) {
        if (!decoded.has("cbi") || !decoded.has("rbi2") || !decoded.has("sbi")) {
            throw new TypeError("Invalid StakeStateV1");
        }

        const cancellableBlockIndex = Number(decoded.get("cbi") as bigint);
        const receivedBlockIndex = Number(decoded.get("rbi2") as bigint);
        const startedBlockIndex = Number(decoded.get("sbi") as bigint);

        return {
            version: 1,
            cancellableBlockIndex,
            receivedBlockIndex,
            startedBlockIndex,
        }

    }

    if (decoded instanceof Array) {
        if (decoded[0] !== "stake_state") {
            throw new TypeError("This is not StakeState");
        }

        if (decoded[1] !== BigInt(2)) {
            throw new TypeError("This is not StakeStateV2");
        }

        if (decoded.length !== 5 || !(decoded[2] instanceof Array) || typeof decoded[3] !== "bigint" || typeof decoded[4] !== "bigint") {
            throw new TypeError("Invalid StakeStateV2");
        }

        return {
            version: 2,
            contract: deserializeStakeStateContract(decoded[2]),
            startedBlockIndex: Number(decoded[3]),
            receivedBlockIndex: Number(decoded[4]),
        }
    }

    return null;
}

function deserializeStakeStateContract(state: BencodexList): Contract {
    if (state.length !== 6 || state[0] !== "stake_contract" || state[1] !== BigInt(1) || typeof state[2] !== "string" || typeof state[3] !== "string" || typeof state[4] !== "bigint" || typeof state[5] !== "bigint") {
        throw new TypeError("Invalid StakeState Contract.")
    }

    return {
        stakeRegularFixedRewardSheetTableName: state[2],
        stakeRegularRewardSheetTableName: state[3],
        rewardInterval: Number(state[4]),
        lockupInterval: Number(state[5]),
    }
}

type Address = string & { __new_type_id: "Address" };
function isAddress(value: any): value is Address {
    return typeof value === "string" && value.startsWith("0x") && value.length === 42;
}

async function deriveAddress(
    address: Address,
    deriveKey: string
  ): Promise<Address> {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(deriveKey),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
  
    const result = await crypto.subtle.sign("HMAC", key, Buffer.from(address.substring(2), "hex"));
    const resultAddress = "0x" + Buffer.from(result).toString("hex");
    return resultAddress as Address;
}

export const getServerSideProps: GetServerSideProps<StakePageProps> = async (context) => {
    const address = context.query.address;
    if (!isAddress(address)) {
        throw new Error("Address parameter is not an address.");
    }

    const sdk = networkToSDK(context);

    const blockIndexString = context.query.blockIndex || context.query.index;
    const blockIndex = blockIndexString === undefined ? -1 : Number(blockIndexString);
    const hash = (await sdk.GetBlockHashByBlockIndex({
        index: (blockIndex as unknown) as string,  // Break assumption ID must be string.
    })).chainQuery.blockQuery?.block?.hash;

    const stakeStateAddress = await deriveAddress(address, "stake");
    console.log(stakeStateAddress);
    let rawState;
    try {
        rawState = (await sdk.RawState({address: stakeStateAddress, hash})).state as HexString | null;;
    } catch (e) {
        console.warn(e)
        rawState = null;
    }

    const stakeState = deserializeStakeState(rawState);
    const stakeStateDeposit = parseFloat((await sdk.GetGoldBalance({address: stakeStateAddress, hash})).goldBalance);

    return {
        props: {
            stakeState: stakeState === null ? null : {
                ...stakeState,
                deposit: stakeStateDeposit
            },
            blockIndex
        }
    }
}

export default StakePage
