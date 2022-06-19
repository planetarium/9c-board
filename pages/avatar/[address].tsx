import type { NextPage, GetServerSideProps } from "next"
import SDK from "../../sdk"

interface Avatar {
    name: string,
    level: number,
    actionPoint: number,
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

    return (
        <p>Lv.{avatar.level} {avatar.name} ({avatar.actionPoint}/120)</p>
    )
}

export const getServerSideProps: GetServerSideProps<AvatarPageProps> = async (context) => {
    const address = context.query.address;
    if (typeof(address) !== "string") {
        throw new Error("Address parameter is not a string.");
    }

    const avatar = await (await SDK.Avatar({address})).stateQuery.avatar;

    if (avatar === null || avatar === undefined) {
        return {
            props: {
                avatar: null,
            }
        }
    }

    return {
        props: {
            avatar: {
                name: avatar.name,
                actionPoint: avatar.actionPoint,
                level: avatar.level,
            }
        }
    }
}

export default AvatarPage
