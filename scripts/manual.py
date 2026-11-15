"""Genera el manual público: portada y tres páginas de uso. Requiere reportlab."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/docs/manual-napa.pdf'
GREEN = HexColor('#487719')
pdfmetrics.registerFont(TTFont('DaysOne', str(ROOT / 'scripts/assets/DaysOne.ttf')))
styles = {
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=27, leading=32, textColor=GREEN, spaceAfter=12),
    'sub': ParagraphStyle('sub', fontName='Helvetica', fontSize=10, leading=15, textColor=HexColor('#52604b'), spaceAfter=16),
    'h': ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=GREEN, spaceBefore=12, spaceAfter=7),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15, textColor=HexColor('#30372e'), spaceAfter=9),
    'small': ParagraphStyle('small', fontName='Helvetica', fontSize=8.5, leading=12, textColor=HexColor('#52604b'), spaceAfter=8),
}
story = [Spacer(1, 1), PageBreak()]
def p(text, style='body'):
    story.append(Paragraph(text, styles[style]))
def h(text):
    p(text, 'h')
def star(c, x, y, radius, color, width=1.5):
    from math import sin, cos, pi
    c.setStrokeColor(color)
    c.setLineWidth(width)
    for i in range(4):
        a = i*pi/4
        dx, dy = radius*cos(a), radius*sin(a)
        c.line(x-dx, y-dy, x+dx, y+dy)

def cover(c):
    w, ht = A4
    ink, lime = HexColor('#25292d'), HexColor('#6fab23')
    c.setFillColor(HexColor('#f7f9f3'))
    c.rect(0, 0, w, ht, fill=1, stroke=0)
    star(c, w-24, ht-44, 155, HexColor('#e6efd9'), 1.3)
    c.setFillColor(ink)
    c.setFont('DaysOne', 72)
    c.drawString(48, ht-150, 'ñapa')
    logo_width = pdfmetrics.stringWidth('ñapa', 'DaysOne', 72)
    star(c, 48+logo_width+32, ht-124, 20, lime, 1.7)
    c.setFont('Helvetica', 12)
    c.setFillColor(GREEN)
    c.drawString(50, ht-184, 'Un extra de claridad para tus decisiones.')
    c.setFillColor(lime)
    c.roundRect(48, 498, 44, 5, 2.5, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(48, 470, 'GUÍA DEL APLICATIVO')
    c.setFillColor(ink)
    c.setFont('Helvetica-Bold', 40)
    c.drawString(46, 415, 'Manual de uso')
    c.setFont('Helvetica', 15)
    c.drawString(48, 381, 'Industrias Plásticas Altamira, S.A.')
    c.setFont('Helvetica', 11)
    c.setFillColor(HexColor('#596252'))
    c.drawString(48, 355, 'Análisis 2024-2025 y proyección 2026')
    c.setFillColor(HexColor('#e9f1dd'))
    c.roundRect(48, 263, w-96, 54, 14, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(65, 286, 'CUENTAS  /  ESTADOS  /  ANÁLISIS  /  PROYECCIONES')
    c.setFillColor(ink)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(48, 218, 'PREPARADO POR')
    c.setFont('Helvetica', 11)
    for y, name in [(195, 'Angélica Rodríguez'), (177, 'Eliel García'), (159, 'Anllelina Varcasia')]:
        c.drawString(48, y, name)
    c.setStrokeColor(HexColor('#d7e3c9'))
    c.setLineWidth(.6)
    c.line(48, 123, w-48, 123)
    c.setFillColor(HexColor('#596252'))
    c.setFont('Helvetica', 9)
    c.drawString(48, 101, 'Universidad Tecnológica de Panamá · Administración Financiera')
    c.drawString(48, 84, 'Caso académico · Noviembre 2026')
    c.setFillColor(GREEN)
    c.setFont('Helvetica', 9)
    c.drawString(48, 48, 'rodriguezac.github.io/napa/')
    c.linkURL('https://rodriguezac.github.io/napa/', (48, 44, 225, 60), relative=0)

def page(c, doc):
    if doc.page == 1:
        cover(c)
        return
    w, ht = A4
    c.setFillColor(GREEN)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(44, ht-32, 'ñapa / Finanzas claras')
    c.setStrokeColor(HexColor('#dce8d0'))
    c.line(44, 44, w-44, 44)
    c.setFont('Helvetica', 8)
    c.setFillColor(HexColor('#52604b'))
    c.drawString(44, 29, 'UTP · Administración Financiera · Caso Altamira · 15 noviembre 2026')
    c.drawRightString(w-44, 29, f'{doc.page} / 4')

p('Manual de uso', 'title')
p('Industrias Plásticas Altamira, S.A. · Análisis 2024-2025 y proyección 2026<br/>Equipo: Angélica Rodríguez, Eliel García y Anllelina Varcasia', 'sub')
h('1. Abrir y orientarse')
p('Abre <link href="https://rodriguezac.github.io/napa/" color="#487719">https://rodriguezac.github.io/napa/</link>. No necesitas iniciar sesión. El menú lateral reúne las cuentas, estados, análisis y la sección <b>PROYECCIÓN 2026</b>. En el teléfono, toca <b>Abrir menú</b>. <b>Panorama financiero</b> resume ventas, utilidad, caja e indicadores; <b>Ayuda</b> da acceso a documentos, criterios y fórmulas.')
h('2. Clasificación de cuentas: revisar antes de capturar')
p('En <b>Clasificación de cuentas</b> consulta código, nombre, tipo real o nominal, naturaleza deudora o acreedora, estado de destino, grupo y saldo de 2025. Filtra por grupo; las tarjetas superiores cuentan las cuentas de cada categoría. Una estrella identifica las cuentas agregadas.')
p('<b>Guía de códigos:</b> 1.1 activo corriente; 1.2 propiedad, planta y equipo; 1.3 otros activos; 2.1 pasivo corriente; 2.2 pasivo no corriente; 3 capital; 4 ingresos; 5 costos; 6 gastos. Las cuentas reales (1, 2 y 3) van al balance; las nominales (4, 5 y 6), al estado de resultados. La tabla inferior explica qué aumenta con Debe o Haber.')
h('3. Capturar saldos y agregar una cuenta')
p('En <b>Datos de entrada</b>, elige 2024 o 2025 y busca la cuenta o filtra su categoría. Las 50 cuentas originales de 2025 ya están cargadas. Escribe importes positivos: <b>D</b> indica saldo deudor y <b>H</b>, acreedor. Los datos complementarios permiten ajustar ISR, acciones, año comercial, unidades vendidas y precios.')
p('<b>Para crear una cuenta:</b> en <b>Agregar una cuenta</b>, toca un grupo de la guía para usar el siguiente código libre, o escribe un código válido. Ingresa un nombre y los saldos de 2024 y 2025. Revisa la clasificación y naturaleza automáticas. Marca <b>Valuación (resta)</b> solo si la cuenta reduce su grupo, como una depreciación acumulada. Pulsa <b>Agregar cuenta</b>. Un código duplicado o inválido impide agregarla; el ISR se calcula y no se crea como cuenta adicional.')
p('La cuenta nueva participa en los cálculos y en los reportes de Resultados, Balance y Balanza. Puedes editarla en la tabla y eliminarla con el icono de papelera. Si surge <b>El balance necesita revisión</b>, revisa ambos años: activos menos pasivos menos capital debe dar cero. No se crea una cuenta de ajuste automática. Descarga un respaldo antes de eliminar o restaurar datos.', 'small')

story.append(PageBreak())
p('Leer y proyectar', 'title')
p('Estados financieros, diagnóstico y los dos métodos de proyección', 'sub')
h('4. Leer los estados y el diagnóstico')
p('<b>Estado de resultados:</b> ventas, costos, gastos, UAII, ISR, utilidad neta y utilidad por acción. <b>Balance general:</b> activos, pasivos y capital; incluye el estado de utilidades retenidas: saldo inicial + utilidad neta - dividendos = saldo final. Ambos muestran partidas y totales de 2025 y 2024; las restas aparecen entre paréntesis y los totales finales con doble línea.')
p('<b>Flujo de efectivo:</b> método indirecto, con operación, inversión y financiamiento; comprueba la conciliación con Caja y bancos y el flujo libre. El ISR se calcula con la tasa; el importe capturado sirve como referencia. Ante pérdidas, no se reconoce crédito fiscal.')
p('<b>Razones financieras:</b> compara 13 indicadores con 2024 y la industria, agrupados en rentabilidad, utilización de activos, liquidez y utilización de deudas. Verde alcanza la referencia; ámbar indica hasta 10% desfavorable y rojo un desvío mayor. Para días de cobro y deuda, un menor valor es favorable. Consulta también Du Pont.')
p('<b>Análisis comparativo:</b> alterna Resultados, Balance y Cuentas. El análisis horizontal muestra cambios en dólares y porcentaje; el vertical muestra el peso sobre ventas o activos. Si el año base es cero, aparece “Sin base”. Verifica las cuentas nuevas en sus estados: el Excel del comparativo de cuentas conserva el catálogo original.')
h('5. Porcentaje de ventas: Pro-forma I')
p('En <b>PROYECCIÓN 2026 → Porcentaje de ventas</b>, modifica crecimiento, costo de ventas, gastos variables y dividendos. Alterna <b>Plena capacidad</b>, donde el activo fijo crece con las ventas, y <b>Capacidad ociosa</b>, donde permanece constante. Revisa resultados, balance y fondos nuevos requeridos (RNF). Restaurar recupera los porcentajes históricos exactos de 2025.')
h('6. Presupuestos: Pro-forma II')
p('Abre <b>PROYECCIÓN 2026 → Presupuestos</b>. Este método parte de las unidades de garrafones y cubetas, calcula la producción y usa PEPS: primero se vende el inventario inicial. Recorre sus siete pasos en orden:')
p('<b>1.</b> Pronóstico de ventas por producto.<br/><b>2.</b> Producción = ventas + inventario final deseado - inventario inicial.<br/><b>3.</b> Costo de producción: materiales, mano de obra y costos indirectos.<br/><b>4.</b> Costo de ventas PEPS e inventario final.<br/><b>5.</b> Resultados proyectados y comparación con porcentaje de ventas.<br/><b>6.</b> Presupuesto de efectivo: cobros, pagos y financiamiento.<br/><b>7.</b> Balance general proyectado y comprobación de su diferencia.')

story.append(PageBreak())
p('Experimentar y guardar', 'title')
p('Supuestos, exportaciones y comprobación antes de presentar', 'sub')
h('7. Editar los presupuestos y comprobar el efecto')
p('La Pro-forma II ofrece <b>18 supuestos editables</b>: crecimiento de unidades; dos precios; tasa de devoluciones; inventario final deseado; aumento de materiales; seis costos unitarios (materiales, mano de obra y costos indirectos para cada producto); gastos variables; días de cobro; dividendos; compras de activos fijos; pago de deuda a largo plazo y caja mínima. Los valores base combinan datos de 2025 con crecimiento de 12% y dividendos de 40%.')
p('Los porcentajes se escriben como porcentaje visible (por ejemplo, <b>10</b> para 10%). Los resultados cambian al editar. Si la caja antes del financiamiento es menor que el mínimo, el faltante se incorpora a documentos por pagar. Revisa utilidad, préstamo requerido, caja final y diferencia del balance. <b>Restaurar</b> en esta pantalla recupera los supuestos base de presupuestos.')
p('<b>Prueba guiada con el caso original:</b> la utilidad base es <b>$336,000</b>, el préstamo requerido <b>$117,750</b> y la diferencia del balance <b>$0</b>. Cambia “Aumento del costo de materiales 2026” a 10%: la utilidad baja aproximadamente a <b>$41,931</b> y el préstamo sube a <b>$257,061</b>. Después restaura. Estas cifras dependen de conservar las cuentas y los demás supuestos originales.')
h('8. Simulador de escenarios y fórmulas')
p('En <b>Simulador de escenarios</b>, elige Pesimista, Base u Optimista. Edita crecimiento, costo, gastos variables, días de cobro, rotación de inventario, dividendos y proporción de activos fijos que crece. La selección pasa a Personalizado. Compara utilidad, RNF, caja e indicadores; los gráficos de tornado muestran qué supuesto afecta más la utilidad y el RNF. La comparación conserva los tres escenarios originales; el análisis de una variable mantiene las demás en Base.')
p('En <b>Ayuda → Fórmulas</b>, busca por nombre o filtra por módulo para consultar las ecuaciones documentadas y ejemplos con los datos actuales. <b>Criterios de cálculo</b> explica las convenciones. Los siete pasos de Presupuestos muestran las operaciones específicas del método nuevo.')
h('9. Guardar, compartir y exportar')
p('<b>Guardado:</b> cuentas y complementarios quedan en este navegador; no se sincronizan entre integrantes. Usa <b>Respaldar</b> en Datos de entrada y <b>Importar JSON</b> para trasladarlos. Los supuestos de proyección y escenarios son de sesión: anótalos antes de recargar. <b>Restaurar caso original</b> repone cuentas y complementarios tras confirmar; conserva antes un respaldo.')
p('<b>Excel / CSV:</b> cada módulo descarga su reporte con los valores vigentes. Excel conserva formato y gráficas; CSV contiene datos. Las exportaciones de proyección incluyen la Pro-forma II y su presupuesto de efectivo. Para cambiar supuestos, hazlo en ñapa y vuelve a exportar. En <b>Ayuda → Documentos</b> descarga el libro integral, este manual y el informe. Los PDF son estáticos: no cambian con tus ediciones.')
p('<b>Control del caso original:</b> en 2025, utilidad $208,500, activos $7,793,750, retenidas $2,101,750 y caja $337,750. En 2024, utilidad $458,250 y activos $6,985,250. Comprueba diferencias de balance y conciliación de caja en cero antes de exponer.', 'small')

SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=44, rightMargin=44,
                  topMargin=60, bottomMargin=56, title='ñapa - Manual de uso',
                  author='Equipo ñapa').build(story, onFirstPage=page, onLaterPages=page)
print(OUT)
