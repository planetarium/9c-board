import type { NextPage, GetServerSideProps } from "next";
import { getAvatar, getAvatarInventory } from "../../../apiClient";
import { networkToSDK } from "../../../sdk";
import { CurrencyInput } from "../../../generated/graphql-request";
import { getNetworkType, getNodeType } from "../../../utils/network";

const CURRENCIES: CurrencyInput[] = [
    {
        ticker: "CRYSTAL",
        decimalPlaces: 18,
        minters: [],
    },
];

const TICKERS = [
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
for (const ticker of TICKERS) {
    CURRENCIES.push({
        ticker: ticker,
        decimalPlaces: 0,
        minters: [],
    });
}

interface FAV {
    ticker: string;
    amount: number;
}

interface Avatar {
    name: string;
    level: number;
    actionPoint: number;
    favs: FAV[];
    inventory: Inventory;
}

interface Inventory {
    items: ItemEntry[];
}

interface ItemEntry {
    item: Item;
    count: number;
}

interface Item {
    elementalType: string;
    grade: number;
    id: number;
    itemId: string | null;
    itemSubType: string;
    itemType: string;
    requiredBlockIndex: number | null;
}

interface AvatarPageProps {
    avatar: Avatar | null;
}

const AvatarPage: NextPage<AvatarPageProps> = ({ avatar }) => {
    if (avatar === null) {
        return <h1>There is no avatar.</h1>;
    }

    const aggregatedItems = new Map<number, number>();
    for (const { item, count } of avatar.inventory.items) {
        aggregatedItems.set(item.id, (aggregatedItems.get(item.id) || 0) + count);
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
    if (typeof(network) !== "string") {
        throw new Error("Network parameter is not a string.");
    }

    const address = context.query.address;
    if (typeof address !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const sdk = networkToSDK(network);

    const blockIndexString = context.query.blockIndex;
    const blockIndex =
        blockIndexString === undefined ? -1 : Number(blockIndexString);
    const hash = (
        await sdk.GetBlockHashByBlockIndex({
            index: blockIndex as unknown as string, // Break assumption ID must be string.
        })
    ).chainQuery.blockQuery?.block?.hash;

    const avatarJsonObj = await getAvatar(
        getNodeType(network),
        getNetworkType(network),
        address);
    const inventoryJsonObj = await getAvatarInventory(
        getNodeType(network),
        getNetworkType(network),
        address);
    const inventoryObj = parseToInventory(inventoryJsonObj);

    const fetchedFavs = await Promise.all(
        CURRENCIES.map(
            (currency) => sdk.GetBalance({
                currency: currency,
                address: currency.ticker === "CRYSTAL" ? avatarJsonObj.agentAddress : address,
                hash: hash,
            })
        )
    );
    const favs = fetchedFavs.map((resp, index) => {
        return {
            ticker: CURRENCIES[index].ticker,
            amount: parseFloat(resp.stateQuery.balance.quantity),
        };
    });

    function parseToInventory(inventoryJsonObj: any | null): Inventory {
        if (inventoryJsonObj === null) {
            return {
                items: [],
            };
        }

        var consumables = inventoryJsonObj.consumables.map(parseToItemEntry);
        var costumes = inventoryJsonObj.costumes.map(parseToItemEntry);
        var equipments = inventoryJsonObj.equipments.map(parseToItemEntry);
        var materials = inventoryJsonObj.materials.map(parseToItemEntry);
        return {
            items: consumables.concat(costumes).concat(equipments).concat(materials),
        };
    }

    function parseToItemEntry(itemJsonObj: any): ItemEntry {
        return {
            item: {
                elementalType: itemJsonObj.elementalType,
                grade: itemJsonObj.grade,
                id: itemJsonObj.itemSheetId,
                itemId: itemJsonObj.nonFungibleId,
                itemSubType: itemJsonObj.itemSubType,
                itemType: itemJsonObj.itemType,
                requiredBlockIndex: itemJsonObj.requiredBlockIndex,
            },
            count: itemJsonObj.count,
        };
    }

    return {
        props: {
            avatar: {
                name: avatarJsonObj.avatarName,
                actionPoint: avatarJsonObj.actionPoint,
                level: avatarJsonObj.level,
                favs,
                inventory: inventoryObj,
            },
        },
    };
};

export default AvatarPage;
