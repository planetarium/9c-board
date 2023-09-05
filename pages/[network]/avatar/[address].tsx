import type { NextPage, GetServerSideProps } from "next"
import type { BencodexDict, BencodexValue } from "bencodex";
import { networkToSDK } from "../../../network-util";

interface Avatar {
    name: string,
    level: number,
    actionPoint: number,
    inventory: Inventory,
}

interface Inventory {
    items: ItemEntry[],
}

interface ItemEntry {
    item: Item,
    count: number,
}

interface Item {
    elementalType: string,
    grade: number,
    id: number,
    itemId: string | null,
    itemSubType: string,
    itemType: string,
    requiredBlockIndex: number | null,
}

interface AvatarPageProps {
    avatar: Avatar | null,
}

const AvatarPage: NextPage<AvatarPageProps> = ({avatar}) => {
    if (avatar === null) {
        return (
            <h1>There is no avatar.</h1>
        )
    }

    const aggregatedItems = new Map<number, number>();
    for (const { item, count } of avatar.inventory.items) {
        aggregatedItems.set(item.id, (aggregatedItems.get(item.id) || 0) + count);
    }

    return (
        <>
            <p>Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120)</p>
            <h1 className="text-3xl font-extrabold">Inventory</h1>
            <div className="flex flex-row flex-wrap space-y-3">
                {Array.from(aggregatedItems.entries())
                    .map(([id, count]) => 
                        <div className="inline-flex w-28 h-20 border-solid border-2 border-gray-600 content-center" key={id}>
                            {/* FIXME: MAKE THIS URL CONFIGURABLE BY USER */}
                            <img className="w-16 h-16" title={String(id)} src={`https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/${id}.png`} /> <span className="font-bold">{count}</span>
                        </div>)}
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<AvatarPageProps> = async (context) => {
    const address = context.query.address;
    if (typeof(address) !== "string") {
        throw new Error("Address parameter is not a string.");
    }
    
    const sdk = networkToSDK(context);

    const blockIndexString = context.query.blockIndex;
    const blockIndex = blockIndexString === undefined ? -1 : Number(blockIndexString);
    const hash = (await sdk.GetBlockHashByBlockIndex({
        index: (blockIndex as unknown) as string,  // Break assumption ID must be string.
    })).chainQuery.blockQuery?.block?.hash;

    const legacyInventoryKey = "inventory" as const;
    const inventoryAddress = require("node:crypto").createHmac("sha1", Buffer.from(legacyInventoryKey, "utf8"))
        .update(Buffer.from(address.replace("0x", ""), "hex"))
        .digest("hex");

    const avatar = await (await sdk.Avatar({address})).stateQuery.avatar;

    const rawInventoryState = Buffer.from((await sdk.RawState({ address: inventoryAddress, hash })).state, "hex");
    const inventory: BencodexDict = require("bencodex").decode(rawInventoryState);

    if (avatar === null || avatar === undefined) {
        return {
            props: {
                avatar: null,
            }
        }
    }

    function itemMapToObject(item: BencodexDict): Item {
        const rawItemId = item.get("itemId") || item.get("item_id");
        const rawBuffSkills = item.get("buffSkills");
        const rawRequiredBlockIndex = (item.get("requiredBlockIndex") || item.get("rbi")) as number | undefined;
        const rawSkills = item.get("skills");
        const rawStats = item.get("stats");
        const rawStatsMap = item.get("statsMap");
        return {
            // buffSkills: rawBuffSkills === undefined ? null : rawBuffSkills,
            elementalType: item.get("elemental_type") as string,
            grade: Number(item.get("grade")),
            id: Number(item.get("id")),
            itemId: rawItemId === undefined ? null : Buffer.from(rawItemId as Uint8Array).toString("hex"),
            itemSubType: item.get("item_sub_type") as string,
            itemType: item.get("item_type") as string,
            requiredBlockIndex: rawRequiredBlockIndex === undefined ? null : rawRequiredBlockIndex,
            // skills: rawSkills === undefined ? null : itemSkillsToObject(rawSkills as BencodexDict),
            // stats: rawStats === undefined ? null : itemStatsToObject(rawStats as BencodexDict),
            // statsMap: rawStatsMap === undefined ? null : itemStatsMapToObject(rawStatsMap as BencodexDict),
        }
    }

    function itemStatsToObject(stats: BencodexDict): object {
        return {
            type: Object.keys(stats),
        };
    }

    // function itemStatsMapToObject(statsMap: BencodexDict): object {
    //     return Object.fromEntries(Array.from(statsMap.entries()).map(([k, v]: [string, BencodexDict], _) => [k, v]));
    // }

    function itemSkillsToObject(skills: BencodexDict): object {
        return {
            type: typeof(skills)
        };
    }

    return {
        props: {
            avatar: {
                name: avatar.name,
                actionPoint: avatar.actionPoint,
                level: avatar.level,
                inventory: {
                    items: Array.from(inventory.values())
                        .map((v: BencodexValue, _) => {
                            if (!(v instanceof Map)) {
                                throw new TypeError("Unexpected value type. Please debug.");
                            }

                            return {
                                item: itemMapToObject(v.get("item") as BencodexDict),
                                count: Number(v.get("count") as BigInt),
                            }; 
                        })
                },
            }
        }
    }
}

export default AvatarPage
