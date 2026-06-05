// Compress a policy into a URL-safe token using the browser-native gzip
// CompressionStream (no dependency). CSP text is highly repetitive, so this
// shrinks a shareable link by ~50% while staying fully local — nothing is sent
// anywhere, the link is self-contained.

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64urlToBytes(token: string): Uint8Array<ArrayBuffer> {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/")
  const bin = atob(b64)
  const bytes = new Uint8Array(new ArrayBuffer(bin.length))
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export async function compressPolicy(text: string): Promise<string> {
  const stream = new Response(text).body!.pipeThrough(new CompressionStream("gzip"))
  const buf = await new Response(stream).arrayBuffer()
  return bytesToBase64url(new Uint8Array(buf))
}

export async function decompressPolicy(token: string): Promise<string> {
  const bytes = base64urlToBytes(token)
  const stream = new Response(bytes).body!.pipeThrough(new DecompressionStream("gzip"))
  return await new Response(stream).text()
}
