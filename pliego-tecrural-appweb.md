# TECRURAL - PLIEGO COMPLETO PARA PROGRAMAR LA APP WEB
## Calculadora de riego aguacate Hass + Captura de leads + Revisión en 24h

**Versión:** v1.0 para agente de programación
**Objetivo de negocio:** No construir otro IRRIGATE. Construir la puerta de entrada: en <2 min, sin registro, el agricultor sabe cuánto dinero está perdiendo por regar así y si le compensa medir. La calculadora es el imán, el lead es el producto.
**Presupuesto y contexto:** Proyecto con presupuesto inicial <100 €. Fase H5 validación antes de H6. No hay backend complejo en MVP. Todo debe funcionar con coste casi cero.

---

## 1. PRINCIPIOS NO NEGOCIABLES

1. **Móvil primero.** El 90% lo usará en el campo con el móvil, con sol, con guantes, con poca cobertura. Diseñar para 360px primero, luego tablet y desktop.
2. **Sin registro para calcular.** Nunca pedir cuenta, email o teléfono ANTES de mostrar el resultado. El lead se pide DESPUÉS de dar valor, cuando el agricultor quiere la revisión.
3. **7 datos, no 15.** Si el formulario pide más de 7 datos, está mal. Cada campo extra es un abandono.
4. **Lenguaje dinero, no mm.** La salida principal es €/ha en riesgo + payback en meses. Los mm son secundarios y se muestran pequeños.
5. **Transparencia total.** Mostrar siempre supuestos y fórmula simplificada. Nunca caja negra. El agricultor y el técnico deben poder corregir un supuesto.
6. **Comparación honesta con IRRIGATE.** En la landing debe decir: "IRRIGATE te dice cuándo regar cada día. Nosotros te decimos si te compensa invertir en medir." No competir en precisión FAO-56, competir en decisión.
7. **Rápido.** Primer resultado visible en <2 min y carga inicial <2s en 4G. Sin animaciones pesadas.

## 2. PERFIL DE USUARIO

**Usuario principal:** Agricultor de aguacate Hass adulto, 40-70 años, Costa Tropical. Municipios iniciales: Almuñécar, Motril, Vélez-Málaga. Riega por goteo. Conoce su dotación de la comunidad, sus horas de riego y su producción aproximada. No conoce textura de suelo, ni Kc, ni ETo. Usa WhatsApp a diario. Desconfía de herramientas que le piden muchos datos y le dan un número sin explicar.

**Usuario secundario:** Técnico / asesor. Lo usa delante del agricultor para justificar una inversión. Necesita poder cambiar supuestos y descargar un PDF que enviar por WhatsApp.

**Lo que el agricultor NO va a hacer:** Crear cuenta, seleccionar parcela en un mapa, buscar su textura de suelo, leer un manual de 20 páginas.

## 3. STACK RECOMENDADO PARA MVP

- **Frontend:** React + Vite + Tailwind CSS. Sin framework pesado.
- **Routing:** React Router o estado simple si es una sola página con 3 vistas. Priorizar simplicidad.
- **Estado:** useState + useMemo. Sin Redux.
- **Backend MVP:** Sin backend. Cálculo 100% en frontend con datos locales. Lead se envía por: a) enlace WhatsApp pre-rellenado a número de TecRural, b) guardado en localStorage, c) opcionalmente POST a Google Sheets / Formspree / Supabase si se configura. No inventar backend propio en MVP.
- **PDF:** Generar con window.print() con CSS de impresión optimizado, o librería ligera jsPDF. No depender de servidor.
- **Analítica:** Eventos simples: inicio_calculadora, resultado_visto, clic_whatsapp, lead_enviado. Sin cookies invasivas.
- **Hosting:** Vercel / Netlify, coste 0.

## 4. DISEÑO FRONTEND - MODERNO, LLAMATIVO Y ENTENDIBLE

### 4.1 Sistema de diseño

**Colores:**
- Verde aguacate principal: #1A7A3A (botones primarios, títulos)
- Verde oscuro: #0F4D24 (fondo hero, footer)
- Amarillo lima acento: #C6E81A / #D9F24F (para destacar € y ahorro, no para texto)
- Azul agua: #2A9DCC (para agua, m³, riego)
- Tierra: #8B5E3C (detalles secundarios, iconos suelo)
- Fondo: #F7F9F4 (casi blanco verdoso)
- Texto: #1A1A1A sobre claro, #FFFFFF sobre oscuro. Contraste mínimo AA.

