export type Address = string & { __new_type_id: "Address" };

export function isAddress(value: any): value is Address {
    return typeof value === "string" && value.startsWith("0x") && value.length === 42;
}

export async function deriveAddress(
    address: Address,
    deriveKey: string
  ): Promise<Address> {
    const key = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(deriveKey),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
  
    const result = await window.crypto.subtle.sign("HMAC", key, Buffer.from(address.substring(2), "hex"));
    const resultAddress = "0x" + Buffer.from(result).toString("hex");
    return resultAddress as Address;
}
