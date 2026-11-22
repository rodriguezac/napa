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
               'S.A. y genera automáticamente los análisis de los capítulos 2, 3 y 4: estados financieros, '
               'razones, análisis horizontal y vertical, proyecciones 2026 y sensibilidad. Todos los resultados '
               'se calculan con código a partir de las cuentas; ninguna cifra se digita a mano.'))

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
        ['6. Horizontal y vertical', 'Análisis horizontal y vertical'],
        ['7. Proyección 2026', 'Proyección 2026: Porcentaje de ventas / Presupuestos'],
        ['8. Sensibilidad', 'Simulador de escenarios'],
    ], [170, ANCHO - 170]))

    s.append(sub('2. Capturar los datos'))
    s.append(p('En <b>Datos de entrada</b> elija el año (2024 o 2025) y busque la cuenta por nombre o categoría. '
               'Las 50 cuentas de 2025 y los estados de 2024 ya están cargados. Escriba importes positivos: '
               '<b>D</b> indica saldo deudor y <b>H</b>, acreedor. En la misma pantalla se editan los datos '
               'complementarios: tasa de ISR, acciones en circulación, año comercial, unidades y precios.'))
    s.extend(items([
        '<b>Validación:</b> el aplicativo comprueba Activos = Pasivos + Capital. Si no cuadra, aparece la alerta '
        '<b>El balance necesita revisión</b> con la diferencia; corrija el saldo hasta que la diferencia sea cero.',
        '<b>Agregar una cuenta:</b> en <b>Agregar una cuenta</b> escriba un código válido (1 activo, 2 pasivo, '
        '3 capital, 4 ingresos, 5 costos, 6 gastos), el nombre y los saldos de ambos años, y pulse '
        '<b>Agregar cuenta</b>. Marque <b>Valuación (resta)</b> solo para cuentas como la depreciación acumulada.',
        '<b>Clasificación de cuentas</b> muestra, para cada cuenta, su tipo, naturaleza, grupo y estado de destino.',
    ]))

    s.append(sub('3. Consultar estados y análisis'))
    s.extend(items([
        '<b>Estado de resultados:</b> ventas netas, costo de ventas, UAII, ISR (25 %), utilidad neta y utilidad '
        'por acción, comparando 2025 con 2024.',
        '<b>Balance general:</b> estructura comparativa y conciliación de utilidades retenidas (saldo inicial + '
        'utilidad neta − dividendos = saldo final).',
        '<b>Flujo de efectivo:</b> método indirecto; verifica la conciliación con Caja y bancos y calcula el '
        'flujo de efectivo libre.',
        '<b>Razones financieras:</b> 13 razones de 2024 y 2025 frente a la industria, sistema Du Pont, semáforo '
        '(verde alcanza la referencia; ámbar, hasta 10 % desfavorable; rojo, más de 10 %) y comentario por categoría.',
        '<b>Análisis horizontal y vertical:</b> variaciones en dólares y porcentaje, peso de cada partida sobre '
        'ventas o activos y gráficos.',
    ]))

    s.append(sub('4. Proyectar 2026'))
    s.extend(items([
        '<b>Porcentaje de ventas (Pro-forma I):</b> modifique crecimiento, costo de ventas, gastos variables y '
        'razón de dividendos. Alterne <b>Plena capacidad</b> y <b>Capacidad ociosa</b> para ver el balance '
        'pro-forma y los fondos nuevos requeridos (RNF, ecuación 4-1), que se ajustan en documentos por pagar.',
        '<b>Presupuestos (Pro-forma II):</b> recorra los siete pasos: ventas por producto, producción, costo de '
        'producción, costo de ventas PEPS, resultados, presupuesto de efectivo y balance proyectado. Tiene 18 '
        'supuestos editables; los porcentajes se escriben como número visible (10 = 10 %).',
    ]))
    s.append(p('<b>Restaurar</b> devuelve cada pantalla a sus supuestos base.'))

    s.append(sub('5. Simular escenarios'))
    s.append(p('En <b>Simulador de escenarios</b> seleccione Pesimista, Base u Optimista, o cambie cualquiera de '
               'los siete supuestos (crecimiento, costo de ventas, gastos variables, días de cobro, rotación de '
               'inventario, dividendos y activos fijos que crecen). El efecto en utilidad neta, RNF, caja, ROE, '
               'razón circulante y deuda se muestra al instante. Los gráficos de tornado indican qué variable '
               'afecta más la utilidad y el RNF, cambiando una a la vez.'))

    s.append(sub('6. Guardar, respaldar y exportar'))
    s.extend(items([
        'Las cuentas se guardan en el navegador. Use <b>Respaldar</b> para descargar un archivo JSON e '
        '<b>Importar JSON</b> para cargarlo en otro equipo.',
        'Cada módulo tiene los botones <b>Excel</b> (con formato y gráficas) y <b>CSV</b>. En <b>Ayuda → '
        'Documentos</b> se descarga el libro completo, este manual y el informe ejecutivo.',
        '<b>Restaurar caso original</b> repone las cuentas del enunciado; haga un respaldo antes.',
        'En <b>Ayuda → Fórmulas</b> se consultan todas las ecuaciones con los datos vigentes.',
    ]))

    s.append(sub('7. Verificación antes de la sustentación'))
    s.append(p('Con los datos originales, el aplicativo debe mostrar las cifras siguientes y diferencias de cero '
               'en el balance y en la conciliación de caja:'))
    s.append(tabla([
        ['Control', '2024', '2025'],
        ['Utilidad neta', '$458,250', '$208,500'],
        ['Activos totales', '$6,985,250', '$7,793,750'],
        ['Caja y bancos', '$437,250', '$337,750'],
        ['Utilidades retenidas', '$1,976,250', '$2,101,750'],
    ], [ANCHO - 240, 120, 120], numericas=(1, 2)))
    return s


