'use client';
import React,{useState} from 'react';
import {Plus,Trash2} from 'lucide-react';
import {accounts,accountCodes,classify,compareCodes,customAccounts,customValue,natureRules,statements,validCode} from '../lib/finance.mjs';

type Data=Record<number,Record<string,number>>;
type Row={t:'h1'|'h2'|'item'|'sub'|'total'|'grand',code?:string,label:string,v?:[number,number],decimals?:number};

// Formato de los estados del curso: partidas a la izquierda, totales a la derecha, negativos entre paréntesis.
const fmt=(v:number,d=0,cur=false)=>{if(!Number.isFinite(v))return '—';const n=(cur?'$':'')+new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(v));return Math.abs(v)<.005?'—':v<0?`(${n})`:n;};
const name=(key:string)=>(accounts.find((a:any)=>a[0]===key) as any)?.[1]||key;
const groupName:Record<string,string>={ca:'Activo corriente',fixed:'Activo no corriente',other:'Otros activos',cl:'Pasivo corriente',long:'Pasivo no corriente',equity:'Capital contable',sales:'Ingresos',otherIncome:'Otros ingresos',cost:'Costo de ventas',opex:'Gasto de operación',nonOperating:'Gasto no operativo',tax:'Impuesto'};

function itemRows(keys:string[],data:Data,extra:any,group:string,negative:string[]=[]):Row[]{
 const base:Row[]=keys.map(k=>({t:'item',code:accountCodes[k],label:negative.includes(k)?`(−) ${name(k)}`:name(k),v:[data[2025][k]*(negative.includes(k)?-1:1),data[2024][k]*(negative.includes(k)?-1:1)]}));
 const custom:Row[]=customAccounts(extra).filter(c=>classify(c.code)?.group===group).map(c=>({t:'item',code:c.code,label:c.name+' ✦',v:[customValue(c,data[2025]),customValue(c,data[2024])]}));
 return [...base,...custom].sort((x,y)=>compareCodes(x.code||'',y.code||''));
}
function flip(rows:Row[]):Row[]{return rows.map(r=>r.v?{...r,v:[-r.v[0],-r.v[1]] as [number,number]}:r);}

export function balanceLayout(data:Data,extra:any):Row[]{
 const s=statements(data[2025],extra),t=statements(data[2024],extra),pair=(k:string):[number,number]=>[s[k],t[k]];
 return [
  {t:'h1',code:'1',label:'ACTIVOS'},
  {t:'h2',code:'1.1',label:'Activos corrientes'},
  ...itemRows(['cash','securities','receivables','allowance','raw','wip','finished','prepaid'],data,extra,'ca',['allowance']),
  {t:'sub',label:'Total activos corrientes',v:pair('ca')},
  {t:'h2',code:'1.2',label:'Activos no corrientes · propiedad, planta y equipo'},
  ...itemRows(['land','buildings','machinery','transport','furniture','depAcc'],data,extra,'fixed',['depAcc']),
  {t:'sub',label:'Activos fijos netos',v:pair('fixed')},
  {t:'h2',code:'1.3',label:'Otros activos no corrientes'},
  ...itemRows(['intangibles','amortAcc','investments'],data,extra,'other',['amortAcc']),
  {t:'sub',label:'Total otros activos',v:pair('other')},
  {t:'grand',label:'TOTAL ACTIVOS',v:pair('assets')},
  {t:'h1',code:'2',label:'PASIVOS'},
  {t:'h2',code:'2.1',label:'Pasivos corrientes'},
  ...itemRows(['payables','notes','accrued','taxPay','currentDebt','divPay'],data,extra,'cl'),
  {t:'sub',label:'Total pasivos corrientes',v:pair('cl')},
  {t:'h2',code:'2.2',label:'Pasivos no corrientes'},
  ...itemRows(['loan','bonds'],data,extra,'long'),
  {t:'sub',label:'Total pasivos no corrientes',v:pair('long')},
  {t:'total',label:'TOTAL PASIVOS',v:pair('debt')},
  {t:'h1',code:'3',label:'CAPITAL CONTABLE'},
  ...[...itemRows(['capital','premium'],data,extra,'equity'),{t:'item',code:'3.4.01',label:'Utilidades retenidas (saldo al cierre)',v:pair('retained')} as Row].sort((x,y)=>compareCodes(x.code||'',y.code||'')),
  {t:'total',label:'TOTAL CAPITAL CONTABLE',v:pair('equity')},
  {t:'grand',label:'TOTAL PASIVOS Y CAPITAL',v:[s.debt+s.equity,t.debt+t.equity]},
 ];
}

