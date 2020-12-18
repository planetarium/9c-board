import React from 'react';
import JsonTree from "react-json-tree";
import { useParams } from 'react-router-dom';
import { useRawStateQuery } from '../generated/graphql';
import { decode, BencodexValue } from 'bencodex';

const theme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#272822',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633'
};

// Copied from https://github.com/planetarium/libplanet-explorer-frontend/blob/4f5f6283d0b56d024295cb1a7090043769bd9a1c/src/subpages/transaction.tsx#L13-L28
// FIXME: do not use any type.
function convertToObject(value: BencodexValue | undefined): any {
    if (value instanceof Map) {
        return Object.fromEntries(Array.from(value).map(v => [v[0], convertToObject(v[1])]));
    } else if (value instanceof Array) {
        return value.map(v => convertToObject(v));
    } else if (value instanceof Uint8Array) {
        return "<binary> " + value.toString('hex');
    } else if (typeof value === 'bigint') {
        return Number(value);
    } else {
        return value;
    }
}

export const StatePage = () => {
    const { address } = useParams<{address: string}>();
    const { loading, data } = useRawStateQuery({
        variables: {
            address,
        }
    })

    const valueRenderer = (displayText: any, value: any) => {
        if (typeof(value) === 'string' && /^[a-fA-F0-9]{40}$/g.test(value)) {
            return (
                <a href={"./" + value} style={{textDecoration: 'none'}}>"{value}"</a>
            )
        } else if (typeof(value) === 'string' && /^[a-fA-F0-9]+$/g.test(value) && value.length % 2 === 0) {
            const hexCodes = value.match(/.{2}/g)?.map(x => parseInt(x, 16));
            const allAsciiCharacters = hexCodes?.every(x => 0x20 <= x && x <= 0x7f);
            if (allAsciiCharacters) {
                return (
                    <span>{hexCodes?.map(x => String.fromCharCode(x))} <span style={{fontSize: "12px"}}>{value}</span></span>
                )
            }
        }
        return (
            <>{displayText}</>
        );
    }
    return loading || data === undefined
    ? (<>Loading</>)
    : (<JsonTree hideRoot valueRenderer={valueRenderer} theme={theme} data={convertToObject(decode(Buffer.from(data.state, "hex")))} /> );
};
