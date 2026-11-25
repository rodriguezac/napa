"""Genera el manual de uso y el informe ejecutivo con la hoja de presentación de la UTP.

Formato: Arial, color negro; títulos 14 pt subrayados, subtítulos 12 pt subrayados, contenido 12 pt.

Uso:
    python scripts/documentos.py                    # versión pública (public/docs), sin cédulas
    python scripts/documentos.py --cedulas SALIDA   # versión de entrega con cédulas en la carpeta SALIDA

Requiere reportlab y la fuente Arial (C:/Windows/Fonts o la carpeta indicada en ARIAL_DIR).
"""
import os
import sys
from pathlib import Path

from reportlab.lib.colors import black, HexColor
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts/assets'

# ---------------------------------------------------------------- fuente Arial
FONT_DIR = Path(os.environ.get('ARIAL_DIR', 'C:/Windows/Fonts'))
pdfmetrics.registerFont(TTFont('Arial', str(FONT_DIR / 'arial.ttf')))
pdfmetrics.registerFont(TTFont('Arial-Bold', str(FONT_DIR / 'arialbd.ttf')))
pdfmetrics.registerFont(TTFont('Arial-Italic', str(FONT_DIR / 'ariali.ttf')))
pdfmetrics.registerFont(TTFont('Arial-BoldItalic', str(FONT_DIR / 'arialbi.ttf')))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic',
                              boldItalic='Arial-BoldItalic')

LEAD = 15  # interlineado para 12 pt
ST = {
    'titulo': ParagraphStyle('titulo', fontName='Arial-Bold', fontSize=14, leading=18, textColor=black,
                             alignment=TA_CENTER, spaceAfter=10),
    'sub': ParagraphStyle('sub', fontName='Arial-Bold', fontSize=12, leading=LEAD, textColor=black,
                          spaceBefore=8, spaceAfter=5, keepWithNext=1),
    'body': ParagraphStyle('body', fontName='Arial', fontSize=12, leading=LEAD, textColor=black,
                           alignment=TA_JUSTIFY, spaceAfter=6),
    'item': ParagraphStyle('item', fontName='Arial', fontSize=12, leading=LEAD, textColor=black,
                           alignment=TA_JUSTIFY, leftIndent=16, bulletIndent=2, spaceAfter=3,
                           bulletFontName='Arial', bulletFontSize=12),
    'cell': ParagraphStyle('cell', fontName='Arial', fontSize=12, leading=14, textColor=black, alignment=TA_LEFT),
    'cellb': ParagraphStyle('cellb', fontName='Arial-Bold', fontSize=12, leading=14, textColor=black),
    'num': ParagraphStyle('num', fontName='Arial', fontSize=12, leading=14, textColor=black, alignment=2),
    'numb': ParagraphStyle('numb', fontName='Arial-Bold', fontSize=12, leading=14, textColor=black, alignment=2),
    'cover': ParagraphStyle('cover', fontName='Arial-Bold', fontSize=12, leading=22, textColor=black,
                            alignment=TA_CENTER),
}
GRIS = HexColor('#E7E6E6')
W, H = letter
MARGEN = 72  # 2.54 cm

EQUIPO = [('ANGÉLICA RODRÍGUEZ', '2-751-41'), ('ELIEL GARCÍA', '8-990-1192'),
          ('ANLLELINA VARCASIA', '8-935-2039')]


# ---------------------------------------------------------------- utilidades
def titulo(texto):
    return Paragraph(f'<u>{texto}</u>', ST['titulo'])


def sub(texto):
    return Paragraph(f'<u>{texto}</u>', ST['sub'])


def p(texto):
    return Paragraph(texto, ST['body'])


def items(lista, viñeta='•'):
    return [Paragraph(t, ST['item'], bulletText=viñeta if viñeta != 'n' else f'{i}.')
            for i, t in enumerate(lista, 1)]


