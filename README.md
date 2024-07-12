# 9c-board

A web application to provide useful tools. You can access it in https://9c-board.nine-chronicles.dev/.

## Devlopment

### Configure Environment

- Create `.env` file to project root directory.

```
# Set network config map e.g.,
NETWORK_CONF_MAP="<networkType-nodeType>=<graphql-endpoint>,odin-main=http://url/graphql,odin-internal=http://url/graphql"
MIMIR_GRAPHQL_URL_MAP="<nodeType>=<mimir-graphql-endpoint>,main=https://mimir-internal.nine-chronicles.dev/graphql/"
```

### Run

```
yarn install
yarn codegen
yarn dev
```

## Features

### Planets & Networks

NineChronicle's blockchain network is divided into planets, which can be found below.

- main network: https://planets.nine-chronicles.com/planets
- internal network: https://planets-internal.nine-chronicles.com/planets

As you can see above, NineChronicle's planets are divided into main and internal networks for deployment purposes.
Therefore, each of the features provided here must be used separately for each planet and network.

This is a common way to determine what goes into the '[NETWORK]' location in the URL of a feature, which we'll discuss below.

|          |   main   |     internal      |
| :------: | :------: | :---------------: |
|   odin   |   odin   |   odin-internal   |
| heimdall | heimdall | heimdall-internal |

And since this information is tied to the `NETWORK_CONF_MAP` value and `MIMIR_GRAPHQL_URL_MAP` value you define in your `.env` file, you can change it.

### Show tablesheet in web

`https://9c-board.nine-chronicles.dev/[NETWORK]/tablesheet/[TABLESHEET_NAME]`

For instance, you can see current `StakeRegularRewardSheet` of `odin` network in `https://9c-board.nine-chronicles.dev/odin/tablesheet/StakeRegularRewardSheet`.

<img width="880" alt="image" src="https://user-images.githubusercontent.com/26626194/224272344-622e9d80-a74c-48bf-82b6-62f1e8dde3f1.png">

### Show avatar in web

`https://9c-board.nine-chronicles.dev/[NETWORK]/avatar/[AVATAR_ADDRESS]?<index=[BLOCK_INDEX]>`

You can see some avatar state in web.

<img width="1512" alt="image" src="https://user-images.githubusercontent.com/26626194/224272557-6c2142c3-52e3-4c7e-8744-5fe1158902b3.png">
