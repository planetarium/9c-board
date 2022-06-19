import type { NextPage } from 'next'
import Link from 'next/link'

export interface RankRowProps {
    rank: number,
    name: string,
    avatarAddress: string,
}

export const RankRow: NextPage<RankRowProps> = ({ rank, name, avatarAddress }) => {
    return (
        <Link href={`/avatar/${avatarAddress}`}>
            <div className="w-full md:w-auto m-3 mx-12 p-4 border-solid border-2 border-gray-700">
                {rank} {name} {avatarAddress}
            </div>
        </Link>
    )
}
