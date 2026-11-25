import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accounts,initialData,defaults,statements,cashflow,base23,ratios,project,historicalAssumptions,scenarios,tornado} from '../lib/finance.mjs';
const a=initialData[2025],b=initialData[2024];
function near(a,b){assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`)}
test('reproduce todos los subtotales publicados de 2024',()=>{const s=statements(b);const expected={sales:8575000,cost:5573000,gross:3002000,opex:2219000,ebit:783000,ebt:611000,tax:152750,net:458250,ca:2805250,fixed:3730000,assets:6985250,cl:1559000,debt:3609000,retained:1976250,equity:3376250,gap:0};for(const [k,v] of Object.entries(expected))near(s[k],v);const c=cashflow(b,base23);for(const [k,v] of Object.entries({cfo:734250,cfi:-330000,cff:-277000,change:127250,end:437250,fcf:227250,gap:0}))near(c[k],v)});
test('balanza 2025: 50 cuentas, debe y haber coinciden',()=>{assert.equal(accounts.length,50);for(const side of ['D','H'])near(accounts.filter(a=>a[3]===side).reduce((sum,row)=>sum+a[row[0]],0),20116250)});
test('cierre de 2025 y flujo sin ajustes ocultos',()=>{const s=statements(a),c=cashflow(a,b);for(const [k,v] of Object.entries({sales:9311000,net:208500,retained:2101750,assets:7793750,gap:0}))near(s[k],v);for(const [k,v] of Object.entries({cfo:194500,cfi:-775000,cff:481000,change:-99500,end:337750,fcf:-669500,gap:0}))near(c[k],v)});
test('Du Pont concilia con razones directas para ambos años',()=>{for(const a of [b,initialData[2025]]){const r=ratios(a);near(r[0]*r[7],r[1]);near(r[1]/(1-r[10]),r[2]);near(r[4],360/r[3]);near(r[5],statements(a).sales/statements(a).inventory)}});
test('proyección histórica coincide con ecuación 4-1 en ambas capacidades',()=>{for(const fixedShare of [0,1]){const params={...historicalAssumptions(a),fixedShare};const p=project(a,params,defaults,'percent');const s=statements(a);near(p.net,336000);near(p.rnf,fixedShare?551250:56490);const A=a.cash+s.ar+s.inventory+a.prepaid+s.fixed*fixedShare,L=a.payables+a.accrued;near(p.rnf,(A/s.sales-L/s.sales)*(p.sales-s.sales)-p.margin*p.sales*(1-params.payout));near(p.notes-a.notes,p.rnf);near(p.gap,0)}});
test('todos los escenarios y 7 sensibilidades conservan la identidad contable',()=>{for(const params of Object.values(scenarios)){const p=project(a,params);near(p.gap,0);near(p.rnf,p.assetNeed-p.spontaneous-p.retention)}const tr=tornado(a);assert.equal(tr.length,7);assert.equal([...tr].sort((a,b)=>b.netImpact-a.netImpact)[0].key,'cost');for(const key of Object.keys(scenarios.Base)){for(const value of [scenarios.Pesimista[key],scenarios.Optimista[key]]){const p=project(a,{...scenarios.Base,[key]:value});near(p.gap,0)}}});
test('cambios en datos propagan alertas de balance y efectivo',()=>{const changed={...a,cash:a.cash+100};near(statements(changed).gap,100);near(cashflow(changed,b).gap,-100);const changedSales={...a,grossSales:a.grossSales+10000};near(statements(changedSales).net-statements(a).net,7500);assert.notEqual(project(changedSales,scenarios.Base).net,project(a,scenarios.Base).net)});
test('crecimiento cero y pérdidas no producen divisiones por cero ni dividendos negativos',()=>{const zero=project(a,{...scenarios.Base,growth:0});assert.ok(Number.isFinite(zero.rnf));near(zero.gap,0);const loss=project(a,{...scenarios.Base,cost:1});assert.ok(loss.net<0);near(loss.dividend,0);near(loss.retention,loss.net);near(loss.gap,0)});

test('cuentas agregadas: el código decide el grupo y los estados siguen cuadrando', async () => {
  const f = await import('../lib/finance.mjs');
  assert.equal(f.classify('1.1.06').group, 'ca');
  assert.equal(f.classify('1.2.07').group, 'fixed');
  assert.equal(f.classify('2.1.07').group, 'cl');
  assert.equal(f.classify('2.2.03').group, 'long');
  assert.equal(f.classify('3.3').group, 'equity');
  assert.equal(f.classify('4.1.03').group, 'sales');
  assert.equal(f.classify('4.3.02').group, 'otherIncome');
  assert.equal(f.classify('5.1.02').group, 'cost');
  assert.equal(f.classify('6.1.09').group, 'opex');
  assert.equal(f.classify('6.3.02').group, 'nonOperating');
  assert.equal(f.classify('7.1'), null);
  assert.equal(f.accounts.every(a => f.classify(f.accountCodes[a[0]])), true);
  const extra = {...f.defaults, custom: [
    {id: 'c1', code: '1.1.06', name: 'Anticipos a empleados', nature: 'D'},
    {id: 'c2', code: '2.2.03', name: 'Provisiones laborales', nature: 'H'},
    {id: 'c3', code: '1.2.07', name: 'Depreciación acumulada de equipo nuevo', nature: 'H'},
    {id: 'c4', code: '1.2.08', name: 'Equipo nuevo', nature: 'D'},
  ]};
  const data = {2024: {...f.initialData[2024], c1: 0, c2: 0, c3: 0, c4: 0}, 2025: {...f.initialData[2025], c1: 5000, c2: 5000, c3: 1000, c4: 1000}};
  const base = f.statements(f.initialData[2025]), s = f.statements(data[2025], extra);
  assert.equal(s.ca - base.ca, 5000);
  assert.equal(s.long - base.long, 5000);
  assert.equal(s.fixed, base.fixed);            // la cuenta de valuación resta
  assert.ok(Math.abs(s.gap) < 0.01);
  assert.ok(Math.abs(f.cashflow(data[2025], data[2024], extra).gap) < 0.01);
  assert.ok(Math.abs(f.cashflow(data[2024], f.base23, extra).gap) < 0.01);
  assert.ok(Math.abs(f.project(data[2025], f.historicalAssumptions(data[2025], extra), extra, 'percent').gap) < 0.01);
  assert.equal(s.net, base.net);
});

test('pro-forma II (presupuestos): PEPS, efectivo y balance cuadran', async () => {
  const f = await import('../lib/finance.mjs'), g = await import('../lib/budget.mjs');
  const a = f.initialData[2025], e = f.defaults, d = g.budgetDefaults(a, e), r = g.budget(a, d, e);
  // Las ventas por producto de 2025 reproducen las ventas brutas contables.
  assert.equal(e.unitsJug * e.priceJug + e.unitsBucket * e.priceBucket, a.grossSales);
  near(r.grossSales, a.grossSales * 1.12);
  near(r.sales, f.statements(a).sales * 1.12);
  // Sin aumento de costos, el costo de ventas PEPS coincide con el % de ventas de 2025 (misma utilidad que Pro-forma I).
  near(r.net, f.project(a, {...f.historicalAssumptions(a, e), fixedShare: 0}, e, 'percent').net);
  // Programa de producción: ventas + inventario final − inventario inicial.
  for (const l of r.lines) near(l.prodUnits, l.units + l.endUnits - l.begUnits);
  near(r.lines.reduce((t, l) => t + l.begValue, 0), a.finished);
  // Presupuesto de efectivo: nunca por debajo del mínimo; el préstamo cubre el faltante.
  assert.ok(r.cash >= d.minCash - 0.01);
  near(r.cash, r.beforeFinancing + r.borrow);
  assert.ok(Math.abs(r.gap) < 0.01);
  for (const t of [{materialInflation: .1}, {growth: 0}, {growth: .3, minCash: 500000}, {endInventoryPct: 0}, {capex: 900000}])
    assert.ok(Math.abs(g.budget(a, {...d, ...t}, e).gap) < 0.01, JSON.stringify(t));
  // Un aumento en el costo de la resina baja la utilidad.
  assert.ok(g.budget(a, {...d, materialInflation: .1}, e).net < r.net);
});

test('módulo 7: indicadores complementarios del caso v3.1', async () => {
 const {complementary, ratioImpact, initialData, defaults} = await import('../lib/finance.mjs');
 const c = complementary(initialData, defaults), close = (x, y) => assert.ok(Math.abs(x - y) < 0.01, `${x} != ${y}`);
 close(c.shield[2025].saving, 106500); close(c.shield[2025].netWithout, 528000); close(c.shield[2025].cfoWithout, 88000);
 close(c.afterTax[0].after, 160500); close(c.afterTax[1].after, 117000);
 close(c.perShare[2025].book, 17.50875); close(c.products.gap, 0); close(c.products.total, 9540000);
 close(c.netVsCash[2025].difference, -14000); assert.deepEqual(c.netVsCash[2025].top.map(r => r.value), [-285000, -267000, 125000]);
 close(c.dupont.effects.reduce((v, e) => v + e.value, 0), c.dupont.change);
 close(c.credit[2025].tiedUp, 131125);
 const moved = ratioImpact(initialData, defaults, 'interest', 300000).filter(r => r.moved).map(r => r.name);
 assert.ok(moved.includes('Rotación del interés ganado') && !moved.includes('Razón circulante'));
});