export function incomeLayout(data:Data,extra:any):Row[]{
 const s=statements(data[2025],extra),t=statements(data[2024],extra),pair=(k:string,sign=1):[number,number]=>[s[k]*sign,t[k]*sign];
 const opex=['admin','rent','insurance','maintenance','fees','dep','amort','otherExpense','salesSalary','advertising','freight','utilities'];
 return [
  {t:'h2',code:'4.1',label:'Ingresos de operación'},
  ...itemRows(['grossSales','returns'],data,extra,'sales',['returns']),
  {t:'sub',label:'Ventas netas',v:pair('sales')},
  {t:'h2',code:'5',label:'Costo de ventas'},
  ...itemRows(['materials','labor','overhead'],data,extra,'cost'),
  {t:'sub',label:'(−) Costo de ventas',v:pair('cost',-1)},
  {t:'total',label:'UTILIDAD BRUTA',v:pair('gross')},
  {t:'h2',code:'6',label:'Gastos de operación'},
  ...itemRows(opex,data,extra,'opex'),
  {t:'sub',label:'(−) Total gastos de operación',v:pair('opex',-1)},
  {t:'total',label:'UTILIDAD DE OPERACIÓN (UAII)',v:pair('ebit')},
  {t:'h2',code:'4.3 · 6.3',label:'Otros ingresos y gastos'},
  ...[...itemRows(['finIncome'],data,extra,'otherIncome'),...flip(itemRows(['interest','loss'],data,extra,'nonOperating')).map(r=>({...r,label:r.label.startsWith('(−)')?r.label:'(−) '+r.label}))],
  {t:'total',label:'UTILIDAD ANTES DE IMPUESTOS',v:pair('ebt')},
  {t:'sub',code:'6.8',label:`(−) Impuesto sobre la renta (${Math.round(extra.tax*100)} %)`,v:pair('tax',-1)},
  {t:'grand',label:'UTILIDAD NETA',v:pair('net')},
  {t:'item',label:'Utilidad por acción (UPA)',v:pair('eps'),decimals:2},
 ];
}

// Estado de utilidades retenidas: saldo inicial + utilidad neta − dividendos declarados = saldo final.
export function retainedLayout(data:Data,extra:any):Row[]{
 const s=statements(data[2025],extra),t=statements(data[2024],extra);
 const open:[number,number]=[data[2025].retainedOpening,data[2024].retainedOpening],div:[number,number]=[data[2025].dividends,data[2024].dividends];
 return [
  {t:'h2',code:'3.4',label:'Utilidades retenidas'},
  {t:'item',code:'3.4.01',label:'Saldo al 1 de enero',v:open},
  {t:'item',label:'Más: utilidad neta del año',v:[s.net,t.net]},
  {t:'sub',label:'Utilidades disponibles',v:[open[0]+s.net,open[1]+t.net]},
  {t:'sub',code:'3.4.02',label:'Menos: dividendos declarados',v:[-div[0],-div[1]]},
  {t:'grand',label:'UTILIDADES RETENIDAS AL 31 DE DICIEMBRE',v:[s.retained,t.retained]},
 ];
}

export function ProfessorStatement({rows,note}:{rows:Row[],note?:string}){
 return <div className="table-wrap"><table className="pro-statement"><thead><tr><th rowSpan={2}>Código</th><th rowSpan={2}>Cuenta</th><th colSpan={2} className="year-head">2025</th><th colSpan={2} className="year-head">2024</th></tr><tr><th>Partidas</th><th>Totales</th><th>Partidas</th><th>Totales</th></tr></thead><tbody>{rows.map((r,i)=>{
  if(r.t==='h1'||r.t==='h2')return <tr key={i} className={r.t}><td className="code">{r.code}</td><td colSpan={5}>{r.label}</td></tr>;
  const isItem=r.t==='item',d=r.decimals||0,prev=rows[i-1];
  // Signo de dólar: primera partida de cada sección, todos los totales y la utilidad por acción.
  const cur=!isItem||!!r.decimals||!prev||prev.t==='h1'||prev.t==='h2';
  return <tr key={i} className={r.t}><td className="code">{r.code}</td><td>{r.label}</td><td>{isItem?fmt(r.v![0],d,cur):''}</td><td>{isItem?'':fmt(r.v![0],0,cur)}</td><td>{isItem?fmt(r.v![1],d,cur):''}</td><td>{isItem?'':fmt(r.v![1],0,cur)}</td></tr>;
 })}</tbody></table>{note&&<p className="body-small pro-note">{note}</p>}</div>;
}

