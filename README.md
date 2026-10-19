# Pokedex

Challenge técnico de React: [PokeAPI](https://pokeapi.co).

## Cómo correrlo

Requisitos: Node 20+ y npm.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build localmente
npm run lint     # oxlint (está en 0 warnings)
```

## Stack

| Librería | Versión | Para qué |
|----------|---------|----------|
| React | 19 | UI |
| Vite | 8 | dev server + build |
| Redux Toolkit + RTK Query | 2 | store y cache de la API |
| redux-persist | 6 | persistir favoritos y el cache de la API |
| React Router | 7 | rutas + lazy loading |
| styled-components | 6 | estilos con design tokens |
| Formik + Yup | 2 / 1 | formulario de comparación + validación |
| recharts | 3 | gráfico de barras del comparador |
| react-hot-toast | 2 | notificaciones |

El desafío pide React 18 / Vite 5 / RTK 1.9 / Router 6: usé las versiones actuales
de cada una. No hay cambios de API que afecten lo pedido.

JavaScript puro, sin TypeScript (como pide el desafío).

## Estructura

```
src/
  app/         store (RTK + persistencia) y hooks del store (useAppDispatch / useAppSelector)
  services/    createApi de RTK Query: endpoints de listado, detalle, tipos y generaciones
  components/  Layout (header/nav), ScrollToTop y primitivas compartidas (ui/)
  features/    una carpeta por pantalla: pokemonList, pokemonDetail, favorites, compare, notFound
  hooks/       useDebounce, useInfiniteScroll, useListParams
  styles/      theme global (colores, radios, sombras, breakpoints)
  utils/       helpers puros de la API (ids, sprites, etiquetas de tipos)
```

## Rutas

| Ruta | Pantalla |
|------|----------|
| `/` | Listado con infinite scroll, buscador y filtros (`?q=&type=&gen=`) |
| `/pokemon/:id` | Detalle (acepta nombre o número, como la API) |
| `/team` | Mi Equipo (máx. 6, drag & drop) |
| `/compare` | Comparador de stats |
| `*` | 404 |

## Decisiones técnicas

**Persistencia del cache y de favoritos (redux-persist).** El desafío pide que los
datos cacheados sobrevivan al refresh, así que el cache de RTK Query se guarda en
`localStorage` bajo `persist:pokemonApi` y los favoritos en `persist:favorites`. Tres
cuidados para que no se rompa:
- **Claves separadas por slice.** Si el cache no entra en la cuota (~5MB), el fallo de
  escritura no toca a favoritos. 
- **Recorte antes de guardar.** El detalle crudo de ~80 pokemon pesa ~6MB (moves,
  sprites de todos los juegos, etc.) y la app no lee nada de eso: un transform de
  redux-persist descarta esos campos y el cache queda en ~80KB. Se verifica en el
  navegador: `localStorage` total < 100KB después de navegar. El mismo transform
  (en `in` y en `out`) descarta entradas que no estén `fulfilled`: una query `pending`
  rehidratada queda muerta — RTK Query la trata como request en vuelo y nunca
  reintenta — y el badge de sincronización se colgaría para siempre.
- **Escrituras agrupadas** (`throttle: 500`) y un `writeFailHandler` que avisa por
  consola si aun así no entra.

`PersistGate` con `loading={null}` espera la rehidratación de ambas claves antes de
renderizar: no se ve el equipo vacío ni la lista en blanco ni un frame. Verificación:
con la PokeAPI bloqueada (devtools → offline request blocking), el refresh muestra el
listado, el detalle ya visitado y el equipo tal cual estaban.

**Adapter de storage a mano.** El import clásico (`redux-persist/lib/storage`) es
CommonJS y con Vite/ESM falla en runtime con `storage.getItem is not a function`.
Además, `setItem` puede tirar con la cuota llena: lo envolvemos en try/catch y
rechazamos la Promise (redux-persist la atrapa); un throw síncrono pasaría por alto
su manejo de errores.

**Reglas de producto en el reducer.** El límite de 6 se valida en `addFavorite`, no
solo en la UI: aunque alguien despache la action a mano, el estado no se rompe. El
botón usa `aria-disabled` (no `disabled`) para poder mostrar un toast explicando el
límite.

**Filtros en la URL como fuente de verdad.** `?q=pikachu&type=fire,water&gen=1`.
La query string se parsea a un objeto de filtros puro (`filterParams.js`, testeable
sin React) y los selects solo muestran lo que todavía no está elegido. Escritura con
`replace: true` para no apilar una entrada de historial por tecla. Al salir de la
pantalla, el último search se recuerda en `sessionStorage` (`utils/homeSearch.js`)
para que "Volver al listado", "Inicio" y el logo no borren la selección.

**Filtrado por tipo/generación en cliente.** La PokeAPI no expone listados filtrados.
Con filtros activos pido el catálogo completo (una sola request para todos los nombres,
cacheada) y armo `Set` de nombres por faceta con `useLazyQuery` (la cantidad elegida
es dinámica, no puedo llamar hooks en un loop). AND entre facetas, OR dentro de cada una.



## Mejoras futuras

- **TypeScript**: los tipos del store y de los responses de la API se agradecen.
- **Virtualización del listado**: con el catálogo completo cargado para filtrar, el
  DOM crece mucho; librerías como `react-window` lo reducirían.
- **Detalle más profundo**: la API de especies (ya declarada en los endpoints) trae
  descripciones, hábitat y cadenas evolutivas.
- **SEO técnico**: el build sirve el mismo HTML para todas las rutas (hoy `<title>`
  estático, sin description ni canonical). Sumaría meta tags por ruta (title,
  description y Open Graph con el arte del pokemon), `sitemap.xml` y `robots.txt`
  generados del catálogo, y JSON-LD (`ItemList` en el home, `Thing` +
  `BreadcrumbList` en el detalle). Los `?type=` de los filtros generan URLs
  duplicadas: un canonical por ruta lo resuelve. Lo que más rinde es **prerenderizar**
  el HTML en build: los crawlers no ejecutan JS.
- **GEO (visibilidad en respuestas de IA)**: los LLMs y las AI Overviews citan HTML
  plano, no el DOM hidratado, así que el prerender anterior es también el
  prerequisito. Para que la respuesta cite *esta* ficha: textos citables en HTML
  (descripción de la API de especies, stats como tabla además del gráfico), un
  `llms.txt` en la raíz que resuma qué expone cada ruta, alt descriptivos en el arte
  y `sameAs` (Wikipedia/Bulbapedia) en el JSON-LD para anclar la entidad.
- **Restaurar el scroll del listado al volver del detalle**: hoy `ScrollToTop` sube
  a la página 1 y `visibleCount` (local de `HomePage`) reinicia en 24 cards. El
  punto clave: **no alcanza con guardar el `scrollY`** — también hay que persistir
  cuántas cards estaban cargadas, o no existe altura a la que volver. Implicaría:
  guardar `{search, scrollY, visibleCount}` en sessionStorage al desmontar el home,
  consumirlo una sola vez al volver, y enseñarle a `ScrollToTop` que salte esa
  ubicación (corre antes que los efectos de `HomePage`, así que el orden natural lo
  favorece).
