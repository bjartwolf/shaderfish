import zlib from "zlib";
import { appendFileSync, writeFileSync, readFileSync } from "fs";
const htmloader = '<svg onload="fetch`#`.then(t=>t.blob()).then(t=>new Response(t.slice(156).stream().pipeThrough(new DecompressionStream(`deflate-raw`))).text()).then(eval)">';
const js = readFileSync("inputjs.js")
writeFileSync("packed.html", htmloader)
appendFileSync("packed.html", zlib.deflateRawSync(js))