type ClassRow={code:string,label:string,kind:string,nature:string,statement:string,group:string,value:number,custom?:boolean};
export function classificationRows(data:Data,extra:any):ClassRow[]{
 const base=accounts.map((a:any)=>{const code=accountCodes[a[0]],c=classify(code)!,contra=a[3]!==c.normal;let group=c.label,statement=c.statement;
  if(a[0]==='dividends'){group='Capital contable · se cierra contra utilidades retenidas';}
  if(a[0]==='retainedOpening'){group='Capital contable · saldo inicial antes del cierre';}
  if(a[0]==='taxEntered'){group='Referencia: el ISR se calcula con la tasa';}
  return {code,label:a[1],kind:c.kind,nature:(a[3]==='D'?'Deudora':'Acreedora')+(contra&&!['dividends'].includes(a[0])?' · valuación (resta)':''),statement,group,value:data[2025][a[0]]};});
 const custom=customAccounts(extra).map(c=>{const g=classify(c.code)!;return {code:c.code,label:c.name,kind:g.kind,nature:(c.nature==='D'?'Deudora':'Acreedora')+(c.nature!==g.normal?' · valuación (resta)':''),statement:g.statement,group:g.label,value:Number(data[2025][c.id])||0,custom:true};});
 return [...base,...custom].sort((x,y)=>compareCodes(x.code,y.code));
}

