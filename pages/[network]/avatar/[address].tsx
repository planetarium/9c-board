import type { NextPage, GetServerSideProps } from "next";
import { getHeadlessGraphQLSDK } from "../../../utils/headlessGraphQLClient";
import { CurrencyInput } from "../../../generated/headless/graphql-request";
import { FungibleAsset } from "@/components/FungibleAsset";
import { Item } from "@/components/Item";

const AGENT_CURRENCIES: CurrencyInput[] = [
    {
        ticker: "CRYSTAL",
        decimalPlaces: 18,
        minters: null,
    },
];
const AVATAR_CURRENCIES: CurrencyInput[] =
    [
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
    ].map(ticker => ({
        ticker: ticker,
        decimalPlaces: 0,
        minters: null,
    }));

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
    inventory: null | Inventory;
}

interface Inventory {
    items: Item[];
}

interface Item {
    itemSheetId: number;
    count: number;
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
    if (avatar.inventory) {
        for (const { itemSheetId, count } of avatar.inventory.items) {
            aggregatedItems.set(itemSheetId, (aggregatedItems.get(itemSheetId) || 0) + count);
        }
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
                    .map(({ ticker, amount }, index) => (
                        <FungibleAsset key={index} ticker={ticker} amount={amount} />
                    ))}
            </div>
            <h1 className="text-3xl font-extrabold mt-10 mb-5">Inventory</h1>
            <div className="flex flex-row flex-wrap space-y-3">
                {Array.from(aggregatedItems.entries()).map(([id, count]) => (
                    <Item key={id} id={id} count={count} />
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

    const headless = getHeadlessGraphQLSDK(network);

    // get avatar
    const avatarJsonObj = (await headless.Avatar({ address: address })).stateQuery.avatar;
    if (!avatarJsonObj) {
        return {
            props: {
                avatar: null,
            }
        }
    }
    // ~get avatar

    // get FAVs
    const agentFavs = await getBalances(AGENT_CURRENCIES, avatarJsonObj.agentAddress);
    const avatarFavs = await getBalances(AVATAR_CURRENCIES, address);
    // ~get FAVs

    // get inventory
    const itemsJsonObj = (await headless.GetInventory({
        address: address
    })).stateQuery.avatar?.inventory.items as Item[];
    const inventoryObj = itemsJsonObj
        ? { items: itemsJsonObj }
        : null;
    // ~get inventory

    return {
        props: {
            avatar: {
                address: address,
                name: avatarJsonObj.name!,
                actionPoint: avatarJsonObj.actionPoint!,
                level: avatarJsonObj.level!,
                favs: agentFavs.concat(avatarFavs),
                inventory: inventoryObj,
            },
        },
    };

    async function getBalances(
        currencies: readonly CurrencyInput[],
        address: any | null
    ): Promise<FAV[]> {
        if (address === null) {
            return [];
        }

        const avatarBalanceJsonObjs = await Promise.all(currencies.map(
            (currency) => headless.GetBalance({
                currency: currency,
                address: address,
            })));
        return avatarBalanceJsonObjs.map((balanceJsonObj, index) => ({
            ticker: currencies[index].ticker,
            amount: parseFloat(balanceJsonObj.stateQuery.balance.quantity),
        }));
    }
};

export default AvatarPage;
