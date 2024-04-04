export async function deriveAddress(
    address: string,
    deriveKey: string
  ): Promise<string> {
    const key = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(deriveKey),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
  
    const result = await window.crypto.subtle.sign("HMAC", key, Buffer.from(address.substring(2), "hex"));
    const resultAddress = "0x" + Buffer.from(result).toString("hex");
    return resultAddress;
}
