// VELMORA — a travel poster for a place that isn't there.
//
// The poster art ships in this repository as entry.png: a 1024x1024 PNG,
// 1,023,908 bytes, under the 1 MiB cap. This program copies it to the
// path the grader reads (/output/entry.png) and verifies the copy.
// No network is used; Node 22 standard library only.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const target = "/output/entry.png";
const MAX_BYTES = 1_048_576;
const MAX_SIDE = 1024;

mkdirSync(dirname(target), { recursive: true });

const before = readFileSync(source);
copyFileSync(source, target);

// Self-check: the grader only judges a whole PNG/JPEG of at most 1 MiB
// and 1024x1024, so verify the copy byte for byte before reporting success.
const after = readFileSync(target);
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
if (hash(before) !== hash(after)) {
  throw new Error("output differs from entry.png");
}
const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!after.subarray(0, 8).equals(pngSig)) {
  throw new Error("output is not a PNG");
}
const width = after.readUInt32BE(16);
const height = after.readUInt32BE(20);
if (width !== MAX_SIDE || height !== MAX_SIDE) {
  throw new Error(`output is ${width}x${height}, expected 1024x1024`);
}
if (after.readUInt32BE(8) !== 13 || after.subarray(12, 16).toString() !== "IHDR") {
  throw new Error("output has no valid PNG IHDR chunk");
}
if (statSync(target).size > MAX_BYTES) {
  throw new Error("output is over the 1 MiB cap");
}
console.log(
  `Wrote ${target} (${width}x${height}, ${statSync(target).size} bytes)`,
);
