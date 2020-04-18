import axios from "axios";
import { STATE_API_HOST } from "./constant";

const getStateUrl = (address: string) => `${STATE_API_HOST}/state/${address}`;

interface StateResponse<T> {
    value: T
};

// FIXME: make generic parameter required.
export const getState = async <T>(address: string): Promise<T> => {
    // TODO: check address valid.
    const STAET_URL = getStateUrl(address);
    return (await axios.get<StateResponse<T>>(STAET_URL)).data.value;
}
