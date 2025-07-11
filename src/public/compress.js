import fs from "node:fs";
import zlib from "node:zlib";
const js = fs.readFileSync("./inputjs.js", "utf8");
const compressed = zlib.deflateRawSync(js).toString("base64");
const html =
  '<svg onload="fetch`data:;base64,' +
  compressed +
  '`.then(a=>new Response(a.body.pipeThrough(new DecompressionStream(`deflate-raw`))).text().then(eval))">';

fs.writeFileSync("./compressed.html", html, "utf8");

