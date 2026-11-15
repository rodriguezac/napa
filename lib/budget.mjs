// Pro-forma II · método de presupuestos (caso Goldman Corporation, Block, Hirt y Danielsen, cap. 4).
// Pasos: pronóstico de ventas → programa de producción → costo de producción → costo de ventas (PEPS)
// → estado de resultados → presupuesto de efectivo → balance general. Todo parte de los estados de 2025.
import {statements,customTotals} from './finance.mjs';

const products=extra=>[
 {key:'jug',name:'Garrafones de 5 galones',units:extra.unitsJug,price:extra.priceJug},
 {key:'bucket',name:'Cubetas industriales',units:extra.unitsBucket,price:extra.priceBucket},
];

// Supuestos base: se derivan de 2025 y todos son editables en la pantalla.
export function budgetDefaults(a,extra){
 const s=statements(a,extra),ps=products(extra),productSales=ps.reduce((t,p)=>t+p.units*p.price,0)||1;
 // Costo por dólar de precio de cada componente: reparte el costo de 2025 según las ventas de cada producto.
 const per=k=>a[k]/productSales;
 const d={growth:.12,priceJug:extra.priceJug,priceBucket:extra.priceBucket,returnsRate:a.grossSales?a.returns/a.grossSales:0,
  materialInflation:0,endInventoryPct:s.cost?a.finished/s.cost:0,
  variableRate:s.sales?(s.opex-a.dep-a.amort-a.rent-(s.custom?.opex||0))/s.sales:0,
  days:s.sales?s.ar*extra.days/s.sales:0,payout:.4,capex:a.dep,debtPayment:a.currentDebt,minCash:a.cash};
 for(const p of ps){d['mat_'+p.key]=per('materials')*p.price;d['lab_'+p.key]=per('labor')*p.price;d['oh_'+p.key]=per('overhead')*p.price;}
 return d;
}

export const budgetLabels={growth:'Crecimiento de unidades vendidas',priceJug:'Precio por garrafón (USD)',priceBucket:'Precio por cubeta (USD)',returnsRate:'Devoluciones / ventas brutas',materialInflation:'Aumento del costo de materiales 2026',endInventoryPct:'Inventario final terminado (% de unidades)',variableRate:'Gastos de operación variables / ventas netas',days:'Período promedio de cobranza (días)',payout:'Razón de pago de dividendos',capex:'Compras de activos fijos (USD)',debtPayment:'Pago de deuda a largo plazo (USD)',minCash:'Saldo mínimo de caja (USD)',mat_jug:'Materiales por garrafón (USD)',lab_jug:'Mano de obra por garrafón (USD)',oh_jug:'Costos indirectos por garrafón (USD)',mat_bucket:'Materiales por cubeta (USD)',lab_bucket:'Mano de obra por cubeta (USD)',oh_bucket:'Costos indirectos por cubeta (USD)'};

