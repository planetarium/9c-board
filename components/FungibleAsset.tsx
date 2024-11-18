export interface FungibleAssetProps {
    ticker: string;
    amount: number;
}

function getIconURL(ticker: string) {
    return `https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/FungibleAssetValue/${ticker}.png`;
}

export function FungibleAsset({ ticker, amount }: FungibleAssetProps) {
    return <div className="" key={ticker}>
        <img
            alt={`Icon image for ${ticker}`}
            className="inline m-1 w-10 h-10"
            title={ticker}
            src={getIconURL(ticker)}
        />
        <span className="font-bold">{amount}</span>
    </div>
}
