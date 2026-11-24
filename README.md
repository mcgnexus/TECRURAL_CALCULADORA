# TecRural · Calculadora de riego

App web móvil-first: en menos de 2 minutos y sin registro, el agricultor sabe cuánto dinero tiene en riesgo por regar a ojo y si le compensa medir. Cultivos: aguacate Hass, mango y chirimoya.

## Comandos

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm test          # 34 pruebas (fórmulas + renderizado de páginas)
npm run build     # versión de producción en dist/
npm run preview   # sirve dist/ para comprobarla
```

## Páginas

| Ruta | Qué es |
| --- | --- |
| `/` | Portada: titular, comparativa con IRRIGATE, 3 pasos, ejemplo calculado en vivo |
| `/calculadora` | 2 pasos: Tu finca, Tu agua |
| `/resultado` | Semáforo, 3 números grandes, gráfico, 3 escenarios, supuestos, formulario de contacto, PDF |
| `/tecnico` | Todos los supuestos editables y enlace compartible |

El panel técnico es deliberadamente discreto (el pliego lo define como "vista oculta"): se accede por `/tecnico` o con el enlace del pie; la cabecera no lo anuncia. Sus campos tienen rangos recomendados y avisan en lenguaje llano si un valor se sale de ellos, sin bloquear nunca el cálculo.

## Semáforo (calibración, pendiente de validar con el técnico)

- **Verde** ("Te compensa medir"): payback ≤ 12 meses **y** déficit ≤ 50 % de la necesidad de la finca.
- **Amarillo** ("Te compensa si compartes o ajustas"): payback entre 12 y 24 meses.
- **Rojo**: payback > 24 meses **o déficit > 50 %**. Es la regla completa del pliego ("payback > 24 meses o déficit muy alto"): si a la finca le falta más de la mitad del agua que necesita, el problema es estructural (dotación o reparto) y medir por sí solo no lo arregla. El umbral del 50 % es editable en `/tecnico` (`deficitCritico`).
- La producción que los sensores recuperan (40 % de lo perdida, fórmula 8 del pliego) está **acotada** por lo que arreglaría el mejor calendario posible con la misma agua (aplicar hasta la dotación, sin pasar de la necesidad). Así el kit solo "se paga" cuando el problema es de reparto u horas, no cuando el déficit viene de la dotación, que medir no soluciona. Sin esta acotación el semáforo daba verde en el 100 % de los casos razonables.

## Configurar antes de publicar

Copia `.env.example` a `.env`:

- `VITE_WHATSAPP_NUMBER`: número de TecRural con prefijo de país. Sin configurar se usa `34600000000` y el enlace directo a WhatsApp queda desactivado (se avisa al usuario).
- `VITE_LEAD_ENDPOINT` (opcional): URL que recibe cada contacto por POST. Sin ella, los contactos solo se guardan en el navegador.
- `VITE_ANALYTICS_ENDPOINT` (opcional): URL que recibe los eventos `inicio_calculadora`, `resultado_visto`, `clic_whatsapp`, `lead_enviado`, `clic_pdf`.

Despliegue: Vercel o Netlify, sin configuración adicional (`vercel.json` y `public/_redirects` ya están). Cuando conozcas el dominio, pon la URL absoluta de la imagen en `og:image` de `index.html` (p. ej. `https://tu-dominio/og.png`): WhatsApp exige URL absoluta para mostrar la vista previa.

## Datos que revisar con un técnico

- `src/data/crops.js`: aguacate usa los valores del pliego. **Mango y chirimoya usan valores de referencia** (Kc base, árboles/ha, producción, precio), marcados como `origen: "referencia"` y señalados en pantalla y en el PDF.
- `src/data/municipalities.js`: ETo y lluvia por municipio (tabla del pliego).
- `src/lib/calc.js`: resto de supuestos por defecto, incluido el umbral de déficit crítico (`deficitCritico`, 50 %) y la acotación de la recuperación con sensores.

## Pendiente respecto al pliego

- El ejemplo de validación de la Sección 6 no cuadra con las fórmulas de esa misma sección: con las fórmulas tal cual, el caso Vélez-Málaga da una necesidad de 9.011 m³/ha (no 5.800-5.900) y, con dotación de 4.000, un déficit del 86 % que el propio pliego clasifica como "muy alto" (semáforo rojo: el problema es la dotación, no los goteros). El test `tests/calc.test.js` fija los valores que realmente producen las fórmulas; la decisión de recalibrar la agronomía (Kc estacional, tabla de pérdida) es del técnico en Fase 0.
- La portada no lleva foto real de finca: usa un fondo degradado.
- No se ha probado en un móvil real ni en 4G, ni impreso el PDF en papel.