export function budget(a,b,extra){
 const s=statements(a,extra),c=customTotals(a,extra),base=budgetDefaults(a,extra),ps=products(extra);
 // Paso 1-4: ventas, producción y costo de ventas por producto (PEPS: primero sale el inventario inicial).
 const begTotalCost=ps.reduce((t,p)=>t+p.units*(base['mat_'+p.key]+base['lab_'+p.key]+base['oh_'+p.key]),0)||1;
 const lines=ps.map(p=>{
  const price=p.key==='jug'?b.priceJug:b.priceBucket,units=p.units*(1+b.growth),gross=units*price;
  const oldUnitCost=base['mat_'+p.key]+base['lab_'+p.key]+base['oh_'+p.key];
  const mat=b['mat_'+p.key]*(1+b.materialInflation),lab=b['lab_'+p.key],oh=b['oh_'+p.key],unitCost=mat+lab+oh;
  // El inventario inicial de producto terminado (2025) se reparte según el costo de lo vendido de cada producto.
  const begValue=a.finished*(p.units*oldUnitCost)/begTotalCost,begUnits=oldUnitCost?begValue/oldUnitCost:0;
  const endUnits=units*b.endInventoryPct,prodUnits=Math.max(0,units+endUnits-begUnits);
  const fromBeg=Math.min(begUnits,units),cogs=(begUnits?begValue*fromBeg/begUnits:0)+(units-fromBeg)*unitCost;
  const endValue=endUnits*unitCost+(begUnits>units?begValue*(begUnits-units)/begUnits:0);
  return {key:p.key,name:p.name,units,price,gross,begUnits,begValue,endUnits,prodUnits,mat,lab,oh,unitCost,
   matCost:prodUnits*mat,labCost:prodUnits*lab,ohCost:prodUnits*oh,prodCost:prodUnits*unitCost,fromBeg,cogs,endValue};
 });
 const sum=k=>lines.reduce((t,l)=>t+l[k],0);
 const grossSales=sum('gross'),returns=grossSales*b.returnsRate,sales=grossSales-returns,cost=sum('cogs');
 const production={materials:sum('matCost'),labor:sum('labCost'),overhead:sum('ohCost'),total:sum('prodCost')};
 // Paso 5: estado de resultados pro-forma II.
 const variable=sales*b.variableRate,opex=variable+a.dep+a.amort+a.rent+c.opex,gross=sales-cost,ebit=gross-opex;
 const ebt=ebit+a.finIncome-a.interest+c.otherIncome-c.nonOperating,tax=Math.max(0,ebt*extra.tax),net=ebt-tax,dividend=Math.max(0,net)*b.payout;
 // Paso 6: presupuesto de efectivo.
 const arEnd=sales*b.days/extra.days,collections=s.ar+sales-arEnd;
 const purchases=production.materials,payRatio=a.materials?a.payables/a.materials:0,payablesEnd=purchases*payRatio,paySuppliers=a.payables+purchases-payablesEnd;
 const accruedEnd=s.sales?a.accrued*sales/s.sales:a.accrued,payOpex=variable+a.rent+c.opex-(accruedEnd-a.accrued);
 const reclass=Math.min(b.debtPayment,a.loan);
 const receipts=[['Cobros a clientes',collections],['Ingresos financieros',a.finIncome+c.otherIncome]];
 const payments=[['Pagos a proveedores de materiales',paySuppliers],['Mano de obra directa',production.labor],['Costos indirectos de fabricación',production.overhead],['Gastos de operación en efectivo',payOpex],['Intereses y otros gastos no operativos',a.interest+c.nonOperating],['Impuesto sobre la renta',tax],['Dividendos pagados',dividend],['Compras de activos fijos',b.capex],['Pago de la porción corriente de la deuda',a.currentDebt]];
 const totalIn=receipts.reduce((t,r)=>t+r[1],0),totalOut=payments.reduce((t,r)=>t+r[1],0),beforeFinancing=a.cash+totalIn-totalOut;
 const borrow=Math.max(0,b.minCash-beforeFinancing),cash=beforeFinancing+borrow;
 // Paso 7: balance general pro-forma II.
 const ar=arEnd,inventory=a.raw+a.wip+sum('endValue'),ca=cash+a.securities+ar+inventory+a.prepaid+c.ca;
 const fixed=s.fixed+b.capex-a.dep,other=s.other-a.amort,assets=ca+fixed+other;
 const notes=a.notes+borrow,cl=payablesEnd+notes+accruedEnd+a.taxPay+reclass+a.divPay+c.cl,loan=a.loan-reclass,long=loan+a.bonds+c.long,debt=cl+long;
 const retained=s.retained+net-dividend,equity=a.capital+a.premium+retained+c.equity;
 return {lines,grossSales,returns,sales,cost,gross,production,variable,opex,ebit,ebt,tax,net,dividend,eps:net/extra.shares,margin:sales?net/sales:0,
  receipts,payments,totalIn,totalOut,beginCash:a.cash,beforeFinancing,borrow,cash,
  ar,inventory,finishedEnd:sum('endValue'),prepaid:a.prepaid,securities:a.securities,raw:a.raw,wip:a.wip,ca,fixed,other,assets,
  payables:payablesEnd,notes,accrued:accruedEnd,taxPay:a.taxPay,currentDebt:reclass,divPay:a.divPay,cl,loan,bonds:a.bonds,long,debt,retained,equity,
  gap:assets-debt-equity,roe:equity?net/equity:0,current:cl?ca/cl:0,leverage:assets?debt/assets:0};
}
