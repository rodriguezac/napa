'use client';
import React from 'react';
import {RefreshCw} from 'lucide-react';
import {statements,project,historicalAssumptions} from '../lib/finance.mjs';
import {budget,budgetDefaults,budgetLabels} from '../lib/budget.mjs';

type Data=Record<number,Record<string,number>>;
const usd=(v:number,d=0)=>{if(!Number.isFinite(v))return '—';const n='$'+new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(v));return Math.abs(v)<.005?'—':v<0?`(${n})`:n;};
const num=(v:number,d=0)=>Number.isFinite(v)?new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v):'—';
const pctKeys=['growth','returnsRate','materialInflation','endInventoryPct','variableRate','payout'];

type Line=any[];
function Table({head,rows}:{head:string[],rows:(Line|{section:string})[]}){
 return <div className="table-wrap"><table className="budget-table"><thead><tr>{head.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=>'section' in r?<tr key={i} className="h2"><td colSpan={head.length}>{r.section}</td></tr>:<tr key={i} className={r[4]||''}><td>{r[0]}</td>{r.slice(1,head.length).map((v,j)=><td key={j}>{typeof v==='number'?usd(v):v??''}</td>)}</tr>)}</tbody></table></div>;
}

export default function BudgetView({data,extra,params,setParams}:{data:Data,extra:any,params:any,setParams:(p:any)=>void}){
 const a=data[2025],base=budgetDefaults(a,extra),b=params||base,r=budget(a,b,extra),s=statements(a,extra);
 const p1=project(a,{...historicalAssumptions(a,extra),growth:b.growth,payout:b.payout,fixedShare:0},extra,'percent');
 const [jug,bucket]=r.lines;
 const set=(k:string,raw:string)=>{const v=Number(raw)/(pctKeys.includes(k)?100:1);if(Number.isFinite(v)&&v>=0&&v<1e10)setParams({...b,[k]:v});};
 const field=(k:string)=><label key={k} className="budget-field"><span>{budgetLabels[k]}</span><span className="input-unit"><input type="number" step={pctKeys.includes(k)?'0.1':k.startsWith('price')||k.includes('_')?'0.01':'1'} min="0" value={+(b[k]*(pctKeys.includes(k)?100:1)).toFixed(pctKeys.includes(k)?2:k.includes('_')||k.startsWith('price')?4:2)} onChange={e=>set(k,e.target.value)}/><small>{pctKeys.includes(k)?'%':k==='days'?'días':'USD'}</small></span></label>;
 return <>
  <div className="notice"><span><strong>Método de presupuestos (caso Goldman).</strong> Parte de las unidades que se venderán de cada producto, programa la producción, calcula el costo de ventas con PEPS (primero se vende el inventario inicial), arma el presupuesto de efectivo y, con él, el balance. Si la caja queda por debajo del mínimo, el faltante se pide prestado en documentos por pagar.</span></div>
  <div className="metrics four">
   <div className="metric good"><div className="metric-top">Utilidad neta 2026<span className="metric-icon">II</span></div><strong>{usd(r.net)}</strong><div className="metric-note">Margen {num(r.margin*100,2)} %</div></div>
   <div className="metric"><div className="metric-top">Préstamo requerido<span className="metric-icon">$</span></div><strong>{usd(r.borrow)}</strong><div className="metric-note">Se suma a documentos por pagar</div></div>
   <div className="metric"><div className="metric-top">Caja al cierre de 2026<span className="metric-icon">◎</span></div><strong>{usd(r.cash)}</strong><div className="metric-note">Mínimo: {usd(b.minCash)}</div></div>
   <div className={'metric '+(Math.abs(r.gap)<.01?'good':'bad')}><div className="metric-top">Comprobación del balance<span className="metric-icon">=</span></div><strong>{"$"+Math.abs(r.gap).toFixed(2)}</strong><div className="metric-note">Activos − pasivos − capital</div></div>
  </div>
  <section className="panel"><div className="panel-head"><div><h3>Supuestos de la proyección por presupuestos</h3><p>Valores iniciales calculados con 2025; cámbialos y todo se recalcula. Los costos por unidad reparten el costo de 2025 según las ventas de cada producto.</p></div><button className="button secondary" onClick={()=>setParams(null)}><RefreshCw size={15}/>Restaurar</button></div>
   <h4 className="budget-sub">Ventas y producción</h4><div className="budget-grid">{['growth','priceJug','priceBucket','returnsRate','endInventoryPct','materialInflation'].map(field)}</div>
   <h4 className="budget-sub">Costo por unidad</h4><div className="budget-grid">{['mat_jug','lab_jug','oh_jug','mat_bucket','lab_bucket','oh_bucket'].map(field)}</div>
   <h4 className="budget-sub">Gastos, cobros y efectivo</h4><div className="budget-grid">{['variableRate','days','payout','capex','debtPayment','minCash'].map(field)}</div>
  </section>
  <div className="two-col">
   <section className="panel"><div className="panel-head"><div><h3>Paso 1 · Pronóstico de ventas</h3><p>Unidades 2025 × (1 + crecimiento) × precio.</p></div></div>
    <Table head={['Producto','Unidades 2025','Unidades 2026','Precio','Ventas brutas']} rows={[
     [jug.name,num(extra.unitsJug),num(jug.units),usd(jug.price,2),jug.gross],
     [bucket.name,num(extra.unitsBucket),num(bucket.units),usd(bucket.price,2),bucket.gross],
     ['Ventas brutas','','','',r.grossSales,'sub'],
     ['(−) Devoluciones y descuentos','','','',-r.returns],
     ['VENTAS NETAS','','','',r.sales,'grand']]}/></section>
   <section className="panel"><div className="panel-head"><div><h3>Paso 2 · Programa de producción</h3><p>Unidades a producir = ventas + inventario final deseado − inventario inicial.</p></div></div>
    <Table head={['Unidades','Garrafones','Cubetas']} rows={[
     ['Unidades a vender',num(jug.units),num(bucket.units)],
     ['(+) Inventario final deseado',num(jug.endUnits),num(bucket.endUnits)],
     ['(−) Inventario inicial',`(${num(jug.begUnits)})`,`(${num(bucket.begUnits)})`],
     ['UNIDADES A PRODUCIR',num(jug.prodUnits),num(bucket.prodUnits),undefined,'grand']]}/></section>
  </div>
  <div className="two-col">
   <section className="panel"><div className="panel-head"><div><h3>Paso 3 · Costo de producción</h3><p>Costo por unidad × unidades producidas.</p></div></div>
    <Table head={['Concepto','Garrafones','Cubetas','Total']} rows={[
     ['Materiales por unidad',usd(jug.mat,4),usd(bucket.mat,4),''],
     ['Mano de obra por unidad',usd(jug.lab,4),usd(bucket.lab,4),''],
     ['Costos indirectos por unidad',usd(jug.oh,4),usd(bucket.oh,4),''],
     ['Costo total por unidad',usd(jug.unitCost,4),usd(bucket.unitCost,4),'','sub'],
     ['Materiales',jug.matCost,bucket.matCost,r.production.materials],
     ['Mano de obra directa',jug.labCost,bucket.labCost,r.production.labor],
     ['Costos indirectos',jug.ohCost,bucket.ohCost,r.production.overhead],
     ['COSTO DE PRODUCCIÓN',jug.prodCost,bucket.prodCost,r.production.total,'grand']]}/></section>
   <section className="panel"><div className="panel-head"><div><h3>Paso 4 · Costo de ventas (PEPS) e inventario final</h3><p>Primero se vende el inventario inicial a su costo de 2025; el resto, a costo de 2026.</p></div></div>
    <Table head={['Concepto','Garrafones','Cubetas','Total']} rows={[
     ['Inventario inicial vendido (costo 2025)',jug.begValue*jug.fromBeg/(jug.begUnits||1),bucket.begValue*bucket.fromBeg/(bucket.begUnits||1),jug.begValue*jug.fromBeg/(jug.begUnits||1)+bucket.begValue*bucket.fromBeg/(bucket.begUnits||1)],
     ['(+) Unidades nuevas vendidas × costo 2026',jug.cogs-jug.begValue*jug.fromBeg/(jug.begUnits||1),bucket.cogs-bucket.begValue*bucket.fromBeg/(bucket.begUnits||1),r.cost-(jug.begValue*jug.fromBeg/(jug.begUnits||1)+bucket.begValue*bucket.fromBeg/(bucket.begUnits||1))],
     ['COSTO DE VENTAS',jug.cogs,bucket.cogs,r.cost,'grand'],
     ['Inventario final de producto terminado',jug.endValue,bucket.endValue,r.finishedEnd,'sub']]}/></section>
  </div>
  <div className="two-col">
   <section className="panel"><div className="panel-head"><div><h3>Paso 5 · Estado de resultados proyectado</h3><p>Comparado con la proyección por % de ventas con los mismos supuestos de crecimiento y dividendos.</p></div></div>
    <Table head={['Concepto','Por presupuestos','Por % de ventas']} rows={[
     ['Ventas netas',r.sales,p1.sales],['(−) Costo de ventas',-r.cost,-p1.cost],['UTILIDAD BRUTA',r.gross,p1.sales-p1.cost,undefined,'sub'],
     ['(−) Gastos de operación variables',-r.variable,-p1.variable],['(−) Depreciación, amortización y arrendamientos',-(a.dep+a.amort+a.rent),-(a.dep+a.amort+a.rent)],
     ['UTILIDAD DE OPERACIÓN (UAII)',r.ebit,p1.ebit,undefined,'sub'],['(+) Ingresos financieros',a.finIncome,a.finIncome],['(−) Intereses',-a.interest,-a.interest],
     ['UTILIDAD ANTES DE IMPUESTOS',r.ebt,p1.ebt,undefined,'sub'],[`(−) ISR (${Math.round(extra.tax*100)} %)`,-r.tax,-p1.tax],['UTILIDAD NETA',r.net,p1.net,undefined,'grand'],
     ['Dividendos (pago '+num(b.payout*100,0)+' %)',-r.dividend,-p1.dividend]]}/></section>
   <section className="panel"><div className="panel-head"><div><h3>Paso 6 · Presupuesto de efectivo 2026</h3><p>Entradas y salidas de dinero del año; el préstamo cubre el faltante para mantener la caja mínima.</p></div></div>
    <Table head={['Concepto','USD']} rows={[
     ['Saldo inicial de caja (2025)',r.beginCash],{section:'Entradas de efectivo'},...r.receipts.map((x:any)=>[x[0],x[1]] as Line),['Total entradas',r.totalIn,undefined,undefined,'sub'],
     {section:'Salidas de efectivo'},...r.payments.map((x:any)=>[x[0],-x[1]] as Line),['Total salidas',-r.totalOut,undefined,undefined,'sub'],
     ['Saldo antes de financiamiento',r.beforeFinancing,undefined,undefined,'sub'],['(+) Préstamo requerido (documentos por pagar)',r.borrow],['SALDO FINAL DE CAJA',r.cash,undefined,undefined,'grand']]}/></section>
  </div>
  <section className="panel"><div className="panel-head"><div><h3>Paso 7 · Balance general proyectado</h3><p>Al 31 de diciembre de 2026, comparado con 2025. Debe cuadrar sin ajustes ocultos.</p></div></div>
   <Table head={['Concepto','2026 · proyectado','2025']} rows={[
    {section:'Activos corrientes'},['Caja y bancos',r.cash,a.cash],['Valores negociables',r.securities,a.securities],['Cuentas por cobrar netas',r.ar,s.ar],['Inventarios (materia prima, en proceso y terminados)',r.inventory,s.inventory],['Gastos pagados por anticipado',r.prepaid,a.prepaid],['Total activos corrientes',r.ca,s.ca,undefined,'sub'],
    ['Activos fijos netos (+ compras − depreciación)',r.fixed,s.fixed],['Otros activos (− amortización)',r.other,s.other],['TOTAL ACTIVOS',r.assets,s.assets,undefined,'grand'],
    {section:'Pasivos'},['Cuentas por pagar a proveedores',r.payables,a.payables],['Documentos por pagar (+ préstamo)',r.notes,a.notes],['Gastos acumulados por pagar',r.accrued,a.accrued],['ISR, porción corriente y dividendos por pagar',r.taxPay+r.currentDebt+r.divPay,a.taxPay+a.currentDebt+a.divPay],['Total pasivos corrientes',r.cl,s.cl,undefined,'sub'],
    ['Préstamo bancario a largo plazo',r.loan,a.loan],['Bonos por pagar',r.bonds,a.bonds],['TOTAL PASIVOS',r.debt,s.debt,undefined,'sub'],
    {section:'Capital contable'},['Capital común y pagado en exceso',a.capital+a.premium,a.capital+a.premium],['Utilidades retenidas',r.retained,s.retained],['TOTAL CAPITAL CONTABLE',r.equity,s.equity,undefined,'sub'],
    ['TOTAL PASIVOS Y CAPITAL',r.debt+r.equity,s.debt+s.equity,undefined,'grand']]}/></section>
 </>;
}
