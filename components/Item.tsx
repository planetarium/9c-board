export interface ItemProps {
    id: number;
    count: number;
}

function getIconURL(id: number) {
    return `https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/${id}.png`;
}

export function Item({ id, count }: ItemProps) {
    return <div
        className="inline-flex w-28 h-20 border-solid border-2 border-gray-600 content-center"
    >
        {/* FIXME: MAKE THIS URL CONFIGURABLE BY USER */}
        <img
            alt={`Icon image for ${id}`}
            className="w-16 h-16"
            title={String(id)}
            src={getIconURL(id)}
        />{" "}
        <span className="font-bold">{count}</span>
    </div>
}
