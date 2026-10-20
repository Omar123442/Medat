import { unzipSync, strFromU8 } from 'fflate';
import { decompress } from 'fzstd';
import initSqlJs from 'sql.js';
export async function importAnki(file) {
 const zip=unzipSync(new Uint8Array(await file.arrayBuffer()));
 const key=['collection.anki21b','collection.anki21','collection.anki2'].find(k=>zip[k]);
 if(!key) throw new Error('Keine Anki-Sammlung in dieser Datei gefunden.');
 const SQL=await initSqlJs({locateFile:()=>'/sql-wasm.wasm'});
 const db=new SQL.Database(key.endsWith('b')?decompress(zip[key]):zip[key]);
 const result=db.exec('SELECT id, flds, tags FROM notes');
 if(!result.length) throw new Error('Die Sammlung enthält keine Lernkarten.');
 const media=zip.media?JSON.parse(strFromU8(zip.media)):{};
 const urls={}; Object.entries(media).forEach(([k,name])=>{if(zip[k]) urls[name]=URL.createObjectURL(new Blob([zip[k]],{type:/\.png$/i.test(name)?'image/png':/\.svg$/i.test(name)?'image/svg+xml':/\.webp$/i.test(name)?'image/webp':'image/jpeg'}));});
 // Parse imported HTML as inert content. Never render scripts, handlers, styles or external resources.
 const clean=html=>{const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style,iframe,object,embed,link,meta,svg,math').forEach(e=>e.remove());doc.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes])el.removeAttribute(a.name);});doc.querySelectorAll('br').forEach(e=>e.replaceWith('\n'));return doc.body.textContent.trim();};
 const pics=html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('img')].map(e=>urls[e.getAttribute('src')]).filter(Boolean);};
 const cards=result[0].values.map(([id,fields,tags])=>{const f=fields.split('\x1f');const tag=tags.split(/\s+/).find(t=>/biol|chem|phys|math/i.test(t))||'Import';let subject=/chem/i.test(tag)?'Chemie':/phys/i.test(tag)?'Physik':/math/i.test(tag)?'Mathematik':/biol/i.test(tag)?'Biologie':'Import';const cloze=/{{c\d+::/.test(f[0]); const q=cloze?f[0].replace(/{{c\d+::(.*?)(?:::(.*?))?}}/gs,(_,a,h)=>'['+(h||'…')+']'):f[0]; const a=cloze?f[0].replace(/{{c\d+::(.*?)(?:::(.*?))?}}/gs,'$1')+'\n'+f.slice(1).join('\n'):f.slice(1).join('\n');return {id:String(id),q:clean(q),a:clean(a),images:pics(f[0]),answerImages:pics(f.slice(1).join(' ')),subject,tags};}).filter(c=>c.q);
 db.close();return cards;
}