**Tipografía:**
- Títulos: Inter / Sora / Poppins, bold, 28-36px en móvil, 40-56px en desktop. Frases cortas.
- Cuerpo: Inter, 18-19px mínimo en móvil. Nunca texto de 12-14px para datos importantes.
- Números clave: 36-48px, bold, con unidad pequeña al lado (€/ha, meses).

**Componentes:**
- Botones primarios: altura mínima 56px, ancho completo en móvil, radio 14px, texto 18px bold. Ejemplo: "Ver cuánto pierdo →"
- Tarjetas: fondo blanco, radio 18px, sombra suave, borde 1px #E2E8E0.
- Inputs: altura 56px, borde 2px, al enfocar borde verde. Etiqueta grande encima, ejemplo debajo en gris. Nunca placeholder como única etiqueta.
- Barra de progreso: 3 pasos visibles arriba: 1) Tu finca 2) Tu agua 3) Tu resultado. Con iconos.
- Sliders grandes para hectáreas y dotación, con valor visible al lado. Alternativa a escribir.
- Chips de selección rápida: Municipio [Almuñécar | Motril | Vélez-Málaga | Otro], Año [ON | OFF], Edad [Joven <4 años | Adulto 4-10 | Mayor >10].

**Hero de la landing:**
- Fondo verde oscuro con foto real de finca de aguacate (no ilustración genérica) + overlay oscuro para legibilidad.
- Titular gigante: "¿Cuánto dinero pierdes por regar a ojo?"
- Subtítulo: "En 2 minutos, sin registro, con tus datos. Te decimos si te compensa medir."
- Botón gigante amarillo: "Calcular ahora - Gratis"
- Debajo: 3 mini-pruebas sociales: "Sin cuenta • Con tus datos • Revisión por WhatsApp en 24h"
- Franja comparativa honesta: "IRRIGATE = cuándo regar cada día | TecRural = si te compensa invertir"

### 4.2 Accesibilidad y usabilidad agricultor

- Botones táctiles >=56px, separación entre botones >=12px.
- No usar jerga: decir "Agua que te da la comunidad" en vez de "Dotación hídrica". "Kilos que cogiste" en vez de "Rendimiento". "Año con mucha fruta" en vez de "Año ON".
- Cada campo con ayuda en una línea: icono ? que abre tooltip con ejemplo: "Ej: 3,5 ha".
- Mostrar siempre qué falta: "Te queda 1 paso".
- Errores en lenguaje llano y con solución: "La dotación no puede ser 0. Si no la sabes, pon 4.000 y lo revisamos luego." Nunca "Error 422: invalid input".
- Modo sol: contraste alto, sin grises claros sobre blanco para datos clave.
- Funciona con una mano: botón principal siempre visible abajo (sticky) en móvil.

## 5. ARQUITECTURA DE PANTALLAS

**Vista 1 - Landing / Inicio (/)**
- Hero + comparativa + 3 pasos + 1 testimonio / ejemplo real + botón Calcular.
- Ejemplo real visible: "Finca 3 ha en Vélez-Málaga, año ON, dotación 4.000 m³/ha: necesidad 5.886 m³/ha, en riesgo 1.050 €/ha". Con nota "Ejemplo con datos reales, no promesa".

**Vista 2 - Calculadora (/calculadora) - 3 pasos en una sola página con scroll o pasos**

**Paso 1 - Tu finca (2 campos + 2 chips):**
- Municipio: selector chips [Almuñécar, Motril, Vélez-Málaga, Otro]. Si Otro, campo texto libre.
- Hectáreas: slider + input numérico (0,1 - 50). Defecto 2,5.
- Edad / cobertura: chips [Joven, Adulto, Mayor]. Defecto Adulto.
- Año de carga: chips [Año con mucha fruta (ON), Año con poca fruta (OFF)]. Defecto ON. Ayuda: "Si este año tienes mucha fruta, es ON".

**Paso 2 - Tu agua (3 campos):**
- Dotación que te da la comunidad: slider + input (0 - 8.000 m³/ha/año). Defecto 4.000. Ayuda: "Lo que te dice tu comunidad, no lo que riegas. Si no lo sabes, pon 4.000".
- Horas de riego por semana en verano: slider (0 - 40h). Defecto 12h. Ayuda: "En julio, ¿cuántas horas a la semana abres el riego?"
- Goteros por árbol y caudal: dos inputs pequeños. Goteros/árbol defecto 4, caudal defecto 2,2 l/h. Ayuda: "Mira un gotero, ¿pone 2 l/h o 4 l/h? Si no lo sabes, deja 2,2".
- Producción año pasado: input kg/ha (0 - 20.000). Defecto 10.000. Precio: input €/kg (0,5 - 5). Defecto 2,50. Ayuda: "¿A cuánto te lo pagaron de media?"