# ================================================================= INFORME
def informe():
    s = [titulo('INFORME EJECUTIVO: DIAGNÓSTICO FINANCIERO DE ALTAMIRA')]
    s.append(p('<b>Para:</b> Gerencia General y Junta Directiva de Industrias Plásticas Altamira, S.A.<br/>'
               '<b>De:</b> Equipo de finanzas<br/><b>Asunto:</b> Diagnóstico 2025, proyección 2026 y '
               'recomendaciones para la renovación de la línea de crédito'))

    s.append(sub('1. Resumen ejecutivo'))
    s.append(p('En 2025 Altamira aumentó sus ventas netas 8.58 %, hasta $9,311,000, pero su utilidad neta cayó '
               '54.50 %, a $208,500. El alza de la resina elevó el costo de ventas, la compra de maquinaria con '
               'préstamos aumentó el endeudamiento y la política de crédito más flexible inmovilizó efectivo en '
               'cuentas por cobrar. La empresa creció, pero es menos rentable, menos líquida y más endeudada que '
               'en 2024 y que el promedio de la industria.'))
    s.append(tabla([
        ['Indicador clave', '2024', '2025', 'Variación'],
        ['Ventas netas', '$8,575,000', '$9,311,000', '+8.58 %'],
        ['Utilidad neta', '$458,250', '$208,500', '−54.50 %'],
        ['Flujo de operación', '$734,250', '$194,500', '−73.51 %'],
        ['Flujo de efectivo libre', '$227,250', '−$669,500', 'n. a.'],
        ['Utilidad por acción', '$2.29', '$1.04', '−54.50 %'],
    ], [ANCHO - 285, 95, 95, 95], numericas=(1, 2, 3)))
    s.append(Spacer(1, 6))
    s.append(p('<b>Conclusión:</b> la empresa sigue siendo solvente, pero su capacidad de pagar deuda se redujo. '
               'Recomendamos renovar la línea de crédito condicionada a un plan de recuperación de margen y de '
               'capital de trabajo, y posponer nuevas inversiones en activos fijos hasta confirmar la capacidad '
               'instalada.'))

    s.append(sub('2. Desempeño del ejercicio 2025'))
    s.append(tabla([
        ['Estado de resultados (US$)', '2024', '2025', 'Var. %'],
        ['Ventas netas', '8,575,000', '9,311,000', '+8.58'],
        ['Costo de ventas', '5,573,000', '6,271,000', '+12.52'],
        ['Utilidad bruta', '3,002,000', '3,040,000', '+1.27'],
        ['Gastos de operación', '2,219,000', '2,522,000', '+13.65'],
        ['Utilidad de operación (UAII)', '783,000', '518,000', '−33.84'],
        ['Utilidad antes de impuestos', '611,000', '278,000', '−54.50'],
        ['Utilidad neta', '458,250', '208,500', '−54.50'],
    ], [ANCHO - 250, 90, 90, 70], numericas=(1, 2, 3), totales=(3, 5, 7)))
    s.append(Spacer(1, 6))
    s.append(p('Las ventas adicionales de $736,000 solo generaron $38,000 de utilidad bruta: el costo de ventas '
               'pasó de 64.99 % a 67.35 % de las ventas por el alza de materiales. Los gastos de operación '
               'crecieron $303,000 (13.65 %), más rápido que las ventas, y los intereses subieron $49,000 por los '
               'nuevos préstamos. El resultado es una caída de 33.84 % en la utilidad de operación.'))

    s.append(sub('3. Posición financiera y flujo de efectivo'))
    s.append(tabla([
        ['Balance general (US$)', '2024', '2025'],
        ['Activos circulantes', '2,805,250', '3,204,750'],
        ['Activos fijos netos', '3,730,000', '4,123,000'],
        ['Otros activos', '450,000', '466,000'],
        ['Activos totales', '6,985,250', '7,793,750'],
        ['Pasivos totales', '3,609,000', '4,292,000'],
        ['Capital contable', '3,376,250', '3,501,750'],
    ], [ANCHO - 200, 100, 100], numericas=(1, 2), totales=(4,)))
    s.append(Spacer(1, 6))
    s.append(p('Los activos crecieron $808,500 y se financiaron principalmente con $683,000 de nuevos pasivos. Las '
               'cuentas por cobrar netas aumentaron $267,000 y los inventarios $285,000: $552,000 de efectivo '
               'quedaron retenidos en la operación. Las utilidades retenidas concilian en $2,101,750 ($1,976,250 '
               '+ $208,500 − $83,000 de dividendos).'))
    s.append(p('El flujo de operación fue de $194,500, la inversión de −$775,000 y el financiamiento de $481,000; '
               'la caja bajó $99,500, de $437,250 a $337,750. El flujo libre fue negativo (−$669,500): la '
               'operación no alcanzó para pagar las inversiones y los dividendos, por lo que la diferencia se '
               'cubrió con deuda.'))

    s.append(sub('4. Razones financieras y sistema Du Pont'))
    s.append(tabla([
        ['Razón', '2024', '2025', 'Industria', 'Estado'],
        ['Margen de utilidad', '5.34 %', '2.24 %', '4.50 %', 'Rojo'],
        ['ROA', '6.56 %', '2.68 %', '5.50 %', 'Rojo'],
        ['ROE', '13.57 %', '5.95 %', '11.50 %', 'Rojo'],
        ['Rotación de cuentas por cobrar', '8.34', '7.19', '8.00', 'Rojo'],
        ['Periodo promedio de cobranza', '43.16 d', '50.07 d', '45.00 d', 'Rojo'],
        ['Rotación del inventario', '7.42', '6.47', '7.00', 'Ámbar'],
        ['Rotación de activos fijos', '2.30', '2.26', '2.40', 'Ámbar'],
        ['Rotación de activos totales', '1.23', '1.19', '1.25', 'Ámbar'],
        ['Razón circulante', '1.80', '1.69', '1.90', 'Rojo'],
        ['Razón rápida', '1.06', '0.93', '1.10', 'Rojo'],
        ['Deudas a activos totales', '51.67 %', '55.07 %', '50.00 %', 'Ámbar'],
        ['Rotación del interés ganado', '4.75', '2.42', '4.50', 'Rojo'],
        ['Cobertura de cargos fijos', '3.00', '1.82', '3.00', 'Rojo'],
    ], [ANCHO - 296, 72, 72, 76, 76], numericas=(1, 2, 3)))
    s.append(Spacer(1, 6))
    s.extend(items([
        '<b>Rentabilidad:</b> el margen de 2.24 % está por debajo de la industria (4.50 %) y arrastra el ROA y '
        'el ROE a menos de la mitad de sus referencias.',
        '<b>Actividad:</b> la cobranza se alargó a 50 días (industria: 45) y el inventario rota 6.47 veces '
        '(industria: 7); ambos efectos absorben efectivo.',
        '<b>Liquidez:</b> la razón circulante (1.69) y la rápida (0.93) son inferiores a 1.90 y 1.10; sin '
        'inventarios, la empresa no cubre su pasivo circulante.',
        '<b>Endeudamiento:</b> la deuda llega a 55.07 % de los activos y la cobertura de intereses cayó a 2.42 '
        'veces (industria: 4.50), la señal más sensible para el banco.',
    ]))
    s.append(p('<b>Du Pont 2025:</b> margen 2.24 % × rotación de activos 1.19 = ROA 2.68 %; ROA ÷ (1 − 0.5507) = '
               'ROE 5.95 %. La caída del ROE se explica por el margen: el mayor apalancamiento no logró '
               'compensarla.'))

    s.append(sub('5. Proyección 2026 (Pro-forma I y Pro-forma II)'))
    s.append(p('Con crecimiento de ventas de 12 %, los porcentajes de costos de 2025, partidas fijas constantes y '
               'dividendos de 40 %, las ventas de 2026 serían $10,428,320 y la utilidad neta $336,000.'))
    s.append(tabla([
        ['Pro-forma I (US$)', 'Plena capacidad', 'Capacidad ociosa'],
        ['Activos totales', '8,665,880', '8,171,120'],
        ['Utilidad retenida del año', '201,600', '201,600'],
        ['Fondos nuevos requeridos (RNF)', '551,250', '56,490'],
        ['Documentos por pagar finales', '1,071,250', '576,490'],
    ], [ANCHO - 240, 120, 120], numericas=(1, 2), totales=(3,)))
    s.append(Spacer(1, 6))
    s.append(p('Según la ecuación 4-1, a plena capacidad RNF = $872,130 − $119,280 − $201,600 = $551,250. Si la '
               'maquinaria comprada en 2025 tiene capacidad ociosa, el RNF baja a $56,490: confirmar esa '
               'capacidad ahorra casi $495,000 de financiamiento. La Pro-forma II (presupuestos con costos PEPS) '
               'arroja la misma utilidad de $336,000 y un préstamo requerido de $117,750 para mantener la caja '
               'mínima; si los materiales suben 10 %, la utilidad cae a $41,931 y el préstamo sube a $257,061.'))
    s.append(sub('6. Análisis de sensibilidad'))
    s.append(tabla([
        ['Resultado 2026', 'Pesimista', 'Base', 'Optimista'],
        ['Utilidad neta', '$4,180', '$334,906', '$689,236'],
        ['Margen de utilidad', '0.04 %', '3.21 %', '6.27 %'],
        ['RNF (ecuación 4-1)', '$914,662', '$294,061', '−$379,689'],
        ['Documentos por pagar', '$1,434,662', '$814,061', '$140,311'],
        ['ROE', '0.12 %', '9.04 %', '17.30 %'],
        ['Razón circulante', '1.37', '1.55', '2.06'],
        ['Deudas a activos', '60.05 %', '55.96 %', '50.66 %'],
    ], [ANCHO - 285, 95, 95, 95], numericas=(1, 2, 3)))
    s.append(Spacer(1, 6))
    s.append(p('Al cambiar una variable a la vez, el <b>costo de ventas</b> es la de mayor impacto en la utilidad '
               'neta ($391,062 entre extremos) y la <b>proporción de activos fijos que crece</b> es la de mayor '
               'impacto en el RNF ($494,760). En el escenario pesimista la empresa casi no gana y su deuda supera '
               'el 60 % de los activos; por ello, el control del costo de la resina es la prioridad.'))

    s.append(sub('7. Recomendaciones a la gerencia'))
    s.append(tabla([
        ['Plazo', 'Acción', 'Meta / indicador'],
        ['0-30 días', 'Renegociar el precio de la resina, reducir desperdicios y revisar precios de venta.',
         'Costo de ventas ≤ 65 % de ventas'],
        ['0-60 días', 'Endurecer la política de crédito y cobrar la cartera vencida.',
         'Cobranza ≤ 45 días (libera ≈ $131,125)'],
        ['0-60 días', 'Ajustar compras y producción a la demanda.',
         'Rotación ≥ 7 veces (libera ≈ $109,857)'],
        ['Antes de invertir', 'Confirmar la capacidad instalada y posponer compras de activos fijos.',
         'RNF cercano a $56,490'],
        ['Mensual', 'Presupuesto de caja, calendario de deuda y dividendos de 40 % o menos.',
         'Cobertura de intereses ≥ 4.5 veces'],
    ], [80, ANCHO - 80 - 160, 160]))
    s.append(Spacer(1, 6))
    s.append(p('Para la renovación de la línea de crédito, presentar al banco los estados conciliados, la '
               'proyección 2026 en capacidad ociosa, el calendario de vencimientos y el avance mensual en '
               'cobranza e inventarios. Las estimaciones de efectivo liberado se calculan con las ventas de 2025 y '
               'no constituyen ingresos adicionales.'))
    s.append(sub('8. Conclusión'))
    s.append(p('Altamira tiene un problema de rentabilidad y de capital de trabajo, no de ventas. Si recupera el '
               'margen, acelera la cobranza y aprovecha la capacidad instalada, puede financiar 2026 con un '
               'préstamo moderado y volver a niveles cercanos a la industria. Las cifras provienen del aplicativo '
               'ñapa con los datos del caso y están expresadas en dólares estadounidenses.'))
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