export function ClassificationView({data,extra}:{data:Data,extra:any}){
 const [filter,setFilter]=useState('Todas');
 const rows=classificationRows(data,extra),groups=['Todas',...new Set(rows.map(r=>r.statement+' → '+r.group.split(' · ')[0]))];
 const shown=rows.filter(r=>filter==='Todas'||filter===r.statement+' → '+r.group.split(' · ')[0]);
 const count=(pre:string)=>rows.filter(r=>r.code.startsWith(pre)).length;
 return <>
  <div className="class-summary">{[['1.1','Activo corriente','asset','Deudora'],['1.2','Activo no corriente','asset','Deudora'],['1.3','Otros activos','asset','Deudora'],['2.1','Pasivo corriente','liability','Acreedora'],['2.2','Pasivo no corriente','liability','Acreedora'],['3','Capital','equity','Acreedora'],['4','Ingresos','income','Acreedora'],['5','Costos','cost','Deudora'],['6','Gastos','expense','Deudora']].map(([p,l,k,n])=><div key={p} className={'sum-'+k}><small>{p}</small><strong>{count(p)}</strong><span>{l}</span><em>{n}</em></div>)}</div>
  <section className="panel"><div className="panel-head"><div><h3>Paso 0 · Clasificar cada cuenta</h3><p>Lo que mide el año (ingresos, costos y gastos) va al estado de resultados; lo que es un saldo al 31 de diciembre va al balance general. El código decide el grupo.</p></div></div>
   <div className="table-controls"><select aria-label="Filtrar grupo" value={filter} onChange={e=>setFilter(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select><span className="muted body-small">{shown.length} cuentas · ✦ = cuenta agregada</span></div>
   <div className="table-wrap"><table className="class-table"><thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th>Naturaleza</th><th>Va a</th><th>Grupo</th><th>Saldo 2025</th></tr></thead><tbody>{shown.map(r=><tr key={r.code+r.label}><td className="code">{r.code}</td><td>{r.label}{r.custom?' ✦':''}</td><td>{r.kind}</td><td>{r.nature}</td><td>{r.statement}</td><td><span className="category">{r.group}</span></td><td>{fmt(r.value)}</td></tr>)}</tbody></table></div>
  </section>
  <section className="panel"><div className="panel-head"><div><h3>Cómo se mueve cada tipo de cuenta</h3><p>Cuentas reales (1, 2, 3) van al balance; cuentas nominales (4, 5, 6) van al estado de resultados y se cierran al final del año.</p></div></div>
   <div className="table-wrap"><table className="class-table"><thead><tr><th>Cuenta</th><th>Aumenta con</th><th>Disminuye con</th><th>Naturaleza</th></tr></thead><tbody>{natureRules.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div>
  </section>
 </>;
}

// Guía de códigos: grupos más usados y el siguiente código libre de cada uno.
const codeGuide:[string,string][]=[['1.1','Activo corriente'],['1.2','Propiedad, planta y equipo'],['1.3','Otros activos'],['2.1','Pasivo corriente'],['2.2','Pasivo no corriente'],['3','Capital'],['4.1','Ingresos de operación'],['4.3','Otros ingresos'],['5.1','Costo de materiales'],['5.2','Mano de obra directa'],['5.3','Costos indirectos'],['6.1','Gastos administrativos'],['6.2','Gastos de ventas'],['6.3','Gastos financieros'],['6.7','Otros gastos']];
export function nextCode(prefix:string,used:string[]){const depth=prefix.split('.').length,seg=used.filter(c=>c.startsWith(prefix+'.')).map(c=>Number(c.split('.')[depth])||0),n=Math.max(0,...seg)+1;return prefix+'.'+(prefix.includes('.')?String(n).padStart(2,'0'):String(n));}

export function AddAccount({data,setData,extra,setExtra,onDone}:{data:Data,setData:(d:any)=>void,extra:any,setExtra:(e:any)=>void,onDone:(msg:string)=>void}){
 const [code,setCode]=useState(''),[label,setLabel]=useState(''),[nature,setNature]=useState<'auto'|'D'|'H'>('auto'),[v24,setV24]=useState(''),[v25,setV25]=useState('');
 const c=classify(code),used=new Set([...Object.values(accountCodes),...customAccounts(extra).map(x=>x.code)]);
 const nat=nature==='auto'?(c?.normal||'D'):nature;
 const error=!code?'':!validCode(code)?'El código debe empezar con 1 a 6 y separar niveles con punto (ej. 1.1.06).':!c?'Ese código no corresponde a ningún grupo.':c.group==='tax'?'El impuesto sobre la renta se calcula; no se agrega como cuenta.':used.has(code.replace(/\.+$/,''))?'Ya existe una cuenta con ese código.':'';
 const ok=!!c&&!error&&label.trim().length>1&&Number(v24)>=0&&Number(v25)>=0;
 function add(){if(!ok)return;const id='c'+Date.now().toString(36);const clean=code.trim().replace(/\.+$/,'');
  setExtra({...extra,custom:[...customAccounts(extra),{id,code:clean,name:label.trim(),nature:nat}]});
  setData({...data,2024:{...data[2024],[id]:Number(v24)||0},2025:{...data[2025],[id]:Number(v25)||0}});
  onDone(`Cuenta ${clean} agregada como ${c!.label.toLowerCase()}.`);setCode('');setLabel('');setNature('auto');setV24('');setV25('');}
 return <section className="panel add-account"><div className="panel-head"><div><h3>Agregar una cuenta</h3><p>Escribe el código y ñapa la clasifica sola: 1.1 activo corriente, 1.2 no corriente, 2.1 pasivo corriente, 2.2 no corriente, 3 capital, 4 ingresos, 5 costos, 6 gastos.</p></div></div>
  <div className="code-guide"><span className="code-guide-title">Guía de códigos · toca un grupo para usar el siguiente número libre</span><div>{codeGuide.map(([p,l])=>{const nx=nextCode(p,[...used]);return <button type="button" key={p} className={'code-chip'+(code===nx?' selected':'')} onClick={()=>{setCode(nx);setNature('auto')}} title={`Usar ${nx}`}><strong>{p}</strong><span>{l}</span><small>Siguiente: {nx}</small></button>})}</div></div>
  <div className="add-grid">
   <label><span>Código</span><input value={code} placeholder="1.1.06" onChange={e=>{setCode(e.target.value);setNature('auto')}}/></label>
   <label className="wide"><span>Nombre de la cuenta</span><input value={label} placeholder="Anticipos a empleados" onChange={e=>setLabel(e.target.value)}/></label>
   <div className="nature-field"><span>Naturaleza · automática</span><div className={'nature-pill '+(c?(nat==='D'?'debit':'credit'):'')}>{c?(nat==='D'?'Deudora':'Acreedora'):'Según el código'}</div><label className="contra" title="Márcala si la cuenta resta dentro de su grupo, como una depreciación o amortización acumulada"><input type="checkbox" disabled={!c} checked={!!c&&nat!==c.normal} onChange={e=>setNature(e.target.checked&&c?(c.normal==='D'?'H':'D'):'auto')}/>Valuación (resta)</label></div>
   <label><span>Saldo 2024</span><input type="number" min="0" step="0.01" value={v24} placeholder="0" onChange={e=>setV24(e.target.value)}/></label>
   <label><span>Saldo 2025</span><input type="number" min="0" step="0.01" value={v25} placeholder="0" onChange={e=>setV25(e.target.value)}/></label>
  </div>
  <div className={'add-preview '+(error?'warn':c?'good':'')}>{error||(c?<>Se clasificará como <strong>{c.label}</strong> · va al <strong>{c.statement.toLowerCase()}</strong> · cuenta {c.kind.toLowerCase()}{nat!==c.normal?' · cuenta de valuación (resta)':''}.</>:'Escribe un código para ver su clasificación.')}</div>
  <button className="button primary-btn" disabled={!ok} onClick={add}><Plus size={15}/>Agregar cuenta</button>
 </section>;
}

export function removeCustom(id:string,data:Data,extra:any){const d:any={...data,2024:{...data[2024]},2025:{...data[2025]}};delete d[2024][id];delete d[2025][id];return {data:d,extra:{...extra,custom:customAccounts(extra).filter(c=>c.id!==id)}};}
export {Trash2,groupName};
