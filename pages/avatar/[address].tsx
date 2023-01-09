import type { NextPage, GetServerSideProps } from "next"
import type { BencodexDict, BencodexValue } from "bencodex";
import SDK from "../../sdk"

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
            <ul className="space-y-1 list-disc list-inside">
                {Array.from(aggregatedItems.entries()).map(([id, count]) => <li key={id}>{id}: {count}</li>)}
            </ul>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<AvatarPageProps> = async (context) => {
    const address = context.query.address;
    if (typeof(address) !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const legacyInventoryKey = "inventory" as const;
    const inventoryAddress = require("node:crypto").createHmac("sha1", Buffer.from(legacyInventoryKey, "utf8"))
        .update(Buffer.from(address.replace("0x", ""), "hex"))
        .digest("hex");

    const avatar = await (await SDK.Avatar({address})).stateQuery.avatar;

    const rawInventoryState = Buffer.from((await SDK.RawState({ address: inventoryAddress })).state, "hex");
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
