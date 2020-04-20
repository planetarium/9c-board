import React, { useState, useEffect } from 'react';
import JsonTree from 'react-json-tree';
import { useParams } from 'react-router-dom';
import { getState } from '../api/state';

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

export const StatePage = () => {
    const { address } = useParams();
    const [state, setState] = useState({})

    const loadState = (address: string) => {
        getState<any>(address).then((value) => {
            setState(value);
        });
    }

    useEffect(() => loadState(address || ""), [address]);

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
    return (
        <JsonTree hideRoot valueRenderer={valueRenderer} theme={theme} data={state} />
    );
};
