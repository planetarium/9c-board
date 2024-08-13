import type { NextPage, GetServerSideProps } from "next";
import { getBalance, PlanetName } from "../../../utils/apiClient";
import { getMimirGraphQLSDK } from "../../../utils/mimirGraphQLClient";
import { getPlanetName, } from "../../../utils/network";
import { Network } from "../../../constants/network";

const AGENT_CURRENCY_TICKERS = [
    "CRYSTAL",
] as const;
const AVATAR_CURRENCY_TICKERS = [
    "RUNESTONE_FENRIR1",
    "RUNESTONE_FENRIR2",
    "RUNESTONE_FENRIR3",
    "RUNESTONE_SAEHRIMNIR1",
    "RUNESTONE_SAEHRIMNIR2",
    "RUNESTONE_SAEHRIMNIR3",
    "RUNESTONE_VAMPIRIC",
    "RUNESTONE_STUN",
    "RUNE_GOLDENLEAF",
    "RUNE_ADVENTURER",
    "SOULSTONE_1001",
    "SOULSTONE_1002",
    "SOULSTONE_1003",
    "SOULSTONE_1004",
] as const;

interface FAV {
    ticker: string;
    amount: number;
}

interface Avatar {
    address: string;
    name: string;
    level: number;
    actionPoint: number;
    favs: FAV[];
    inventory: Inventory;
}

interface Inventory {
    items: Item[];
}

interface Item {
    itemSheetId: number;
    grade: number;
    itemType: string;
    itemSubType: string;
    elementalType: string;
    count: number;
    requiredBlockIndex: number | null;
    nonFungibleId: string | null;
}

interface AvatarPageProps {
    avatar: Avatar | null;
}

const AvatarPage: NextPage<AvatarPageProps> = ({ avatar }) => {
    if (avatar === null) {
        return <h1>There is no avatar.</h1>;
    }

    if (avatar.name === null || avatar.name === undefined) {
        return <h1>Cannot find avatar. ({avatar.address})</h1>;
    }

    const aggregatedItems = new Map<number, number>();
    for (const { itemSheetId, count } of avatar.inventory.items) {
        aggregatedItems.set(itemSheetId, (aggregatedItems.get(itemSheetId) || 0) + count);
    }

    return (
        <>
            <p>
                Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120)
            </p>
            <h1 className="text-3xl font-extrabold mt-10 mb-5">FAVs</h1>
            <div className="grid grid-cols-6 content-center">
                {avatar.favs
                    .filter((x) => x.amount > 0)
                    .map(({ ticker, amount }) => (
                        <div className="" key={ticker}>
                            <img
                                className="inline m-1 w-10 h-10"
                                title={String(ticker)}
                                src={`https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/FungibleAssetValue/${ticker}.png`}
                            />
                            <span className="font-bold">{amount}</span>
                        </div>
                    ))}
            </div>
            <h1 className="text-3xl font-extrabold mt-10 mb-5">Inventory</h1>
            <div className="flex flex-row flex-wrap space-y-3">
                {Array.from(aggregatedItems.entries()).map(([id, count]) => (
                    <div
                        className="inline-flex w-28 h-20 border-solid border-2 border-gray-600 content-center"
                        key={id}
                    >
                        {/* FIXME: MAKE THIS URL CONFIGURABLE BY USER */}
                        <img
                            className="w-16 h-16"
                            title={String(id)}
                            src={`https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/${id}.png`}
                        />{" "}
                        <span className="font-bold">{count}</span>
                    </div>
                ))}
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<AvatarPageProps> = async (
    context
) => {
    const network = context.query.network;
    if (typeof (network) !== "string") {
        throw new Error("Network parameter is not a string.");
    }

    const address = context.query.address;
    if (typeof address !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const planetName = getPlanetName(network);
    const avatarJsonObj = (await getMimirGraphQLSDK(network).GetAvatar({
        avatarAddress: address,
    })).avatar;

    if (!avatarJsonObj) {
        return {
            props: {
                avatar: null,
            }
        }
    }

    const inventoryJsonObj = avatarJsonObj.inventory;
    const inventoryObj = parseToInventory(inventoryJsonObj);
    const agentBalanceJsonObjs = await getBalances(
        planetName,
        AGENT_CURRENCY_TICKERS,
        avatarJsonObj.agentAddress);
    const avatarBalanceJsonObjs = await getBalances(
        planetName,
        AVATAR_CURRENCY_TICKERS,
        address);

    function parseToInventory(inventoryJsonObj: any | null): Inventory {
        if (inventoryJsonObj === null) {
            return {
                items: [],
            };
        }

        const consumables = inventoryJsonObj.consumables?.map(parseToItem) ?? [];
        const costumes = inventoryJsonObj.costumes?.map(parseToItem) ?? [];
        const equipments = inventoryJsonObj.equipments?.map(parseToItem) ?? [];
        const materials = inventoryJsonObj.materials?.map(parseToItem) ?? [];
        return {
            items: consumables.concat(costumes).concat(equipments).concat(materials),
        };
    }

    function parseToItem(itemJsonObj: any): Item {
        return {
            itemSheetId: itemJsonObj.itemSheetId,
            grade: itemJsonObj.grade,
            itemType: itemJsonObj.itemType,
            itemSubType: itemJsonObj.itemSubType,
            elementalType: itemJsonObj.elementalType,
            count: itemJsonObj.count,
            requiredBlockIndex: itemJsonObj.requiredBlockIndex,
            nonFungibleId: itemJsonObj.nonFungibleId,
        };
    }

    async function getBalances(
        network: Network,
        tickers: readonly string[],
        address: any | null
    ): Promise<FAV[]> {
        if (address === null) {
            return [];
        }

        const balanceJsonObjects = await Promise.all(
            tickers.map(
                ticker => getBalance(
                    network,
                    address,
                    ticker
                )
            )
        );
        return balanceJsonObjects.map((resp, index) => {
            return {
                ticker: tickers[index],
                amount: resp === null ? 0 : parseFloat(resp.quantity),
            };
        });
    }

    return {
        props: {
            avatar: {
                address: avatarJsonObj.address,
                name: avatarJsonObj.name!,
                actionPoint: avatarJsonObj.actionPoint!,
                level: avatarJsonObj.level!,
                favs: agentBalanceJsonObjs.concat(avatarBalanceJsonObjs),
                inventory: inventoryObj,
            },
        },
    };
};

export default AvatarPage;