**Total 7 datos.** El sistema calcula el resto con supuestos visibles.

**Vista 3 - Resultado (/resultado)**
- Parte superior: Semáforo grande:
  - VERDE: "Te compensa medir" si payback <=12 meses
  - AMARILLO: "Te compensa si compartes o ajustas" si payback 12-24 meses
  - ROJO: "Con tu dotación, no te compensa el kit, te compensa ajustar horas" si payback >24 meses o déficit muy alto
- 3 números gigantes en tarjetas:
  1. Necesidad de tu finca: X.XXX m³/ha/año
  2. Agua que aplicas: X.XXX m³/ha/año (calculada de horas x caudal)
  3. Dinero en riesgo: X.XXX €/ha/año
- Segunda fila: Ahorro estimado con sensores: XXX-XXX m³/ha + XXX €/ha. Payback: X-X meses.
- Gráfico simple de barras: Necesidad vs Dotación vs Aplicado. Sin gráfico complejo. 3 barras con colores.
- 3 escenarios en pestañas o tarjetas comparables: A) Como riegas hoy B) Con calendario optimizado C) Con sensores. Cada uno con m³, €, riesgo.
- Sección "Supuestos que puedes corregir": lista visible con valores usados: ETo, Kc, eficiencia 90%, lluvia efectiva, textura supuesta franca. Botón "Corregir supuestos" que abre panel de técnico.
- Botón principal: "Quiero que me lo revisen con mis datos - WhatsApp" -> abre formulario lead.
- Botón secundario: "Descargar PDF de 1 página" + "Volver a calcular".

**Vista 4 - Formulario lead (modal o sección en resultado, NO página aparte)**
- Nombre (opcional, texto)
- Teléfono WhatsApp (obligatorio, validación española 9 dígitos, puede empezar por +34)
- Municipio (pre-rellenado)
- Checkbox: "Acepto que me contacten por WhatsApp para revisar mi cálculo"
- Botón: "Enviar y recibir revisión en 24h"
- Al enviar: mostrar mensaje "¡Listo! Te escribimos en 24h con tu revisión. Mientras, guarda tu PDF." + enlace WhatsApp directo.

**Vista 5 - Panel técnico (oculto, /tecnico)**
- Mismo cálculo pero con todos los supuestos editables: ETo mensual, Kc base, factor cobertura, factor ON/OFF, eficiencia, lluvia efectiva, coste kit (defecto 850 €/ha), coste agua €/m³, coste energía.
- Botón "Generar enlace con estos supuestos" para compartir con agricultor.

## 6. LÓGICA DE CÁLCULO - ESPECIFICACIÓN MATEMÁTICA

**Importante:** La calculadora NO pretende ser más precisa que IRRIGATE. Es una estimación para decidir inversión, con rango, no número exacto. Mostrar siempre rango.

**Datos base por municipio (tabla editable en código, fuente: SIAR / RIA Andalucía):**
- Almuñécar: ETo verano (jun-ago) 5,2 mm/día, ETo anual ~1.350 mm/año, lluvia anual ~350 mm
- Motril: ETo verano 5,0 mm/día, ETo anual ~1.320 mm/año, lluvia ~380 mm
- Vélez-Málaga: ETo verano 4,9 mm/día, ETo anual ~1.300 mm/año, lluvia ~420 mm
- Otro: usar media 5,0 mm/día, 1.330 mm/año.

**Fórmulas (implementar exactamente en este orden):**

1. **Kc ajustado:**
   Kc_base = 0,85 (Hass adulto, referencia)
   Factor cobertura: Joven 0,65, Adulto 1,00, Mayor 1,10
   Factor carga: ON 1,00, OFF 0,85
   Kc = Kc_base * Factor_cobertura * Factor_carga
   Validar: Kc final entre 0,45 y 1,10. Si fuera, limitar y mostrar aviso.

2. **ETc:**
   ETc_diaria = ETo_diaria * Kc
   ETc_anual = ETo_anual * Kc

3. **Necesidad neta:**
   Lluvia efectiva = Lluvia_anual * 0,70 (solo 70% es útil)
   Necesidad_neta = max(0, ETc_anual - Lluvia_efectiva)

4. **Necesidad bruta:**
   Eficiencia goteo = 0,90
   Necesidad_bruta = Necesidad_neta / 0,90

