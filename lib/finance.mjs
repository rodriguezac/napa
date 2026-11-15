// Fuente: Parcial N° 3, Industrias Plásticas Altamira v1, pp. 2–8.
export const accounts = [
['intangibles','Activos intangibles','Otros activos','D',350000,410000],
['amortAcc','Amortización acumulada','Otros activos','H',150000,194000],
['rent','Arrendamientos','Gastos de operación','D',144000,156000],
['bonds','Bonos por pagar','Pasivos a largo plazo','H',800000,800000],
['cash','Caja y bancos','Activos circulantes','D',437250,337750],
['capital','Capital común','Patrimonio','H',1000000,1000000],
['premium','Capital pagado en exceso','Patrimonio','H',400000,400000],
['materials','Costo de materiales','Costo de ventas','D',3430000,3910000],
['overhead','Costos indirectos de fabricación','Costo de ventas','D',857000,946000],
['receivables','Cuentas por cobrar comerciales','Activos circulantes','D',1060000,1335000],
['payables','Cuentas por pagar a proveedores','Pasivos circulantes','H',655000,780000],
['depAcc','Depreciación acumulada','Activos fijos','H',2280000,2662000],
['returns','Devoluciones y descuentos sobre ventas','Ingresos','D',175000,229000],
['dividends','Dividendos decretados','Cierre','D',183000,83000],
['divPay','Dividendos por pagar','Pasivos circulantes','H',46000,40000],
['notes','Documentos por pagar','Pasivos circulantes','H',350000,520000],
['buildings','Edificios','Activos fijos','D',1800000,1800000],
['transport','Equipo de transporte','Activos fijos','D',480000,600000],
['allowance','Estimación de cuentas incobrables','Activos circulantes','H',32000,40000],
['freight','Fletes y distribución','Gastos de operación','D',215000,248000],
['amort','Gasto por amortización','Gastos de operación','D',40000,44000],
['dep','Gasto por depreciación','Gastos de operación','D',330000,382000],
['accrued','Gastos acumulados por pagar','Pasivos circulantes','H',198000,214000],
['prepaid','Gastos pagados por anticipado','Activos circulantes','D',65000,72000],
['interest','Gastos por intereses','Financieros','D',165000,214000],
['fees','Honorarios profesionales','Gastos de operación','D',52000,61000],
['taxEntered','ISR del período (referencia)','Impuestos','D',152750,69500],
['taxPay','ISR por pagar','Pasivos circulantes','H',110000,88000],
['finIncome','Ingresos financieros','Financieros','H',18000,12000],
['raw','Inventario de materia prima','Activos circulantes','D',445000,540000],
['wip','Inventario de productos en proceso','Activos circulantes','D',150000,165000],
['finished','Inventario de productos terminados','Activos circulantes','D',560000,735000],
['investments','Inversiones a largo plazo','Otros activos','D',250000,250000],
['labor','Mano de obra directa','Costo de ventas','D',1286000,1415000],
['maintenance','Mantenimiento','Gastos de operación','D',86000,104000],
['machinery','Maquinaria y equipo','Activos fijos','D',2850000,3480000],
['furniture','Mobiliario y equipo de oficina','Activos fijos','D',230000,255000],
['otherExpense','Otros gastos generales','Gastos de operación','D',48000,57000],
['loss','Pérdidas extraordinarias','Financieros','D',25000,38000],
['currentDebt','Porción corriente de deuda a largo plazo','Pasivos circulantes','H',200000,250000],
['loan','Préstamo bancario a largo plazo','Pasivos a largo plazo','H',1250000,1600000],
['advertising','Publicidad y mercadeo','Gastos de operación','D',172000,215000],
['insurance','Seguros','Gastos de operación','D',64000,70000],
['utilities','Servicios públicos','Gastos de operación','D',118000,131000],
['admin','Sueldos administrativos','Gastos de operación','D',520000,566000],
['salesSalary','Sueldos y comisiones de ventas','Gastos de operación','D',430000,488000],
['land','Terrenos','Activos fijos','D',650000,650000],
['retainedOpening','Utilidades retenidas al inicio','Patrimonio','H',1701000,1976250],
['securities','Valores negociables','Activos circulantes','D',120000,60000],
['grossSales','Ventas brutas','Ingresos','H',8750000,9540000]
];
export const initialData = Object.fromEntries([2024,2025].map((y,i)=>[y,Object.fromEntries(accounts.map(a=>[a[0],a[4+i]]))]));
export const defaults={tax:.25,shares:200000,days:360,unitsJug:1160000,priceJug:4.5,unitsBucket:480000,priceBucket:9};
const sum=(o,keys)=>keys.reduce((t,k)=>t+o[k],0);
// Catálogo codificado (estructura del Módulo 0): 1 Activos, 2 Pasivos, 3 Capital, 4 Ingresos, 5 Costos, 6 Gastos.
export const accountCodes={cash:'1.1.01',securities:'1.1.02',receivables:'1.1.03',allowance:'1.1.03.01',raw:'1.1.04.01',wip:'1.1.04.02',finished:'1.1.04.03',prepaid:'1.1.05',land:'1.2.01',buildings:'1.2.02',machinery:'1.2.03',transport:'1.2.04',furniture:'1.2.05',depAcc:'1.2.06',intangibles:'1.3.01',amortAcc:'1.3.02',investments:'1.3.03',payables:'2.1.01',notes:'2.1.02',accrued:'2.1.03',taxPay:'2.1.04',currentDebt:'2.1.05',divPay:'2.1.06',loan:'2.2.01',bonds:'2.2.02',capital:'3.1',premium:'3.2',retainedOpening:'3.4.01',dividends:'3.4.02',grossSales:'4.1.01',returns:'4.1.02',finIncome:'4.3.01',materials:'5.1.01',labor:'5.2.01',overhead:'5.3.01',admin:'6.1.01',rent:'6.1.02',insurance:'6.1.03',maintenance:'6.1.04',fees:'6.1.05',dep:'6.1.06',amort:'6.1.07',otherExpense:'6.1.08',salesSalary:'6.2.01',advertising:'6.2.02',freight:'6.2.03',interest:'6.3.01',utilities:'6.5.01',loss:'6.7.01',taxEntered:'6.8.01'};
// Prefijo del código → grupo. El orden importa: los prefijos más específicos van primero.
export const codeGroups=[
 ['1.1','ca','Activo corriente','Balance general','D'],
 ['1.2','fixed','Activo no corriente · propiedad, planta y equipo','Balance general','D'],
 ['1.3','other','Activo no corriente · otros activos','Balance general','D'],
 ['2.1','cl','Pasivo corriente','Balance general','H'],
 ['2.2','long','Pasivo no corriente','Balance general','H'],
 ['3','equity','Capital contable','Balance general','H'],
 ['4.3','otherIncome','Otros ingresos (después de la UAII)','Estado de resultados','H'],
 ['4','sales','Ingresos de operación','Estado de resultados','H'],
 ['5','cost','Costo de ventas','Estado de resultados','D'],
 ['6.3','nonOperating','Gastos financieros (después de la UAII)','Estado de resultados','D'],
 ['6.7','nonOperating','Otros gastos no operativos (después de la UAII)','Estado de resultados','D'],
 ['6.8','tax','Impuesto sobre la renta (se calcula, no se digita)','Estado de resultados','D'],
 ['6','opex','Gastos de operación','Estado de resultados','D']
];
const codeParts=c=>String(c||'').trim().replace(/\.+$/,'').split('.');
export function validCode(code){return /^[1-6](\.\d{1,2})*$/.test(String(code||'').trim().replace(/\.+$/,''));}
export function classify(code){
 if(!validCode(code))return null;
 const p=codeParts(code);
 for(const g of codeGroups){const q=g[0].split('.');if(q.length<=p.length&&q.every((x,i)=>Number(p[i])===Number(x)))return {prefix:g[0],group:g[1],label:g[2],statement:g[3],normal:g[4],kind:Number(p[0])<=3?'Real':'Nominal'};}
 return null;
}
export const natureRules=[['Activos','Débito','Crédito','Deudora'],['Pasivos','Crédito','Débito','Acreedora'],['Capital','Crédito','Débito','Acreedora'],['Ingresos','Crédito','Débito','Acreedora'],['Costos','Débito','Crédito','Deudora'],['Gastos','Débito','Crédito','Deudora']];
export function compareCodes(x,y){const a=codeParts(x),b=codeParts(y);for(let i=0;i<Math.max(a.length,b.length);i++){const d=(Number(a[i])||0)-(Number(b[i])||0);if(d)return d;}return 0;}
export function customAccounts(extra){return Array.isArray(extra?.custom)?extra.custom.filter(c=>c&&typeof c.id==='string'&&classify(c.code)&&classify(c.code).group!=='tax'):[];}
// Saldo con signo: positivo si la naturaleza coincide con la del grupo; negativo si es cuenta de valuación (p. ej. una depreciación acumulada).
export function customValue(c,a){const v=Number(a?.[c.id])||0,g=classify(c.code);return c.nature&&c.nature!==g.normal?-v:v;}
export function customTotals(a,extra){const t={ca:0,fixed:0,other:0,cl:0,long:0,equity:0,sales:0,cost:0,opex:0,otherIncome:0,nonOperating:0};for(const c of customAccounts(extra))t[classify(c.code).group]+=customValue(c,a);return t;}
export function statements(a,extra=defaults){
 const c=customTotals(a,extra);
 const sales=a.grossSales-a.returns+c.sales,cost=sum(a,['materials','labor','overhead'])+c.cost;
 const opex=sum(a,['admin','salesSalary','advertising','rent','utilities','insurance','maintenance','fees','freight','otherExpense','dep','amort'])+c.opex;
 const gross=sales-cost,ebit=gross-opex,ebt=ebit+a.finIncome-a.interest-a.loss+c.otherIncome-c.nonOperating,tax=Math.max(0,ebt*extra.tax),net=ebt-tax;
 const ar=a.receivables-a.allowance,inventory=sum(a,['raw','wip','finished']),ca=a.cash+a.securities+ar+inventory+a.prepaid+c.ca;
 const fixedGross=sum(a,['land','buildings','machinery','transport','furniture']),fixed=fixedGross-a.depAcc+c.fixed,other=a.intangibles-a.amortAcc+a.investments+c.other,assets=ca+fixed+other;
 const cl=sum(a,['payables','notes','accrued','taxPay','currentDebt','divPay'])+c.cl,long=a.loan+a.bonds+c.long,debt=cl+long,retained=a.retainedOpening+net-a.dividends,equity=a.capital+a.premium+retained+c.equity;
 return {sales,cost,gross,opex,ebit,ebt,tax,net,eps:net/extra.shares,ar,inventory,ca,fixedGross,fixed,other,assets,cl,long,debt,retained,equity,gap:assets-debt-equity,custom:c};
}
const old23={cash:310000,securities:150000,receivables:980000,allowance:29000,raw:410000,wip:140000,finished:520000,prepaid:60000,land:650000,buildings:1800000,machinery:2600000,transport:420000,furniture:210000,depAcc:1950000,intangibles:320000,amortAcc:110000,investments:250000,payables:610000,accrued:185000,taxPay:95000,notes:300000,currentDebt:200000,loan:1400000,bonds:800000,divPay:40000,capital:1000000,premium:400000};
export function cashflow(a,b,extra=defaults){
 const s=statements(a,extra),delta=k=>a[k]-b[k];
 const operation=[['Utilidad neta',s.net],['Depreciación',a.dep],['Amortización',a.amort],['Cambio en cuentas por cobrar netas',-(delta('receivables')-delta('allowance'))],['Cambio en inventarios',-sum(a,['raw','wip','finished'])+sum(b,['raw','wip','finished'])],['Cambio en anticipos',-delta('prepaid')],['Cambio en proveedores',delta('payables')],['Cambio en gastos acumulados',delta('accrued')],['Cambio en ISR por pagar',delta('taxPay')]];
 const capex=sum(a,['land','buildings','machinery','transport','furniture'])-sum(b,['land','buildings','machinery','transport','furniture']);
 const investment=[['Compras de activos fijos',-capex],['Compras de intangibles',-delta('intangibles')],['Cambio en valores negociables',-delta('securities')],['Cambio en inversiones a largo plazo',-delta('investments')]];
 const divPaid=a.dividends+b.divPay-a.divPay;
 const financing=[['Cambio en documentos por pagar',delta('notes')],['Cambio en deuda bancaria total',delta('loan')+delta('currentDebt')],['Cambio en bonos',delta('bonds')],['Aportes de capital',delta('capital')+delta('premium')],['Dividendos pagados',-divPaid]];
 for(const c of customAccounts(extra)){const g=classify(c.code).group,d=customValue(c,a)-(b&&c.id in b?customValue(c,b):customValue(c,a)),name='Cambio en '+c.name.toLowerCase();
  if(g==='ca')operation.push([name,-d]);else if(g==='cl')operation.push([name,d]);else if(g==='fixed'||g==='other')investment.push([name,-d]);else if(g==='long'||g==='equity')financing.push([name,d]);}
 const total=rows=>rows.reduce((v,r)=>v+r[1],0),cfo=total(operation),cfi=total(investment),cff=total(financing),change=cfo+cfi+cff;
 return {operation,investment,financing,cfo,cfi,cff,change,start:b.cash,end:b.cash+change,gap:b.cash+change-a.cash,fcf:cfo-capex-divPaid,divPaid,capex};
}
export const base23=old23;
export const ratioDefinitions=[
 ['Margen de utilidad','Rentabilidad',.045,'%',false,'Utilidad neta / ventas netas'],['Rendimiento de activos · ROA','Rentabilidad',.055,'%',false,'Utilidad neta / activos totales'],['Rendimiento del capital · ROE','Rentabilidad',.115,'%',false,'Utilidad neta / capital contable'],
 ['Rotación de cuentas por cobrar','Utilización de activos',8,'x',false,'Ventas netas / cuentas por cobrar netas'],['Período promedio de cobranza','Utilización de activos',45,'d',true,'Cuentas por cobrar netas × 360 / ventas netas'],['Rotación del inventario','Utilización de activos',7,'x',false,'Ventas netas / inventarios'],['Rotación de activos fijos','Utilización de activos',2.4,'x',false,'Ventas netas / activos fijos netos'],['Rotación de activos totales','Utilización de activos',1.25,'x',false,'Ventas netas / activos totales'],
 ['Razón circulante','Liquidez',1.9,'x',false,'Activos circulantes / pasivos circulantes'],['Razón rápida','Liquidez',1.1,'x',false,'(Activos circulantes − inventarios) / pasivos circulantes'],['Deudas a activos totales','Utilización de deudas',.5,'%',true,'Pasivos totales / activos totales'],['Rotación del interés ganado','Utilización de deudas',4.5,'x',false,'UAII / intereses'],['Cobertura de cargos fijos','Utilización de deudas',3,'x',false,'(UAII + arrendamientos) / (intereses + arrendamientos)']
];
export function ratios(a,extra=defaults){const s=statements(a,extra);return [s.net/s.sales,s.net/s.assets,s.net/s.equity,s.sales/s.ar,s.ar*extra.days/s.sales,s.sales/s.inventory,s.sales/s.fixed,s.sales/s.assets,s.ca/s.cl,(s.ca-s.inventory)/s.cl,s.debt/s.assets,s.ebit/a.interest,(s.ebit+a.rent)/(a.interest+a.rent)];}
export function status(value,i){const d=ratioDefinitions[i],q=d[4]?d[2]/value:value/d[2];return !Number.isFinite(q)?'na':q>=1?'good':q>=.9?'warn':'bad';}
export const scenarios={Pesimista:{growth:.06,cost:.70,variable:.22,days:60,turns:5.5,payout:.5,fixedShare:1},Base:{growth:.12,cost:.674,variable:.208,days:50,turns:6.5,payout:.4,fixedShare:.5},Optimista:{growth:.18,cost:.65,variable:.195,days:45,turns:7,payout:.3,fixedShare:0}};
export function project(a,p,extra=defaults,method='sensitivity'){
 const b=statements(a,extra),sales=b.sales*(1+p.growth),cost=sales*p.cost,variable=sales*p.variable,opex=variable+a.dep+a.amort+a.rent,ebit=sales-cost-opex,ebt=ebit+a.finIncome-a.interest+b.custom.otherIncome-b.custom.nonOperating,tax=Math.max(0,ebt*extra.tax),net=ebt-tax;
 const ar=method==='percent'?b.ar*(1+p.growth):sales*p.days/extra.days,inventory=method==='percent'?b.inventory*(1+p.growth):sales/p.turns;
 const dividend=Math.max(0,net)*p.payout,retention=net-dividend;
 const cash=a.cash*(1+p.growth),prepaid=a.prepaid*(1+p.growth),fixed=b.fixed*(1+p.growth*p.fixedShare),payables=a.payables*(1+p.growth),accrued=a.accrued*(1+p.growth);
 const ca=cash+a.securities+ar+inventory+prepaid+b.custom.ca,assets=ca+fixed+b.other,retained=b.retained+retention,equity=a.capital+a.premium+retained+b.custom.equity;
 // Equation 4-1: effective A/S accounts for non-proportional receivables and inventory in sensitivity.
 const deltaS=sales-b.sales,assetNeed=(cash-a.cash)+(ar-b.ar)+(inventory-b.inventory)+(prepaid-a.prepaid)+(fixed-b.fixed),spontaneous=(payables-a.payables)+(accrued-a.accrued),rnf=assetNeed-spontaneous-retention;
 const notes=a.notes+rnf,cl=payables+notes+accrued+a.taxPay+a.currentDebt+a.divPay+b.custom.cl,debt=cl+b.long,gap=assets-debt-equity;
 return {sales,cost,variable,opex,ebit,ebt,tax,net,margin:net/sales,rnf,notes,cash,ar,inventory,prepaid,fixed,ca,other:b.other,assets,payables,accrued,cl,long:b.long,retained,equity,debt,roe:net/equity,current:ca/cl,leverage:debt/assets,gap,assetNeed,spontaneous,retention,dividend,effectiveA:deltaS?assetNeed/deltaS:null,eps:net/extra.shares};
}
export function historicalAssumptions(a,extra=defaults){const s=statements(a,extra);return {growth:.12,cost:s.cost/s.sales,variable:(s.opex-a.dep-a.amort-a.rent)/s.sales,days:s.ar*extra.days/s.sales,turns:s.sales/s.inventory,payout:.4,fixedShare:1};}
export function tornado(a,extra=defaults){const b=scenarios.Base,base=project(a,b,extra);return Object.keys(b).map(key=>{const low=project(a,{...b,[key]:scenarios.Pesimista[key]},extra),high=project(a,{...b,[key]:scenarios.Optimista[key]},extra);return {key,netLow:low.net-base.net,netHigh:high.net-base.net,rnfLow:low.rnf-base.rnf,rnfHigh:high.rnf-base.rnf,netImpact:Math.abs(high.net-low.net),rnfImpact:Math.abs(high.rnf-low.rnf)};});}
export const incomeRows=[['Ventas brutas','grossSales','a'],['Devoluciones y descuentos','returns','neg'],['Ventas netas','sales','s'],['Costo de materiales','materials','a'],['Mano de obra directa','labor','a'],['Costos indirectos de fabricación','overhead','a'],['Costo de ventas','cost','s'],['Utilidad bruta','gross','s'],...accounts.filter(a=>a[2]==='Gastos de operación').map(a=>[a[1],a[0],'a']),['Gastos de operación','opex','s'],['Utilidad de operación · UAII','ebit','s'],['Ingresos financieros','finIncome','a'],['Gastos por intereses','interest','neg'],['Pérdidas extraordinarias','loss','neg'],['Utilidad antes de impuestos','ebt','s'],['Impuesto sobre la renta','tax','s'],['Utilidad neta','net','s'],['Utilidad por acción','eps','s']];
export const balanceRows=[...accounts.filter(a=>a[2]==='Activos circulantes').map(a=>[a[1],a[0],a[0]==='allowance'?'neg':'a']),['Activos circulantes','ca','s'],...accounts.filter(a=>a[2]==='Activos fijos').map(a=>[a[1],a[0],a[0]==='depAcc'?'neg':'a']),['Activos fijos netos','fixed','s'],...accounts.filter(a=>a[2]==='Otros activos').map(a=>[a[1],a[0],a[0]==='amortAcc'?'neg':'a']),['Otros activos','other','s'],['Activos totales','assets','s'],...accounts.filter(a=>a[2]==='Pasivos circulantes').map(a=>[a[1],a[0],'a']),['Pasivos circulantes','cl','s'],['Préstamo a largo plazo','loan','a'],['Bonos por pagar','bonds','a'],['Pasivos a largo plazo','long','s'],['Pasivos totales','debt','s'],['Capital común','capital','a'],['Capital pagado en exceso','premium','a'],['Utilidades retenidas al cierre','retained','s'],['Capital contable','equity','s']];
export function rowValue(row,a,s){return row[2]==='s'?s[row[1]]:a[row[1]]*(row[2]==='neg'?-1:1);}
