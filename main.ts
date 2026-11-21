// VELMORA — a travel poster for a place that isn't there.
//
// The poster art ships in this repository as entry.png (a 1024x1024 PNG,
// 1,023,908 bytes, under the 1 MiB cap). This program copies it to the
// path the grader reads: /output/entry.png. No network is used.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const target = "/output/entry.png";
const MAX_BYTES = 1_048_576;

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

// Self-check: the grader only judges a whole PNG/JPEG of at most 1 MiB
// and 1024x1024, so verify the copy before reporting success.
const out = readFileSync(target);
const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!out.subarray(0, 8).equals(pngSig)) throw new Error("output is not a PNG");
const width = out.readUInt32BE(16);
const height = out.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`output is ${width}x${height}, over the 1024x1024 cap`);
}
if (statSync(target).size > MAX_BYTES) {
  throw new Error(`output is over the 1 MiB cap`);
}
console.log(`Wrote ${target} (${width}x${height}, ${statSync(target).size} bytes)`);
