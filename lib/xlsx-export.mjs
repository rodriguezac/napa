// Populate Artifact Tool authored XLSX templates while preserving their native
// styles, drawings, chart bindings, conditional formats and print layout.
import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';
import {cellsWithCharts,cellValue,col,chartTables,chartStart} from './reports.mjs';
const escapeXml=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const unescapeXml=v=>v.replaceAll('&apos;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
// Las plantillas tienen una fila por partida del caso original. Cuando el reporte trae filas o columnas
// adicionales (cuentas agregadas, Pro-forma II), cada fila nueva copia el estilo de una fila de la
// plantilla del mismo tipo y las celdas faltantes copian el estilo de la celda vecina.
const colNum=c=>[...c].reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0);
function parseRows(xml){const rows=new Map();for(const m of xml.matchAll(/<x:row\b[^>]*?\br="(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/x:row>)/g))rows.set(Number(m[1]),m[0]);return rows;}
function rowCells(rowXml){const out=new Map();for(const m of rowXml.matchAll(/<x:c\b[^>]*?\br="([A-Z]+)\d+"[^>]*?(?:\/>|>[\s\S]*?<\/x:c>)/g))out.set(m[1],m[0]);return out;}
function rowAttrs(rowXml){return rowXml.match(/^<x:row\b([^>]*?)\/?>/)[1].replace(/\s+r="\d+"/,'').replace(/\s+spans="[^"]*"/,'').replace(/\/$/,'');}
function blankCell(cellXml,address){const style=cellXml.match(/\bs="(\d+)"/);return `<x:c r="${address}"${style?` s="${style[1]}"`:''}></x:c>`;}
function buildRow(r,attrs,cells){const list=[...cells.entries()].sort((a,b)=>colNum(a[0])-colNum(b[0])).map(([c,x])=>x.replace(/\br="[A-Z]+\d+"/,`r="${c}${r}"`));return list.length?`<x:row r="${r}"${attrs}>${list.join('')}</x:row>`:`<x:row r="${r}"${attrs}/>`;}
function adaptLayout(xml,s,cells){
 const L=s.layout,old=parseRows(xml),rows=new Map(old);
 const shift=L?chartStart(s)-L.start:0;
 if(L){
  const keys=s.rows.map(r=>r.key);let d=0;while(d<keys.length&&d<L.keys.length&&keys[d]===L.keys[d])d++;
  const changed=d<keys.length||d<L.keys.length||s.notes.length!==L.notes||shift!==0;
  if(changed){
   const baseN=L.keys.length,maxOld=Math.max(...old.keys()),newStart=chartStart(s);
   const source=r=>{const i=r-8;
    if(r>=newStart)return r-shift;
    if(i>=0&&i<keys.length){if(i<d)return r;const bi=L.keys.indexOf(keys[i]);if(bi>=0)return 8+bi;const bk=L.kinds.indexOf(s.rows[i].kind);return 8+(bk>=0?bk:Math.max(0,L.kinds.indexOf('detail')));}
    const ni=r-(keys.length+10);if(ni>=0&&ni%2===0&&ni/2<s.notes.length)return baseN+10;
    return 8+baseN+1;};
   for(let r=8+d;r<=Math.max(maxOld,maxOld+shift,newStart-1);r++){const t=old.get(source(r));
    if(!t){rows.delete(r);continue;}
    const cs=new Map([...rowCells(t)].map(([c,x])=>[c,blankCell(x,c+r)]));rows.set(r,buildRow(r,' '+rowAttrs(t).trim(),cs));}
  }
 }
 // Celdas faltantes (columnas nuevas o filas sin celdas): estilo de la celda a la izquierda.
 for(const address of Object.keys(cells)){const [,c,rs]=address.match(/^([A-Z]+)(\d+)$/),r=Number(rs);
  let row=rows.get(r);const cs=row?rowCells(row):new Map();if(cs.has(c))continue;
  const left=[...cs.keys()].filter(k=>colNum(k)<colNum(c)).sort((a,b)=>colNum(b)-colNum(a))[0];
  cs.set(c,left?blankCell(cs.get(left),address):`<x:c r="${address}"></x:c>`);
  rows.set(r,buildRow(r,row?' '+rowAttrs(row).trim():'',cs));}
 const body=[...rows.keys()].sort((a,b)=>a-b).map(r=>rows.get(r)).join('');
 xml=xml.replace(/<x:sheetData\b[^>]*?(?:\/>|>[\s\S]*?<\/x:sheetData>)/,`<x:sheetData>${body}</x:sheetData>`).replace(/<x:dimension\b[^>]*\/>/,'');
 // Ancho para columnas nuevas (por ejemplo, la columna Pro-forma II).
 const used=Math.max(...Object.keys(cells).map(a=>colNum(a.match(/^[A-Z]+/)[0])));
 const defined=[...xml.matchAll(/<x:col\b[^>]*\bmax="(\d+)"[^>]*\/>/g)].map(m=>Number(m[1]));const maxDef=Math.max(0,...defined);
 if(used>maxDef&&xml.includes('</x:cols>')){const w=xml.match(/<x:col\b[^>]*\bmin="3"[^>]*\bwidth="([\d.]+)"/)?.[1]||'21';let extra='';for(let c=maxDef+1;c<=used;c++)extra+=`<x:col min="${c}" max="${c}" width="${w}" customWidth="1"/>`;xml=xml.replace('</x:cols>',extra+'</x:cols>');}
 return {xml,shift,start:L?L.start:72};
}
export function populateXlsx(template,report){
 const files=unzipSync(new Uint8Array(template));const maps={},shifts={};
 for(const [i,s] of report.sheets.entries()){
  const file=`xl/worksheets/sheet${i+1}.xml`;if(!files[file])throw Error('La plantilla no corresponde a este reporte.');
  const cells=cellsWithCharts(s,report.generated);maps[s.name]=cells;
  let xml=strFromU8(files[file]);const adapted=adaptLayout(xml,s,cells);xml=adapted.xml;shifts[s.name]={shift:adapted.shift,start:adapted.start};
  for(const [address,item] of Object.entries(cells)){
   const re=new RegExp(`<x:c\\b(?=[^>]*\\br="${address}")[^>]*(?:/>|>[\\s\\S]*?</x:c>)`);
   const old=xml.match(re)?.[0];if(!old)throw Error('Celda de plantilla ausente: '+s.name+'!'+address);
   let attrs=old.match(/^<x:c\b([^>]*?)(?:\/?>)/)[1].replace(/\s+t="[^"]*"/g,'').replace(/\/$/,'');
   const v=cellValue(item),formula=item&&typeof item==='object'?item.f:null;
   const finite=typeof v==='number'&&Number.isFinite(v),isString=!finite;
   const contents=(formula?`<x:f>${escapeXml(formula.replace(/^=/,''))}</x:f>`:'')+(isString?(formula?`<x:v>${escapeXml(v??'')}</x:v>`:`<x:is><x:t xml:space="preserve">${escapeXml(v??'')}</x:t></x:is>`):`<x:v>${Math.abs(v)<1e-10?0:v}</x:v>`);
   const next=`<x:c${attrs}${isString?` t="${formula?'str':'inlineStr'}"`:''}>${contents}</x:c>`;
   xml=xml.replace(re,()=>next);
  }
  const lastRow=Math.max(s.rows.length+14+s.notes.length*2,...s.charts.map(c=>Number(c.to.match(/\d+/)[0])));
  xml=xml.replace(/<x:pageMargins\b[^>]*\/>/g,'').replace(/<x:pageSetup\b[^>]*\/>/g,'');
  const setup='<x:pageMargins left="0.3" right="0.3" top="0.45" bottom="0.45" header="0.2" footer="0.2"/><x:pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>';
  xml=xml.includes('<x:drawing')?xml.replace('<x:drawing',setup+'<x:drawing'):xml.replace('</x:worksheet>',setup+'</x:worksheet>');
  xml=xml.replace('</x:sheetPr>','<x:pageSetUpPr fitToPage="1"/></x:sheetPr>');
  files[file]=strToU8(xml);
  s.printLastRow=lastRow;
 }
 function shiftRef(f){const raw=unescapeXml(f),m=raw.match(/^('?)(.+?)\1!(\$?)([A-Z]+)(\$?)(\d+)(?::(\$?)([A-Z]+)(\$?)(\d+))?$/);if(!m)return f;const sh=shifts[m[2]];if(!sh||!sh.shift)return f;const mv=n=>Number(n)>=sh.start?Number(n)+sh.shift:Number(n);return escapeXml(`${m[1]}${m[2]}${m[1]}!${m[3]}${m[4]}${m[5]}${mv(m[6])}`+(m[8]?`:${m[7]}${m[8]}${m[9]}${mv(m[10])}`:''));}
 function rangeValues(f){const raw=unescapeXml(f),match=raw.match(/^'?(.+?)'?!\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?$/);if(!match)throw Error('Referencia de gráfica no reconocida: '+raw);const [,name,c,r,,end]=match,m=maps[name];if(!m)throw Error('Hoja de gráfica ausente: '+name);return Array.from({length:Number(end||r)-Number(r)+1},(_,i)=>cellValue(m[c+(Number(r)+i)]));}
 for(const name of Object.keys(files).filter(n=>n.includes('/charts/')&&n.endsWith('.xml'))){
  let xml=strFromU8(files[name]),numbers=[];
  xml=xml.replace(/<c:(numRef|strRef)>([\s\S]*?)<\/c:\1>/g,(block,type,body)=>{
   const f0=body.match(/<c:f>([\s\S]*?)<\/c:f>/)?.[1];if(!f0)return block;const f=shiftRef(f0);if(f!==f0)body=body.replace(`<c:f>${f0}</c:f>`,`<c:f>${f}</c:f>`);
   const values=rangeValues(f),cacheType=type==='numRef'?'numCache':'strCache';
   if(type==='numRef')numbers.push(...values.filter(v=>typeof v==='number'&&Number.isFinite(v)));
   const format=body.match(/<c:formatCode>([\s\S]*?)<\/c:formatCode>/)?.[1]||'General';
   const cache=`<c:${cacheType}>${type==='numRef'?`<c:formatCode>${format}</c:formatCode>`:''}<c:ptCount val="${values.length}"/>${values.map((v,i)=>v==null||type==='numRef'&&typeof v!=='number'?'':`<c:pt idx="${i}"><c:v>${escapeXml(v)}</c:v></c:pt>`).join('')}</c:${cacheType}>`;
   const clean=body.replace(/<c:(numCache|strCache)>[\s\S]*?<\/c:\1>/g,'');return `<c:${type}>${clean}${cache}</c:${type}>`;
  });
  const min=Math.min(0,...numbers);
  xml=xml.replace(/<c:valAx>([\s\S]*?)<\/c:valAx>/g,(_,body)=>'<c:valAx>'+body.replace(/<c:scaling>([\s\S]*?)<\/c:scaling>/,(_,v)=>'<c:scaling>'+v.replace(/<c:min\b[^>]*\/>/g,'')+`<c:min val="${min}"/></c:scaling>` )+'</c:valAx>');
  files[name]=strToU8(xml);
 }
 let book=strFromU8(files['xl/workbook.xml']);
 book=book.replace(/<x:calcPr\b[^>]*\/>/g,'');
 const printNames=report.sheets.map((s,i)=>{const chartEnd=s.charts.map(c=>c.to.replace(/\d+/,'')),lastCol=chartEnd.sort((a,b)=>a.length-b.length||a.localeCompare(b)).at(-1)||col(s.headers.length+1);return `<x:definedName name="_xlnm.Print_Area" localSheetId="${i}">'${escapeXml(s.name)}'!$B$2:$${lastCol}$${s.printLastRow}</x:definedName><x:definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${escapeXml(s.name)}'!$2:$7</x:definedName>`}).join('');
 if(book.includes('<x:definedNames>'))book=book.replace('</x:definedNames>',printNames+'</x:definedNames>');else book=book.replace('</x:sheets>','</x:sheets><x:definedNames>'+printNames+'</x:definedNames>');
 book=book.replace('</x:workbook>','<x:calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></x:workbook>');files['xl/workbook.xml']=strToU8(book);
 delete files['xl/calcChain.xml'];
 if(files['docProps/core.xml']){let p=strFromU8(files['docProps/core.xml']);p=p.replace(/<dc:title>[\s\S]*?<\/dc:title>/,'<dc:title>'+escapeXml(report.sheets[0].title)+'</dc:title>');files['docProps/core.xml']=strToU8(p)}
 return zipSync(files,{level:6});
}
export async function downloadXlsx(report,basePath=''){
 const response=await fetch(`${basePath}/exports/v3/${report.templateKey}.xlsx`);if(!response.ok)throw Error('No se pudo cargar el formato Excel.');
 const bytes=populateXlsx(await response.arrayBuffer(),report),blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=report.filename+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