def tabla(filas, anchos, numericas=(), totales=(), encabezado=True):
    """filas: lista de listas de texto. numericas: índices de columnas alineadas a la derecha."""
    datos = []
    for r, fila in enumerate(filas):
        neg = (encabezado and r == 0) or r in totales
        celdas = []
        for c, v in enumerate(fila):
            if c in numericas and not (encabezado and r == 0 and c == 0):
                est = 'numb' if neg else 'num'
            else:
                est = 'cellb' if neg else 'cell'
            celdas.append(Paragraph(str(v), ST[est]))
        datos.append(celdas)
    t = Table(datos, colWidths=anchos, repeatRows=1 if encabezado else 0, hAlign='CENTER')
    estilo = [('GRID', (0, 0), (-1, -1), 0.5, black), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
              ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
              ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5)]
    if encabezado:
        estilo.append(('BACKGROUND', (0, 0), (-1, 0), GRIS))
    t.setStyle(TableStyle(estilo))
    return KeepTogether(t)


# ---------------------------------------------------------------- portada
def portada(c, documento, cedulas):
    c.drawImage(str(ASSETS / 'logo-utp.png'), 26, H - 122, 80, 80, mask='auto')
    c.drawImage(str(ASSETS / 'logo-fisc.png'), W - 26 - 72, H - 118, 72, 72, mask='auto')

    def centro(y, texto, tam=12):
        c.setFont('Arial-Bold', tam)
        c.setFillColor(black)
        c.drawCentredString(W / 2, y, texto)

    y = H - 70
    for linea in ['UNIVERSIDAD TECNOLÓGICA DE PANAMÁ', 'FACULTAD DE INGENIERÍA DE SISTEMAS COMPUTACIONALES',
                  'LICENCIATURA EN GESTIÓN Y DESARROLLO DE SOFTWARE', 'ADMINISTRACIÓN FINANCIERA (8402)',
                  'II SEMESTRE']:
        centro(y, linea)
        y -= 23

    y = H - 255
    centro(y, 'EXAMEN PARCIAL N° 3')
    centro(y - 23, 'CASO INDUSTRIAS PLÁSTICAS ALTAMIRA, S.A.')
    for i, linea in enumerate(documento):
        centro(y - 62 - 23 * i, linea)

    y = H - 445
    centro(y, 'PREPARADO POR:')
    for i, (nombre, ced) in enumerate(EQUIPO, 1):
        centro(y - 23 * i, f'{nombre} — {ced}' if cedulas else nombre)

    centro(155, 'PANAMÁ, REPÚBLICA DE PANAMÁ')
    centro(95, '2026')