5. **Agua aplicada real:**
   Caudal por árbol (l/h) = goteros_por_arbol * caudal_gotero
   Caudal por ha (m³/h) = Caudal_por_arbol * árboles_por_ha (defecto 400 árboles/ha para marco 5x5, editable) / 1000
   Agua_aplicada = Caudal_por_ha * horas_semana * 30 semanas riego (aprox. temporada) 
   Validar: si Agua_aplicada > 10.000, mostrar aviso "Revisa horas o caudal, parece alto".

6. **Déficit:**
   Deficit = Necesidad_bruta - min(Dotacion, Agua_aplicada)
   Si Deficit <0, Deficit =0 y mostrar "Tienes agua suficiente, tu problema no es cantidad, es reparto".

7. **Producción en riesgo:**
   Producción base = kg/ha introducido
   % pérdida estimada: Si Déficit / Necesidad_bruta = 0% -> 0% pérdida. 10% déficit -> 6% pérdida. 30% déficit -> 18% pérdida. 50% déficit -> 30% pérdida. Fórmula lineal simplificada: %_perdida = min(0,35, (Deficit/Necesidad_bruta)*0,6)
   Kg_perdidos = Producción_base * %_perdida
   €_en_riesgo = Kg_perdidos * Precio_kg

8. **Ahorro con sensores:**
   Ahorro_percolación = Agua_aplicada * 0,18 (rango 12-25%, mostrar rango 12%-25%)
   Ahorro_€_agua = Ahorro_percolación * Coste_agua (€/m³, defecto 0,35)
   Producción_recuperada = Kg_perdidos * 0,40 (se recupera 40% de lo perdido al medir)
   Ahorro_total = Ahorro_€_agua + Producción_recuperada * Precio_kg
   Mostrar rango: Ahorro_total * 0,8 a * 1,2

9. **Payback:**
   Coste_kit = 850 €/ha (editable)
   Payback_meses = Coste_kit / (Ahorro_total / 12)
   Si Payback <=12 -> Verde, 12-24 -> Amarillo, >24 -> Rojo.

**Ejemplo de validación obligatorio (debe pasar el test):**
- Entrada: Vélez-Málaga, 3 ha, Adulto, ON, Dotación 4.000, Horas 12, Goteros 4, Caudal 2,2, Producción 10.000 kg/ha, Precio 2,50 €/kg
- Esperado: Necesidad_bruta aprox 5.800-5.900 m³/ha, Déficit aprox 1.800-1.900, € en riesgo aprox 1.000-1.200 €/ha, Payback 8-14 meses, Semáforo Verde. Si el código da un valor fuera de ese rango, está mal.

## 7. VALIDACIÓN DE INPUTS Y ERRORES

- Hectáreas: 0,1 - 50. Si <0,1 o >50, mensaje: "Pon entre 0,1 y 50 ha. Si tienes más, calcula por sector."
- Dotación: 0 - 8.000. Si 0, mensaje: "Si no sabes tu dotación, pon 4.000 y lo corregimos en la revisión."
- Horas: 0 - 40. Si 0, mensaje: "Si no riegas en verano, pon 0 y te diremos qué pasa."
- Teléfono: 9 dígitos, permitir +34, espacios. Si no válido: "Pon tu móvil de 9 números para escribirte por WhatsApp."
- Nunca bloquear el cálculo por un campo vacío: usar defecto y marcarlo como "Supuesto" en amarillo.
- Todos los inputs deben tener min, max, step y validación en frontend + mostrar error debajo del campo, no con alert.

## 8. FASES DE DESARROLLO Y VALIDACIÓN

### FASE 0 - Preparación (1 día)
- **Tareas:** Confirmar textos, colores, tabla ETo por municipio, coste kit, número WhatsApp de TecRural, dominio.
- **Entregable:** Documento con textos finales y datos base.
- **Validación:** Revisar con 1 técnico que la tabla ETo y Kc son razonables. Si el técnico dice "esto está mal", corregir antes de programar. GO/NO-GO: Técnico aprueba fórmulas.

### FASE 1 - Calculadora MVP (2-3 días)
- **Tareas:** Landing + Calculadora 3 pasos + Resultado con 3 números + gráfico barras. Sin lead, sin PDF.
- **Entregable:** App desplegada en URL de prueba, funcional en móvil.
- **Validación:**
  - Test 1: Con el ejemplo Vélez-Málaga, el resultado debe estar en el rango esperado (ver Sección 6). Si no, corregir fórmula.
  - Test 2: Un agricultor de 60 años sin ayuda debe llegar al resultado en <2 min y entender los 3 números. Grabar tiempo y dudas. Si tarda >3 min, simplificar.
  - Test 3: Carga <2s en móvil 4G. Si >2s, optimizar imágenes.
  - GO/NO-GO: Pasa los 3 tests. Si no, no pasar a Fase 2.

