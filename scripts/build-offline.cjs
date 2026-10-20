const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const root = path.resolve(__dirname, "../dist");
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((d) =>
      d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
    );
}
const files = walk(root)
  .filter((f) => !f.endsWith("/sw.js"))
  .map((f) => "/" + path.relative(root, f).replaceAll(path.sep, "/"));
const version = crypto
  .createHash("sha256")
  .update(
    files
      .map((f) => fs.readFileSync(root + f))
      .map((x) => x.toString("base64"))
      .join(""),
  )
  .digest("hex")
  .slice(0, 12);
fs.writeFileSync(
  root + "/sw.js",
  `const CACHE='medat-${version}';const ASSETS=${JSON.stringify([...files, "/"])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medat-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>{if(event.request.mode==='navigate'){try{return await fetch(event.request)}catch{return await cache.match('/index.html',{ignoreVary:true})}}const cached=await cache.match(event.request,{ignoreVary:true});return cached||fetch(event.request)}))});
`,
);
console.log("Offline-Cache:", files.length, "Dateien ·", version);
