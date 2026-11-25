'use client';
import React,{useState} from 'react';
import {ArrowDownRight,ArrowUpRight,CheckCheck,Info,Minus,RefreshCw,TriangleAlert} from 'lucide-react';
import {accounts,complementary,ratioImpact,statements} from '../lib/finance.mjs';

const money=(v:number,d=0)=>Number.isFinite(v)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:d,minimumFractionDigits:d}).format(Math.abs(v)<0.005?0:v):'No disponible';
const num=(v:number,d=2)=>Number.isFinite(v)?new Intl.NumberFormat('es-PA',{maximumFractionDigits:d,minimumFractionDigits:d}).format(Math.abs(v)<0.00005?0:v):'No disponible';
const pct=(v:number,d=2)=>num(v*100,d)+' %';
const pp=(v:number)=>(v>=0?'+':'')+num(v*100,2)+' p.p.';

function Panel({title,subtitle,children,tag}:{title:string,subtitle?:string,children:React.ReactNode,tag?:string}){return <section className="panel"><div className="panel-head"><div><h3>{tag&&<span className="module-tag">{tag}</span>}{title}</h3>{subtitle&&<p>{subtitle}</p>}</div></div>{children}</section>}
function Notice({children,tone='info'}:{children:React.ReactNode,tone?:string}){return <div className={'notice '+tone}>{tone==='good'?<CheckCheck size={19}/>:tone==='warn'?<TriangleAlert size={19}/>:<Info size={19}/>}<div>{children}</div></div>}
function List({rows}:{rows:[string,string][]}){return <div className="summary-list">{rows.map(([l,v])=><div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>}

/** Módulo 7 del caso v3.1: indicadores complementarios de los capítulos 2 y 3. */
export function ComplementaryView({data,extra}:{data:any,extra:any}){
 const [prices,setPrices]=useState<Record<number,number|null>>({2024:null,2025:null});
 const c=complementary(data,extra,prices),tax=pct(extra.tax,0);
 const sh=c.shield,ps=c.perShare,nv=c.netVsCash,dp=c.dupont,cr=c.credit[2025];
 const mainEffect=[...dp.effects].sort((x:any,y:any)=>Math.abs(y.value)-Math.abs(x.value))[0];
 return <>
  <Notice>Siete indicadores que se recalculan con las cuentas de <strong>Datos de entrada</strong>. Cifras en USD; tasa de ISR de {tax}.</Notice>
  <div className="two-col">
   <Panel tag="a" title="Escudo fiscal de la depreciación" subtitle={`Impuesto ahorrado = (depreciación + amortización) × ${tax}`}>
    <div className="table-wrap"><table><thead><tr><th>Concepto</th><th>2024</th><th>2025</th></tr></thead><tbody>
     {[['Depreciación','dep'],['Amortización de intangibles','amort'],['Gasto que no usa efectivo','nonCash']].map(([l,k])=><tr key={k} className={k==='nonCash'?'subtotal':''}><td>{l}</td><td>{money(sh[2024][k])}</td><td>{money(sh[2025][k])}</td></tr>)}
     <tr className="subtotal"><td>Impuesto ahorrado (escudo fiscal)</td><td>{money(sh[2024].saving)}</td><td>{money(sh[2025].saving)}</td></tr>
     <tr><td>Utilidad neta reportada</td><td>{money(sh[2024].net)}</td><td>{money(sh[2025].net)}</td></tr>
     <tr><td>Utilidad neta sin esos gastos</td><td>{money(sh[2024].netWithout)}</td><td>{money(sh[2025].netWithout)}</td></tr>
     <tr><td>Flujo de operación reportado</td><td>{money(sh[2024].cfo)}</td><td>{money(sh[2025].cfo)}</td></tr>
     <tr><td>Flujo de operación sin esos gastos</td><td>{money(sh[2024].cfoWithout)}</td><td>{money(sh[2025].cfoWithout)}</td></tr>
    </tbody></table></div>
    <p className="body-small">Sin depreciación la utilidad sería mayor, pero el flujo de operación sería <strong>menor</strong> en {money(sh[2025].saving)}, porque se pagaría más ISR. La depreciación no sale de caja y reduce impuestos.</p>
   </Panel>
   <Panel tag="b" title="Costo de los gastos después de impuestos" subtitle={`Costo después de ISR = gasto × (1 − ${tax})`}>
    <div className="table-wrap"><table><thead><tr><th>Gasto 2025</th><th>Antes del ISR</th><th>Ahorro de ISR</th><th>Después del ISR</th></tr></thead><tbody>
     {c.afterTax.map((r:any)=><tr key={r.label}><td>{r.label}</td><td>{money(r.before)}</td><td>{money(r.saving)}</td><td>{money(r.after)}</td></tr>)}
     <tr className="subtotal"><td>Total</td><td>{money(c.afterTax.reduce((v:number,r:any)=>v+r.before,0))}</td><td>{money(c.afterTax.reduce((v:number,r:any)=>v+r.saving,0))}</td><td>{money(c.afterTax.reduce((v:number,r:any)=>v+r.after,0))}</td></tr>
    </tbody></table></div>
    <p className="body-small">Como intereses y arrendamientos son deducibles, cada dólar gastado le cuesta a la empresa {money(1-extra.tax,2)} después de impuestos.</p>
   </Panel>
  </div>
  <div className="two-col">
   <Panel tag="c" title="Valor en libros por acción y relación P/U" subtitle="Valor en libros = capital contable / acciones · P/U = precio / utilidad por acción">
    <div className="table-wrap"><table><thead><tr><th>Por acción</th><th>2024</th><th>2025</th></tr></thead><tbody>
     <tr><td>Valor en libros por acción</td><td>{money(ps[2024].book,2)}</td><td>{money(ps[2025].book,2)}</td></tr>
     <tr><td>Utilidad por acción (UPA)</td><td>{money(ps[2024].eps,2)}</td><td>{money(ps[2025].eps,2)}</td></tr>
     <tr><td>Dividendo por acción</td><td>{money(ps[2024].dps,2)}</td><td>{money(ps[2025].dps,2)}</td></tr>
     <tr><td>Razón de pago de dividendos</td><td>{pct(ps[2024].payout)}</td><td>{pct(ps[2025].payout)}</td></tr>
     <tr><td>Precio usado</td><td>{money(ps[2024].price,2)}</td><td>{money(ps[2025].price,2)}</td></tr>
     <tr className="subtotal"><td>Relación precio-utilidad (P/U)</td><td>{num(ps[2024].pe)}×</td><td>{num(ps[2025].pe)}×</td></tr>
    </tbody></table></div>
    <div className="price-inputs">{[2024,2025].map(y=><label className="inline-field" key={y}><span>Precio de mercado {y} (opcional)</span><input type="number" min="0" step="0.01" placeholder="Valor en libros" aria-label={`Precio de mercado por acción ${y}`} value={prices[y]??''} onChange={e=>{const v=e.target.value===''?null:Number(e.target.value);if(v===null||(Number.isFinite(v)&&v>=0))setPrices({...prices,[y]:v})}}/></label>)}</div>
    <p className="body-small">El caso no da precio de mercado; sin él, el P/U se calcula con el valor en libros. El valor por acción subió, pero la UPA cayó de {money(ps[2024].eps,2)} a {money(ps[2025].eps,2)}: cada dólar de utilidad “cuesta” más.</p>
   </Panel>
   <Panel tag="d" title="Conciliación de ventas por producto" subtitle="Unidades × precio = ventas brutas de la balanza">
    <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Unidades</th><th>Precio</th><th>Ventas</th><th>Participación</th></tr></thead><tbody>
     {c.products.rows.map((r:any)=><tr key={r.label}><td>{r.label}</td><td>{num(r.units,0)}</td><td>{money(r.price,2)}</td><td>{money(r.amount)}</td><td>{pct(r.share)}</td></tr>)}
     <tr className="subtotal"><td>Total por producto</td><td></td><td></td><td>{money(c.products.total)}</td><td>100.00 %</td></tr>
     <tr><td>Ventas brutas de la balanza</td><td></td><td></td><td>{money(c.products.gross)}</td><td></td></tr>
    </tbody></table></div>
    <div className="share-bar" aria-hidden="true">{c.products.rows.map((r:any,i:number)=><span key={r.label} style={{width:`${Math.max(0,r.share*100)}%`,background:i?'#3e82f7':'#6fab23'}}>{pct(r.share,1)}</span>)}</div>
    <Notice tone={Math.abs(c.products.gap)<.01?'good':'warn'}>{Math.abs(c.products.gap)<.01?'Conciliado: la suma por producto es igual a las ventas brutas.':`Diferencia de ${money(c.products.gap)}: revise unidades, precios o ventas brutas.`}</Notice>
   </Panel>
  </div>
  <Panel tag="e" title="Utilidad neta frente al flujo de operación" subtitle="Diferencia = flujo de operación − utilidad neta · tres partidas de capital de trabajo que más la explican">
   <div className="two-col">{[2024,2025].map(y=><div key={y}><h4 className="subhead">{y}</h4><List rows={[['Utilidad neta',money(nv[y].net)],['Flujo neto de operación',money(nv[y].cfo)],['Diferencia',money(nv[y].difference)],['Gastos sin efectivo (dep. + amort.)',money(nv[y].nonCash)],['Cambio total en capital de trabajo',money(nv[y].workingCapital)]]}/><p className="body-small"><strong>Partidas que más la explican:</strong></p><ol className="ranked">{nv[y].top.map((r:any)=><li key={r.label}>{r.label}: <strong>{money(r.value)}</strong> {r.value<0?'(absorbe efectivo)':'(libera efectivo)'}</li>)}</ol></div>)}</div>
   <p className="body-small">En 2025 el capital de trabajo absorbió {money(-nv[2025].workingCapital)}, más que los gastos sin efectivo que se suman ({money(nv[2025].nonCash)}): por eso el efectivo de operación quedó por debajo de la utilidad.</p>
  </Panel>
  <Panel tag="f" title="Du Pont descompuesto" subtitle="ROE = margen × rotación de activos × multiplicador de capital (activos / capital). Sustitución sucesiva 2024 → 2025.">
   <div className="table-wrap"><table><thead><tr><th>Componente</th><th>2024</th><th>2025</th><th>Efecto en el ROE</th></tr></thead><tbody>
    <tr><td>Margen de utilidad</td><td>{pct(dp[2024].margin)}</td><td>{pct(dp[2025].margin)}</td><td className={dp.effects[0].value<0?'negative':''}>{pp(dp.effects[0].value)}</td></tr>
    <tr><td>Rotación de activos</td><td>{num(dp[2024].turnover,4)}×</td><td>{num(dp[2025].turnover,4)}×</td><td className={dp.effects[1].value<0?'negative':''}>{pp(dp.effects[1].value)}</td></tr>
    <tr><td>Multiplicador de capital = 1 / (1 − deuda/activos)</td><td>{num(dp[2024].multiplier,4)}×</td><td>{num(dp[2025].multiplier,4)}×</td><td className={dp.effects[2].value<0?'negative':''}>{pp(dp.effects[2].value)}</td></tr>
    <tr className="subtotal"><td>ROE</td><td>{pct(dp[2024].roe)}</td><td>{pct(dp[2025].roe)}</td><td className={dp.change<0?'negative':''}>{pp(dp.change)}</td></tr>
   </tbody></table></div>
   <div className="metrics two"><div className="metric bad"><div className="metric-top">Operación (margen + rotación)</div><strong>{pp(dp.operating)}</strong><div className="metric-note">{dp.change?pct(dp.operating/dp.change,1):'—'} de la variación</div></div><div className="metric neutral"><div className="metric-top">Financiamiento (endeudamiento)</div><strong>{pp(dp.financing)}</strong><div className="metric-note">{dp.change?pct(dp.financing/dp.change,1):'—'} de la variación</div></div></div>
   <p className="body-small">El componente que más explica el cambio es <strong>{mainEffect.label.toLowerCase()}</strong>. {dp.financing>0?'El mayor endeudamiento amortiguó un poco la caída, pero no la compensó.':''}</p>
  </Panel>
  <Panel tag="g" title="Costo de la política de crédito" subtitle="Efectivo inmovilizado = (PPC real − 45 días) × ventas diarias">
   <div className="equation"><span><small>PPC 2025</small>{num(cr.ppc)} días</span><b>−</b><span><small>Industria</small>45 días</span><b>×</b><span><small>Ventas diarias</small>{money(cr.daily,2)}</span><b>=</b><span className="equation-result"><small>Efectivo inmovilizado</small>{money(cr.tiedUp)}</span></div>
   <p className="body-small">Ventas diarias = ventas netas / {num(extra.days,0)} días. En 2024 el PPC fue {num(c.credit[2024].ppc)} días, {c.credit[2024].excessDays<=0?'por debajo de la industria: no había efectivo inmovilizado por crédito':'por encima de la industria'}. Financiar ese saldo a la tasa promedio de la deuda de 2025 costaría cerca de {money(cr.interestCost)} al año en intereses.</p>
  </Panel>
 </>;
}

const watched=['receivables','interest','raw','finished','payables','notes','grossSales','materials','rent','cash','loan','dividends'];

/** Prueba en vivo: el profesor cambia una cuenta y el grupo explica qué razones se mueven. */
export function RatioImpactView({data,extra}:{data:any,extra:any}){
 const [key,setKey]=useState('receivables'),[year,setYear]=useState(2025);
 const original=data[year][key],[value,setValue]=useState<number|null>(null),current=value??original;
 const rows=ratioImpact(data,extra,key,current,year),moved=rows.filter(r=>r.moved);
 const s0=statements(data[year],extra),changed={...data,[year]:{...data[year],[key]:current}},s1=statements(changed[year],extra);
 const name=(k:string)=>accounts.find((a:any)=>a[0]===k)?.[1]??k;
 const fmt=(r:any,v:number)=>r.unit==='%'?pct(v):num(v,2)+(r.unit==='d'?' días':'×');
 const options=[...watched,...accounts.map((a:any)=>a[0]).filter((k:string)=>!watched.includes(k))];
 return <>
  <Notice>Regla de la sustentación: el profesor puede cambiar una cuenta de la balanza. Primero expliquen qué razones cambian y en qué dirección; después muestren el resultado aquí. <strong>Este cambio no modifica sus datos guardados.</strong></Notice>
  <div className="two-col">
   <Panel title="Cuenta a modificar" subtitle="Elija la cuenta y escriba el nuevo saldo">
    <div className="tabs">{[2024,2025].map(y=><button key={y} className={year===y?'selected':''} onClick={()=>{setYear(y);setValue(null)}}>{y}</button>)}</div>
    <label className="inline-field"><span>Cuenta</span><select aria-label="Cuenta a modificar" value={key} onChange={e=>{setKey(e.target.value);setValue(null)}}>{options.map(k=><option key={k} value={k}>{name(k)}</option>)}</select></label>
    <label className="inline-field"><span>Saldo actual</span><strong>{money(original)}</strong></label>
    <label className="inline-field"><span>Nuevo saldo</span><input type="number" min="0" step="1000" aria-label="Nuevo saldo" value={current} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>=0)setValue(v)}}/></label>
    <div className="button-group">{[-.2,-.1,.1,.2].map(f=><button key={f} className="button secondary" onClick={()=>setValue(Math.round(original*(1+f)))}>{f>0?'+':''}{f*100} %</button>)}<button className="button secondary" onClick={()=>setValue(null)}><RefreshCw size={15}/>Restaurar</button></div>
   </Panel>
   <Panel title="Efecto en los estados" subtitle={`${name(key)} · ${money(original)} → ${money(current)}`}>
    <List rows={[['Utilidad neta',`${money(s0.net)} → ${money(s1.net)}`],['Activos totales',`${money(s0.assets)} → ${money(s1.assets)}`],['Pasivos totales',`${money(s0.debt)} → ${money(s1.debt)}`],['Capital contable',`${money(s0.equity)} → ${money(s1.equity)}`],['Diferencia del balance',money(s1.gap)]]}/>
    {Math.abs(s1.gap)>.01&&<Notice tone="warn">Al cambiar una sola cuenta la balanza deja de cuadrar por {money(s1.gap)}. Es normal en la prueba: la contrapartida no se modificó.</Notice>}
    <p className="body-small"><strong>{moved.length}</strong> de 13 razones cambian.</p>
   </Panel>
  </div>
  <Panel title="Razones que cambian" subtitle="Dirección del cambio y si mejora o empeora frente a la industria">
   <div className="table-wrap"><table><thead><tr><th>Razón</th><th>Categoría</th><th>Antes</th><th>Después</th><th>Dirección</th><th>Efecto</th></tr></thead><tbody>
    {rows.map(r=><tr key={r.name} className={r.moved?'':'muted-row'}><td>{r.name}</td><td>{r.category}</td><td>{fmt(r,r.before)}</td><td>{fmt(r,r.after)}</td><td>{!r.moved?<Minus size={15} aria-label="Sin cambio"/>:r.delta>0?<span className="up"><ArrowUpRight size={15}/>Sube</span>:<span className="down"><ArrowDownRight size={15}/>Baja</span>}</td><td>{!r.moved?'Sin cambio':<span className={'badge '+(r.better?'good':'bad')}><span/>{r.better?'Mejora':'Empeora'}</span>}</td></tr>)}
   </tbody></table></div>
   <p className="body-small">“Mejora” o “Empeora” indica solo la dirección frente a la referencia de la industria. Interprétenlo con el caso: por ejemplo, más cuentas por cobrar suben la razón circulante, pero porque los clientes pagan más tarde.</p>
  </Panel>
 </>;
}