class Numerado(rl_canvas.Canvas):
    """Numera las páginas de contenido (la portada no lleva número)."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self._paginas = []

    def showPage(self):
        self._paginas.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._paginas) - 1
        for estado in self._paginas:
            self.__dict__.update(estado)
            n = self._pageNumber - 1
            if n >= 1:
                self.setFont('Arial', 10)
                self.setFillColor(black)
                self.setLineWidth(0.5)
                self.line(MARGEN, 50, W - MARGEN, 50)
                self.drawString(MARGEN, 36, self._pie)
                self.drawRightString(W - MARGEN, 36, f'Página {n} de {total}')
            super().showPage()
        super().save()


def unir_titulos(historia):
    """Evita que un subtítulo quede solo al final de la página separado de su tabla."""
    salida = []
    for f in historia:
        if isinstance(f, KeepTogether) and salida and getattr(salida[-1], 'style', None) is ST['sub']:
            f = KeepTogether([salida.pop()] + f._content)
        salida.append(f)
    return salida


def construir(destino, historia, documento, pie, titulo_pdf, cedulas):
    historia = unir_titulos(historia)
    class Lienzo(Numerado):
        _pie = pie

    doc = SimpleDocTemplate(str(destino), pagesize=letter, leftMargin=MARGEN, rightMargin=MARGEN,
                            topMargin=MARGEN, bottomMargin=66, title=titulo_pdf,
                            author='Angélica Rodríguez, Eliel García y Anllelina Varcasia',
                            subject='Administración Financiera 8402 · Examen parcial N° 3')
    doc.build([Spacer(1, 1), PageBreak()] + historia,
              onFirstPage=lambda c, d: portada(c, documento, cedulas), canvasmaker=Lienzo)
    return destino


ANCHO = W - 2 * MARGEN  # 468 pt
URL = 'https://rodriguezac.github.io/napa/'


# ================================================================= MANUAL
def manual():
    s = [titulo('MANUAL DE USO DEL APLICATIVO ÑAPA')]
    s.append(p('ñapa es una aplicación web que procesa los estados financieros de Industrias Plásticas Altamira, '
               'S.A. y genera automáticamente los análisis de los capítulos 2 y 3: estados financieros, 13 razones, '
               'análisis horizontal y vertical e indicadores complementarios. Todos los resultados se calculan con '
               'código a partir de las cuentas; ninguna cifra se digita a mano.'))

    s.append(sub('1. Acceso y navegación'))
    s.append(p(f'Abra <link href="{URL}"><u>{URL}</u></link> en un navegador actualizado (Chrome, Edge, Firefox '
               'o Safari). No requiere instalación, usuario ni contraseña. El <b>menú lateral</b> funciona como '
               'menú principal; en el teléfono se despliega con <b>Abrir menú</b>. La pantalla de inicio, '
               '<b>Panorama financiero</b>, resume ventas, utilidad, caja e indicadores clave.'))
    s.append(tabla([
        ['Módulo del parcial', 'Opción del menú'],
        ['1. Captura de datos', 'Datos de entrada / Clasificación de cuentas'],
        ['2. Estado de resultados', 'Estado de resultados'],
        ['3. Balance general', 'Balance general'],
        ['4. Flujo de efectivo', 'Flujo de efectivo'],
        ['5. 13 razones y Du Pont', 'Razones financieras'],
        ['6. Horizontal y vertical', 'Análisis comparativo'],
        ['7. Indicadores complementarios', 'Indicadores complementarios'],
        ['Regla de la sustentación', 'Prueba en vivo'],
    ], [190, ANCHO - 190]))

    s.append(sub('2. Capturar los datos'))
    s.append(p('En <b>Datos de entrada</b> elija el año (2024 o 2025) y busque la cuenta por nombre o categoría. '
               'Las 50 cuentas de 2025 y los estados de 2024 ya están cargados. Escriba importes positivos: '
               '<b>D</b> indica saldo deudor y <b>H</b>, acreedor. En la misma pantalla se editan los datos '
               'complementarios: tasa de ISR, acciones, año comercial, unidades y precios por producto.'))
    s.extend(items([
        '<b>Validación:</b> el aplicativo comprueba Activos = Pasivos + Capital. Si no cuadra, aparece la alerta '
        '<b>El balance necesita revisión</b> con la diferencia; corrija el saldo hasta que sea cero.',
        '<b>Agregar una cuenta:</b> en <b>Agregar una cuenta</b> escriba un código válido (1 activo, 2 pasivo, '
        '3 capital, 4 ingresos, 5 costos, 6 gastos), el nombre y los saldos de ambos años, y pulse '
        '<b>Agregar cuenta</b>. Marque <b>Valuación (resta)</b> solo en cuentas como la depreciación acumulada.',
    ]))

    s.append(sub('3. Consultar estados y razones'))
    s.extend(items([
        '<b>Estado de resultados:</b> ventas netas, costo de ventas, UAII, ISR (25 %), utilidad neta y utilidad '
        'por acción, comparando 2025 con 2024.',
        '<b>Balance general:</b> estructura comparativa y conciliación de utilidades retenidas.',
        '<b>Flujo de efectivo:</b> método indirecto, conciliación con Caja y bancos y flujo de efectivo libre.',
        '<b>Razones financieras:</b> 13 razones frente a la industria, Du Pont, semáforo (verde alcanza la '
        'referencia; ámbar, hasta 10 % desfavorable; rojo, más de 10 %) y comentario por categoría.',
        '<b>Análisis comparativo:</b> variaciones horizontales, pesos verticales y gráficos.',
    ]))

    s.append(sub('4. Indicadores complementarios (módulo 7)'))
    s.append(p('La opción <b>Indicadores complementarios</b> calcula siete paneles identificados con su letra: '
               '<b>a</b> escudo fiscal de la depreciación; <b>b</b> intereses y arrendamientos antes y después del '
               'ISR; <b>c</b> valor en libros por acción, utilidad y dividendo por acción y relación P/U; <b>d</b> '
               'conciliación de ventas por producto; <b>e</b> utilidad neta frente al flujo de operación con las '
               'tres partidas de capital de trabajo que más la explican; <b>f</b> Du Pont descompuesto en margen, '
               'rotación y endeudamiento; y <b>g</b> efectivo inmovilizado por la política de crédito. El caso no '
               'da precio de mercado: el P/U usa el valor en libros, salvo que se escriba un precio en el panel c.'))

    s.append(sub('5. Prueba en vivo (regla de la sustentación)'))
    s.append(p('Cuando el profesor cambie una cuenta, abra <b>Prueba en vivo</b>, elija el año y la cuenta (por '
               'ejemplo, cuentas por cobrar o gastos por intereses) y escriba el nuevo saldo o use los botones '
               '±10 % y ±20 %. La tabla muestra qué razones suben o bajan y si mejoran o empeoran frente a la '
               'industria. Expliquen primero el efecto esperado y luego muéstrenlo. Esta prueba no altera los '
               'datos guardados; para un cambio permanente, edite la cuenta en <b>Datos de entrada</b>.'))

    s.append(sub('6. Guardar, respaldar y exportar'))
    s.extend(items([
        'Las cuentas se guardan en el navegador. <b>Respaldar</b> descarga un archivo JSON e <b>Importar JSON</b> '
        'lo carga en otro equipo. <b>Restaurar caso original</b> repone las cuentas del enunciado.',
        'Cada módulo tiene botones <b>Excel</b> y <b>CSV</b>. En <b>Ayuda → Documentos</b> se descargan el libro '
        'completo, este manual y el informe; en <b>Ayuda → Fórmulas</b>, las ecuaciones con los datos vigentes.',
    ]))

    s.append(KeepTogether([sub('7. Verificación antes de la sustentación'),
                           p('Con los datos originales, el aplicativo debe mostrar estas cifras y diferencias de '
                             'cero en el balance, la conciliación de caja y las ventas por producto:'), tabla([
        ['Control', '2024', '2025'],
        ['Utilidad neta', '$458,250', '$208,500'],
        ['Activos totales', '$6,985,250', '$7,793,750'],
        ['Caja y bancos', '$437,250', '$337,750'],
        ['Escudo fiscal (indicador a)', '$92,500', '$106,500'],
    ], [ANCHO - 240, 120, 120], numericas=(1, 2))]))
    return s


# ================================================================= INFORME
def informe():
    s = [titulo('INFORME EJECUTIVO: DIAGNÓSTICO FINANCIERO DE ALTAMIRA')]
    s.append(p('<b>Para:</b> Gerencia General de Industrias Plásticas Altamira, S.A.<br/>'
               '<b>De:</b> Equipo de finanzas<br/><b>Asunto:</b> Diagnóstico financiero 2025, respuestas de '
               'análisis y recomendaciones para la renovación de la línea de crédito'))

    s.append(sub('1. Resumen ejecutivo'))
    s.append(p('En 2025 las ventas netas crecieron 8.58 %, hasta $9,311,000, pero la utilidad neta cayó 54.50 %, '
               'a $208,500. El alza de la resina elevó el costo de ventas, la maquinaria se compró con préstamos y '
               'la política de crédito más flexible retuvo efectivo en cuentas por cobrar e inventarios. Altamira '
               'creció, pero es menos rentable, menos líquida y más endeudada que en 2024 y que la industria: '
               'solo 4 de 13 razones están cerca de la referencia y ninguna la alcanza.'))
    s.append(tabla([
        ['Indicador clave', '2024', '2025', 'Variación'],
        ['Ventas netas', '$8,575,000', '$9,311,000', '+8.58 %'],
        ['Utilidad neta', '$458,250', '$208,500', '−54.50 %'],
        ['Flujo de operación', '$734,250', '$194,500', '−73.51 %'],
        ['Flujo de efectivo libre', '$227,250', '−$669,500', 'n. a.'],
        ['ROE', '13.57 %', '5.95 %', '−7.62 p.p.'],
    ], [ANCHO - 285, 95, 95, 95], numericas=(1, 2, 3)))

    s.append(sub('2. Desempeño y posición financiera'))
    s.append(tabla([
        ['Estados financieros (US$)', '2024', '2025', 'Var. %'],
        ['Ventas netas', '8,575,000', '9,311,000', '+8.58'],
        ['Costo de ventas', '5,573,000', '6,271,000', '+12.52'],
        ['Gastos de operación', '2,219,000', '2,522,000', '+13.65'],
        ['Utilidad de operación (UAII)', '783,000', '518,000', '−33.84'],
        ['Utilidad neta', '458,250', '208,500', '−54.50'],
        ['Activos totales', '6,985,250', '7,793,750', '+11.57'],
        ['Pasivos totales', '3,609,000', '4,292,000', '+18.93'],
        ['Capital contable', '3,376,250', '3,501,750', '+3.72'],
    ], [ANCHO - 250, 90, 90, 70], numericas=(1, 2, 3), totales=(5,)))
    s.append(Spacer(1, 6))
    s.append(p('El costo de ventas pasó de 64.99 % a 67.35 % de las ventas y los gastos de operación crecieron más '
               'rápido que los ingresos; los intereses subieron $49,000. Los activos aumentaron $808,500, '
               'financiados sobre todo con $683,000 de nuevos pasivos. Las utilidades retenidas concilian en '
               '$2,101,750 y el flujo de efectivo concilia con la caja final de $337,750.'))

    s.append(sub('3. Razones financieras y Du Pont'))
    s.append(tabla([
        ['Categoría / razón', '2024', '2025', 'Industria', 'Estado'],
        ['<b>Rentabilidad</b>', '', '', '', ''],
        ['Margen de utilidad', '5.34 %', '2.24 %', '4.50 %', 'Rojo'],
        ['ROA', '6.56 %', '2.68 %', '5.50 %', 'Rojo'],
        ['ROE', '13.57 %', '5.95 %', '11.50 %', 'Rojo'],
        ['<b>Utilización de activos</b>', '', '', '', ''],
        ['Rotación de cuentas por cobrar', '8.34', '7.19', '8.00', 'Rojo'],
        ['Periodo promedio de cobranza', '43.16 d', '50.07 d', '45.00 d', 'Rojo'],
        ['Rotación del inventario', '7.42', '6.47', '7.00', 'Ámbar'],
        ['Rotación de activos fijos', '2.30', '2.26', '2.40', 'Ámbar'],
        ['Rotación de activos totales', '1.23', '1.19', '1.25', 'Ámbar'],
        ['<b>Liquidez</b>', '', '', '', ''],
        ['Razón circulante', '1.80', '1.69', '1.90', 'Rojo'],
        ['Razón rápida', '1.06', '0.93', '1.10', 'Rojo'],
        ['<b>Utilización de deudas</b>', '', '', '', ''],
        ['Deudas a activos totales', '51.67 %', '55.07 %', '50.00 %', 'Ámbar'],
        ['Rotación del interés ganado', '4.75', '2.42', '4.50', 'Rojo'],
        ['Cobertura de cargos fijos', '3.00', '1.82', '3.00', 'Rojo'],
    ], [ANCHO - 296, 72, 72, 76, 76], numericas=(1, 2, 3)))
    s.append(Spacer(1, 6))
    s.append(p('<b>Du Pont descompuesto:</b> el ROE bajó 7.62 puntos porcentuales (de 13.57 % a 5.95 %). Por '
               'sustitución sucesiva, la caída del margen explica −7.89 p.p., la menor rotación de activos −0.15 '
               'p.p. y el mayor endeudamiento (multiplicador de 2.07 a 2.23) aporta +0.42 p.p.'))

    s.append(sub('4. Indicadores complementarios (2025)'))
    s.append(tabla([
        ['Indicador', 'Resultado'],
        ['a. Escudo fiscal de la depreciación',
         '($382,000 + $44,000) × 25 % = $106,500. Sin esos gastos, la utilidad sería $528,000, pero el flujo de '
         'operación bajaría a $88,000.'],
        ['b. Costo después de impuestos', 'Intereses $214,000 → $160,500; arrendamientos $156,000 → $117,000.'],
        ['c. Valor en libros y P/U', 'Valor en libros por acción $16.88 → $17.51; UPA $2.29 → $1.04; dividendo '
         'por acción $0.92 → $0.42. P/U a valor en libros: 7.37 → 16.79 veces.'],
        ['d. Ventas por producto', 'Garrafones $5,220,000 (54.72 %) + cubetas $4,320,000 (45.28 %) = $9,540,000, '
         'igual a las ventas brutas.'],
        ['e. Utilidad vs. flujo', 'Flujo − utilidad: +$276,000 en 2024 y −$14,000 en 2025. Explican 2025: '
         'inventarios −$285,000, cuentas por cobrar −$267,000 y proveedores +$125,000.'],
        ['f. Du Pont descompuesto', 'Margen −7.89 p.p.; rotación −0.15 p.p.; endeudamiento +0.42 p.p.'],
        ['g. Costo de la política de crédito', '(50.07 − 45) días × $25,863.89 diarios = $131,125 inmovilizados.'],
    ], [150, ANCHO - 150]))

    s.append(sub('5. Respuestas a las preguntas de análisis'))
    s.append(p('<b>Capítulo 2: Repaso de contabilidad</b>'))
    preguntas = [
        ('1. Compra de maquinaria con préstamos y flujo libre.',
         'La compra de activos fijos ($775,000, de ellos $630,000 en maquinaria) aparece en <b>actividades de '
         'inversión</b>. Los préstamos aparecen en <b>actividades de financiamiento</b>: la deuda bancaria aumentó '
         '$400,000 y los documentos por pagar $170,000. El flujo de efectivo libre fue de −$669,500: la operación '
         '($194,500) no alcanzó para pagar las inversiones ni los dividendos ($89,000). Por tanto, Altamira '
         '<b>no puede pagar dividendos sin endeudarse más</b>; en 2025 esos dividendos se pagaron con deuda.'),
        ('2. Valor en libros frente a valor de mercado de terrenos y edificios.',
         'El balance registra los activos fijos a costo histórico menos depreciación. Los terrenos ($650,000) no '
         'se deprecian y los edificios ($1,800,000) se deprecian según una vida útil contable, no según su precio. '
         'El valor de mercado cambia por plusvalía, ubicación, inflación u obsolescencia, por lo que puede ser muy '
         'distinto. La limitación ante el banco es que el balance <b>no muestra el valor real de las garantías</b>: '
         'el banco necesitará un avalúo independiente para medir su respaldo.'),
        ('3. Utilidad neta frente al flujo neto de operación.',
         'La utilidad fue de $208,500 y el flujo de operación de $194,500, pese a sumar $426,000 de gastos que no '
         'usan efectivo. Una empresa puede tener utilidades y menos efectivo porque la contabilidad reconoce las '
         'ventas a crédito como ingreso aunque no se hayan cobrado, y porque el efectivo se invierte en inventario. '
         'El capital de trabajo absorbió $440,000. La decisión que más lo explica es <b>relajar la política de '
         'crédito</b> (cuentas por cobrar +$267,000), junto con la acumulación de inventarios (+$285,000).'),
    ]
    preguntas3 = [
        ('4. Clasificación de las 13 razones y categoría que más empeoró.',
         'La clasificación aparece en la tabla de la sección 3. La categoría que más empeoró es la '
         '<b>rentabilidad</b>: el margen cayó de 5.34 % a 2.24 %, el ROA de 6.56 % a 2.68 % y el ROE de 13.57 % a '
         '5.95 %, caídas superiores al 55 %. La causa raíz es el <b>alza del precio de la resina</b>, que subió el '
         'costo de ventas 12.52 % frente a ventas que crecieron 8.58 %, sumada a más gastos e intereses.'),
        ('5. Calidad de las utilidades de 2025.',
         'La utilidad de 2025 es de <b>baja calidad</b>. (1) La rotación de cuentas por cobrar bajó de 8.34 a 7.19 '
         'veces y el periodo de cobranza subió de 43.16 a 50.07 días: parte de las ventas no se ha cobrado. (2) El '
         'flujo de operación equivale a 0.93 veces la utilidad, frente a 1.60 en 2024. (3) La razón rápida de 0.93 '
         'y una cobertura de intereses de 2.42 veces muestran poco respaldo en efectivo. Además, las pérdidas '
         'extraordinarias de $38,000 equivalen al 13.7 % de la utilidad antes de impuestos.'),
        ('6. Coberturas y renovación de la línea de crédito.',
         'La rotación del interés ganado (2.42 veces) y la cobertura de cargos fijos (1.82 veces) están muy por '
         'debajo de la industria (4.5 y 3.0). Como banco, <b>renovaríamos la línea sin aumentarla y con '
         'condiciones</b>: garantía con avalúo de terrenos y edificios; plazo de un año con revisión semestral; '
         'cobertura de intereses mínima de 3 veces; deuda a activos no mayor de 55 %; periodo de cobranza de 45 '
         'días; y ningún dividendo mientras el flujo libre sea negativo.'),
        ('7. Du Pont: operación o financiamiento.',
         'La caída del ROE (−7.62 p.p.) se debe a la <b>operación</b>: margen y rotación explican −8.04 p.p. '
         '(105 % de la variación), mientras que el mayor endeudamiento aportó +0.42 p.p. y amortiguó la caída. '
         'Recomendamos recuperar el margen (costo de la resina, precios y gastos) y la rotación (cobranza e '
         'inventarios), y no subir el ROE con más deuda, porque la cobertura de intereses ya es débil.'),
    ]
    for q, r in preguntas:
        s.append(p(f'<b>{q}</b> {r}'))
    s.append(p('<b>Capítulo 3: Análisis financiero</b>'))
    for q, r in preguntas3:
        s.append(p(f'<b>{q}</b> {r}'))

    s.append(sub('6. Recomendaciones a la gerencia'))
    s.append(tabla([
        ['Plazo', 'Acción', 'Meta / indicador'],
        ['0-30 días', 'Renegociar el precio de la resina, reducir desperdicios y revisar precios de venta.',
         'Costo de ventas ≤ 65 % de ventas'],
        ['0-60 días', 'Endurecer la política de crédito y cobrar la cartera vencida.',
         'Cobranza ≤ 45 días (libera ≈ $131,125)'],
        ['0-60 días', 'Ajustar compras y producción a la demanda.', 'Rotación ≥ 7 veces (libera ≈ $109,857)'],
        ['Continuo', 'Suspender nuevas compras de activos fijos y limitar dividendos hasta tener flujo libre '
         'positivo.', 'Cobertura de intereses ≥ 3 veces'],
    ], [80, ANCHO - 80 - 160, 160]))
    s.append(Spacer(1, 6))
    s.append(p('<b>Conclusión:</b> Altamira tiene un problema de rentabilidad y de capital de trabajo, no de '
               'ventas. Si recupera el margen y acelera la cobranza y los inventarios, podrá liberar cerca de '
               '$241,000 de efectivo, mejorar sus coberturas y sostener la renovación de su línea de crédito. Las '
               'cifras provienen del aplicativo ñapa con los datos del caso, en dólares estadounidenses.'))
    return s


def main():
    cedulas = '--cedulas' in sys.argv
    if cedulas:
        salida = Path(sys.argv[sys.argv.index('--cedulas') + 1])
        salida.mkdir(parents=True, exist_ok=True)
        nombres = ('Manual de uso - Grupo Altamira.pdf', 'Informe ejecutivo - Grupo Altamira.pdf')
    else:
        salida = ROOT / 'public/docs'
        nombres = ('manual-napa.pdf', 'informe-napa.pdf')
    print(construir(salida / nombres[0], manual(), ['MANUAL DE USO DEL APLICATIVO ÑAPA'],
                    'Manual de uso · Aplicativo ñapa', 'Manual de uso del aplicativo ñapa', cedulas))
    print(construir(salida / nombres[1], informe(), ['INFORME EJECUTIVO:', 'DIAGNÓSTICO FINANCIERO Y RECOMENDACIONES'],
                    'Informe ejecutivo · Industrias Plásticas Altamira, S.A.',
                    'Informe ejecutivo - Industrias Plásticas Altamira, S.A.', cedulas))


if __name__ == '__main__':
    main()