### FASE 2 - Lead + WhatsApp + PDF (1-2 días)
- **Tareas:** Formulario lead en resultado, enlace WhatsApp pre-rellenado con resumen del cálculo, PDF de 1 página imprimible, guardado en localStorage.
- **Entregable:** Flujo completo: calcular -> ver resultado -> enviar lead -> recibir WhatsApp.
- **Validación:**
  - Test 1: Enviar un lead de prueba y comprobar que llega el WhatsApp con resumen correcto (municipio, ha, dotación, € en riesgo).
  - Test 2: Descargar PDF y comprobar que se lee bien en móvil y en papel, con supuestos visibles.
  - Test 3: Sin teléfono no se puede enviar, pero sí se puede ver resultado. El cálculo nunca se bloquea por falta de lead.
  - GO/NO-GO: 1 lead de prueba llega correctamente + PDF legible.

### FASE 3 - Panel técnico y supuestos editables (1 día)
- **Tareas:** Vista /tecnico con todos los supuestos editables, enlace compartible con supuestos.
- **Validación:** Un técnico cambia Kc de 0,85 a 0,75 y el resultado cambia de forma coherente. Si no cambia, hay bug. El agricultor puede volver a valores por defecto con un botón "Restablecer".

### FASE 4 - Prueba con 5 agricultores reales (3-5 días, sin programar)
- **Tareas:** Mostrar app a 5 agricultores de los 3 municipios, con sus datos reales. Recoger: ¿entendió el resultado? ¿le pareció útil? ¿enviaría el lead? ¿qué le sobra?
- **Validación (H5):** Si 3 de 5 entienden el resultado sin ayuda y 2 de 5 envían lead o piden revisión, es GO. Si menos, volver a Fase 1 y simplificar, no añadir funciones.
- **Métricas a medir:** Tiempo hasta resultado, % que llegan a resultado, % que hacen clic en WhatsApp, dudas más repetidas.

### FASE 5 - Lanzamiento y mejora (continuo)
- **Tareas:** Publicar, medir, corregir textos según dudas reales. No añadir nuevas funciones hasta tener 30 leads.
- **Validación:** 30 leads en 60 días con coste <100 € (orgánico + WhatsApp + grupos). Si no se llega, revisar mensaje, no la tecnología.

## 9. CHECKLIST FINAL PARA EL AGENTE DE PROGRAMACIÓN

Antes de decir "listo", debe comprobar y demostrar:
- [ ] Funciona en móvil 360px sin scroll horizontal.
- [ ] Se puede calcular sin registro y en <2 min.
- [ ] Los 3 números grandes son legibles a 1 metro.
- [ ] El ejemplo Vélez-Málaga da el resultado esperado.
- [ ] El PDF de 1 página se genera y se lee bien.
- [ ] El lead llega por WhatsApp con resumen correcto.
- [ ] Todos los supuestos son visibles y corregibles.
- [ ] La landing dice claramente la diferencia con IRRIGATE.
- [ ] No hay texto con jerga sin explicar (Kc, ETo, ETc deben ir con explicación o no aparecer).
- [ ] Carga <2s, sin errores en consola.

## 10. PROMPT LISTO PARA PEGAR AL AGENTE DE PROGRAMACIÓN

> "Programa una app web móvil-first para TecRural: calculadora de riego para aguacate Hass en Almuñécar, Motril y Vélez-Málaga. Objetivo: en <2 min, sin registro, con 7 datos, el agricultor ve cuánto dinero pierde por regar así y si le compensa medir. Diseño moderno, llamativo, con verde aguacate #1A7A3A, amarillo lima para destacar €, tipografía grande (mínimo 18px), botones de 56px, 3 pasos (Tu finca, Tu agua, Tu resultado). Lógica de cálculo según Sección 6 de este pliego, con validación de inputs y rangos. Resultado con semáforo verde/amarillo/rojo, 3 números gigantes (€/ha en riesgo, necesidad, payback), gráfico de barras simple, 3 escenarios y supuestos visibles. Después del resultado, formulario lead (nombre + WhatsApp) que genera enlace WhatsApp pre-rellenado y PDF de 1 página. No pedir registro antes del resultado. No usar jerga sin explicar. Entregar en fases con validación de cada fase. Si una fórmula da un valor fuera del ejemplo de Vélez-Málaga, corregir antes de continuar."

---

**Notas para el programador:** Si hay duda entre precisión y usabilidad, elegir usabilidad. Si hay duda entre añadir una función y simplificar, simplificar. El agricultor no necesita más datos, necesita una decisión clara.
