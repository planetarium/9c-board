import React, { useState, useEffect } from 'react';
import JsonTree from 'react-json-tree';
import { useParams } from 'react-router-dom';
import Axios from 'axios';

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

    // FIXME: code redundancy.
    const HOST = "https://9c-state.planetarium.dev";
    const getStateUrl = (address: string) => `${HOST}/state/${address}`;
    const loadState = (address: string) => {
        const STATE_URL = getStateUrl(address);
        Axios.get(STATE_URL).then(({ data: { value } }) => {
            setState(value);
        });
    }

    useEffect(() => loadState(address || ""));

    const valueRenderer = (displayText: any, value: any) => {
        if (typeof(value) === 'string' && /^[a-fA-F0-9]{40}$/g.test(value)) {
            return (
                <a href={"./" + value} style={{textDecoration: 'none'}}>"{value}"</a>
            )
        } else {
            return (
                <>{value}</>
            )
        }
    }
    return (
        <JsonTree hideRoot valueRenderer={valueRenderer} theme={theme} data={state} />
    );
};
