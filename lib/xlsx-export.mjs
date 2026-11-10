// Populate Artifact Tool authored XLSX templates while preserving their native
// styles, drawings, chart bindings, conditional formats and print layout.
import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';
import {cellsWithCharts,cellValue,col,chartTables} from './reports.mjs';
const escapeXml=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const unescapeXml=v=>v.replaceAll('&apos;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
export function populateXlsx(template,report){
 const files=unzipSync(new Uint8Array(template));const maps={};
 for(const [i,s] of report.sheets.entries()){
  const file=`xl/worksheets/sheet${i+1}.xml`;if(!files[file])throw Error('La plantilla no corresponde a este reporte.');
  const cells=cellsWithCharts(s,report.generated);maps[s.name]=cells;
  let xml=strFromU8(files[file]);
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
 function rangeValues(f){const raw=unescapeXml(f),match=raw.match(/^'?(.+?)'?!\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?$/);if(!match)throw Error('Referencia de gráfica no reconocida: '+raw);const [,name,c,r,,end]=match,m=maps[name];if(!m)throw Error('Hoja de gráfica ausente: '+name);return Array.from({length:Number(end||r)-Number(r)+1},(_,i)=>cellValue(m[c+(Number(r)+i)]));}
 for(const name of Object.keys(files).filter(n=>n.includes('/charts/')&&n.endsWith('.xml'))){
  let xml=strFromU8(files[name]),numbers=[];
  xml=xml.replace(/<c:(numRef|strRef)>([\s\S]*?)<\/c:\1>/g,(block,type,body)=>{
   const f=body.match(/<c:f>([\s\S]*?)<\/c:f>/)?.[1];if(!f)return block;
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
