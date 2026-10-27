// Authentication & Web Crypto Password Hashing Helper

export async function hashPassword(plainText) {
  if (!plainText) return "";
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  if (cryptoObj && cryptoObj.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await cryptoObj.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for environments without SubtleCrypto
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    hash = (hash << 5) - hash + plainText.charCodeAt(i);
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16).padStart(16, "0");
}
