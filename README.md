# 9c-board

A web application to provide useful tools. You can access it at https://9c-board.nine-chronicles.dev/.

## Development

### (Optional) Configure Environment

- Create a `.env` file in the project's root directory.

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

NineChronicles' blockchain network is divided into planets, which can be found below.

- Main network: https://planets.nine-chronicles.com/planets
- Internal network: https://planets-internal.nine-chronicles.com/planets

As shown above, NineChronicles' planets are divided into main and internal networks for deployment purposes.  
Each feature provided here must be used separately for each planet and network.

This is a common way to determine what goes into the '[NETWORK]' location in the URL of a feature, which we'll discuss below.

|          |   main   |     internal      |
| :------: | :------: | :---------------: |
|   odin   |   odin   |   odin-internal   |
| heimdall | heimdall | heimdall-internal |

Since this information is tied to the `NETWORK_CONF_MAP` and `MIMIR_GRAPHQL_URL_MAP` values defined in your `.env` file, you can change it as needed.

### Show Tablesheet in Web

`https://9c-board.nine-chronicles.dev/[NETWORK]/tablesheet/[TABLESHEET_NAME]`

For instance, you can see the current `StakeRegularRewardSheet` of the `odin` network at `https://9c-board.nine-chronicles.dev/odin/tablesheet/StakeRegularRewardSheet`.

<img width="880" alt="image" src="https://user-images.githubusercontent.com/26626194/224272344-622e9d80-a74c-48bf-82b6-62f1e8dde3f1.png">

### Show Avatar in Web

`https://9c-board.nine-chronicles.dev/[NETWORK]/avatar/[AVATAR_ADDRESS]?<index=[BLOCK_INDEX]>`

You can view some avatar states on the web.

<img width="1512" alt="image" src="https://user-images.githubusercontent.com/26626194/224272557-6c2142c3-52e3-4c7e-8744-5fe1158902b3.png">
