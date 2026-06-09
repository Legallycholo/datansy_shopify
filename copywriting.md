# Plan de implementación: Copy Datansy (Chile)

> Documento de trabajo para reescribir el copy del homepage y elementos globales de datansy.com.  
> **Fase actual:** Planificación. No implementar código hasta completar la Fase 1 (redacción aprobada).

---

## Objetivo

Reescribir el copy del sitio en español chileno (tú, no vos), tono premium y directo, sin m-dashes, manteniendo la misma estructura de secciones y jerarquía de contenido. Cada claim debe sentirse específico y creíble.

---

## Alcance

### Incluido en este proyecto

| Sección | Elementos a reescribir |
|---------|------------------------|
| Announcement Bar | 3 líneas rotativas |
| Hero | Headline, subline, stat badges, trust row |
| Coverage | Header de sección |
| Sourcing | Header, sub-label, descripciones de hubs |
| Category | Header, CTA |
| VIP Pre-Order | Header, 3 cards (título + descripción), CTA |
| FAQ | Header, 5 preguntas (mismo orden) |
| Email Capture | Header, body, CTA |
| Reviews | Header, sub, 3 quotes |
| Footer | Tagline, newsletter line, newsletter CTA |

### Fuera de alcance (este sprint)

- Respuestas del FAQ (solo preguntas según brief)
- Copy de productos individuales (formato headline + párrafo + 5 bullets: fase separada)
- Menú, header, sliders, promo banner, blog strip
- Páginas internas (`/pages/cotizacion`, `/pages/rastreo`, políticas)
- Traducciones EN u otros idiomas

---

## Mapa de archivos en el tema

El copy vive en **dos capas**. Hay que actualizar ambas para consistencia.

### Capa 1: Contenido activo (Theme Editor / JSON)

Estos archivos son los que Shopify usa en producción hoy.

| Sección | Archivo | Claves / bloques |
|---------|---------|------------------|
| Announcement Bar | `sections/header-group.json` | `announcement_bar.blocks.msg1–msg3.settings.text` |
| Hero | `templates/index.json` | `gsm_hero.settings` + `blocks.slogan_1` (headline en 3 líneas) |
| Coverage | `templates/index.json` | `gsm_regions.settings.heading` |
| Sourcing | `templates/index.json` | `gsm_hubs.settings.heading`, `stat_badge` + `blocks.h1–h5.settings.subtitle` |
| Category | `templates/index.json` | `gsm_categories.settings.heading`, `catalog_label` |
| VIP Pre-Order | `templates/index.json` | `gsm_presales.settings.heading`, `cta_label` + `blocks.ben1–ben3` |
| FAQ | `templates/index.json` | `gsm_faq.settings.heading` + `blocks.f1–f5.settings.question` |
| Email Capture | `templates/index.json` | `gsm_coupon.settings.heading`, `subtext`, `submit_label` |
| Reviews | `templates/index.json` | `gsm_testimonials.settings` + `blocks.t1–t3.settings.quote` |
| Footer tagline | Theme Editor → Footer → Misión | `mission_text` (no está en `footer-group.json`; configurar vía editor o añadir al JSON) |
| Footer newsletter | Theme Editor → Footer → Newsletter | `newsletter_heading`, `newsletter_subtext` |
| Footer CTA | `locales/es.default.json` | `footer.newsletter_submit` |

### Capa 2: Defaults del schema (Liquid)

Valores por defecto cuando se resetea una sección o se instala el tema en otra tienda.

| Archivo | Campos relevantes |
|---------|-------------------|
| `sections/dty-announcement-bar.liquid` | Presets de los 3 mensajes |
| `sections/dty-hero.liquid` | `badge`, `subtext`, `fallback_line_*`, `trust_text`, blocks `slogan_set` |
| `sections/dty-regions.liquid` | `heading` default |
| `sections/dty-sourcing-hubs.liquid` | `heading`, `stat_badge`, hub `subtitle` defaults |
| `sections/dty-category-grid.liquid` | `heading`, `catalog_label` |
| `sections/dty-presales.liquid` | `heading`, `cta_label`, benefit blocks |
| `sections/dty-faq.liquid` | `heading`, FAQ question defaults en preset |
| `sections/dty-coupon-cta.liquid` | `heading`, `subtext`, `submit_label` |
| `sections/dty-testimonials.liquid` | `heading`, `subheading`, review presets |
| `sections/footer.liquid` | `mission_text`, `newsletter_heading`, `newsletter_subtext` |

### Capa 3: Código hardcodeado (requiere edición Liquid)

Los stat badges del hero **no son editables** desde el Theme Editor hoy. Están fijos en `sections/dty-hero.liquid` (líneas ~61–76):

```
5.000+ / Clientes
6 / Países
100% / Garantía Oficial
```

**Decisión pendiente (Fase 3):**

- **Opción A (mínima):** Editar el HTML/Liquid directamente con el nuevo copy.
- **Opción B (recomendada):** Exponer los 3 stats como settings en el schema para futuras ediciones sin tocar código.

El trust row (`+5,000 clientes felices`) sí es editable vía `trust_text` en `index.json`.

---

## Reglas de copy (QA obligatorio)

Antes de marcar cualquier ítem como listo, verificar:

- [ ] Español chileno, forma **tú** (no vos)
- [ ] **Cero m-dashes** (`—`). Usar comas, puntos o dos puntos
- [ ] Misma estructura: no agregar ni quitar secciones ni elementos
- [ ] Announcement bar: cada línea **≤ 70 caracteres**, emojis conservados, lógica de oferta intacta
- [ ] Sin superlativos vacíos; claims concretos y creíbles
- [ ] CTAs del hero sin cambiar: "Ver Catálogo" / "Ofertas Flash"
- [ ] Nombres de países y hubs sin cambiar
- [ ] FAQ: 5 preguntas, mismo orden, solo reescritura de la pregunta
- [ ] Reviews: conservar nombres (Carlos M., Valentina R., Diego P.) y productos
- [ ] Email capture: mantener oferta **10%** y código **BIENVENIDO10**
- [ ] Capitalización consistente con el resto del sitio

---

## Fases de trabajo

### Fase 1: Redacción y aprobación

1. Redactar copy final por sección (formato del brief: Headline, Subline, CTA, etc.)
2. Revisión interna contra reglas de copy
3. Aprobación del cliente / stakeholder antes de tocar archivos

**Entregable:** Copy aprobado pegado en la sección "Copy aprobado" al final de este documento (o en doc aparte vinculado).

---

### Fase 2: Implementación en tema

Orden sugerido (de arriba hacia abajo en la página):

1. `sections/header-group.json` → Announcement Bar
2. `templates/index.json` → Hero (slogan_1, subtext, trust_text)
3. `sections/dty-hero.liquid` → Stat badges (+ opcional schema)
4. `templates/index.json` → Regions, Hubs, Categories, Presales, FAQ, Coupon, Testimonials
5. `sections/footer.liquid` + `footer-group.json` / Theme Editor → Footer
6. `locales/es.default.json` → `footer.newsletter_submit`
7. Actualizar **defaults** en todos los `.liquid` listados en Capa 2

---

### Fase 3: QA visual y funcional

1. `shopify theme dev` → revisar homepage en local
2. Verificar rotación del announcement bar (3 mensajes, sin truncamiento en mobile)
3. Verificar animación del hero (headline en 3 líneas rota correctamente)
4. Revisar longitud de textos en mobile (hero, cards VIP, FAQ)
5. Confirmar que no quedó ningún m-dash en UI
6. Revisar footer newsletter (submit label desde locale)
7. `shopify theme check` sin errores nuevos

---

### Fase 4: Despliegue

1. Push del tema a tienda de desarrollo
2. Revisión en Theme Editor (confirmar que JSON no fue sobrescrito por editor)
3. Publicar o merge según flujo del equipo

---

## Checklist maestro

Usar esta lista para no saltar pasos. Marcar `[x]` al completar.

### A. Preparación

- [ ] Leer brief de marca y reglas de copy
- [ ] Confirmar alcance (solo preguntas FAQ, no respuestas)
- [ ] Confirmar decisión hero stats: Opción A (hardcode) u Opción B (schema)
- [ ] Verificar que descuento `BIENVENIDO10` existe en Shopify Admin

### B. Redacción por sección

- [ ] **Announcement Bar** — Línea 1 (envío gratis $50.000)
- [ ] **Announcement Bar** — Línea 2 (garantía oficial, sin m-dash)
- [ ] **Announcement Bar** — Línea 3 (BIENVENIDO10, 10% off)
- [ ] **Hero** — Headline (3 líneas en slogan_1)
- [ ] **Hero** — Subline
- [ ] **Hero** — Trust row (`trust_text`)
- [ ] **Hero** — Stat badge 1 (número + label)
- [ ] **Hero** — Stat badge 2 (número + label)
- [ ] **Hero** — Stat badge 3 (número + label)
- [ ] **Coverage** — Section header
- [ ] **Sourcing** — Section header
- [ ] **Sourcing** — Sub-label (stat badge)
- [ ] **Sourcing** — Hub: Dubai descripción
- [ ] **Sourcing** — Hub: Singapur descripción
- [ ] **Sourcing** — Hub: Hong Kong descripción
- [ ] **Sourcing** — Hub: Estados Unidos descripción
- [ ] **Sourcing** — Hub: China (Shenzhen) descripción
- [ ] **Category** — Section header
- [ ] **Category** — CTA
- [ ] **VIP Pre-Order** — Section header
- [ ] **VIP Pre-Order** — Card 1 título + descripción
- [ ] **VIP Pre-Order** — Card 2 título + descripción
- [ ] **VIP Pre-Order** — Card 3 título + descripción
- [ ] **VIP Pre-Order** — CTA
- [ ] **FAQ** — Section header
- [ ] **FAQ** — Pregunta 1 (garantía)
- [ ] **FAQ** — Pregunta 2 (medios de pago)
- [ ] **FAQ** — Pregunta 3 (envíos a regiones)
- [ ] **FAQ** — Pregunta 4 (tienda física)
- [ ] **FAQ** — Pregunta 5 (aduanazo)
- [ ] **Email Capture** — Header
- [ ] **Email Capture** — Body (10% off)
- [ ] **Email Capture** — CTA button
- [ ] **Reviews** — Section header
- [ ] **Reviews** — Sub-line
- [ ] **Reviews** — Quote Carlos M. / Lonmao B8
- [ ] **Reviews** — Quote Valentina R. / Smartwatch Vital Pro Max
- [ ] **Reviews** — Quote Diego P. / Datansy Tech
- [ ] **Footer** — Tagline (misión)
- [ ] **Footer** — Newsletter line
- [ ] **Footer** — Newsletter CTA

### C. QA de copy (pre-implementación)

- [ ] Revisión ortográfica y gramatical (es-CL)
- [ ] Buscar m-dashes en todo el copy nuevo (`—`)
- [ ] Contar caracteres announcement bar (≤ 70 c/u)
- [ ] Validar tono premium, directo, sin hype vacío
- [ ] Aprobación final del copy

### D. Implementación técnica

- [ ] Actualizar `sections/header-group.json`
- [ ] Actualizar `templates/index.json` (todas las secciones del scope)
- [ ] Actualizar stat badges en `sections/dty-hero.liquid` (y schema si Opción B)
- [ ] Actualizar defaults en `sections/dty-announcement-bar.liquid`
- [ ] Actualizar defaults en `sections/dty-hero.liquid`
- [ ] Actualizar defaults en `sections/dty-regions.liquid`
- [ ] Actualizar defaults en `sections/dty-sourcing-hubs.liquid`
- [ ] Actualizar defaults en `sections/dty-category-grid.liquid`
- [ ] Actualizar defaults en `sections/dty-presales.liquid`
- [ ] Actualizar defaults en `sections/dty-faq.liquid`
- [ ] Actualizar defaults en `sections/dty-coupon-cta.liquid`
- [ ] Actualizar defaults en `sections/dty-testimonials.liquid`
- [ ] Actualizar `sections/footer.liquid` (misión + newsletter defaults)
- [ ] Actualizar `locales/es.default.json` (`footer.newsletter_submit`)
- [ ] Sincronizar `footer-group.json` si misión/newsletter se añaden ahí

### E. QA post-implementación

- [ ] Homepage carga sin errores Liquid
- [ ] Announcement bar: 3 mensajes visibles y legibles en desktop y mobile
- [ ] Hero: headline, subline, CTAs, trust row y stats correctos
- [ ] Coverage, Sourcing, Category, VIP, FAQ, Email, Reviews: textos correctos
- [ ] Footer: tagline y newsletter con copy nuevo
- [ ] Grep en repo: no quedan strings viejos del copy reemplazado
- [ ] Grep en repo: no hay m-dashes en strings nuevos
- [ ] `shopify theme check` pasa

### F. Cierre

- [ ] Deploy a tienda dev / preview URL compartida
- [ ] Sign-off del stakeholder
- [ ] Commit con mensaje descriptivo (solo si el usuario lo solicita)

---

## Copy actual (referencia)

Valores en producción hoy, para comparar al reescribir.

### Announcement Bar
1. 🚀 Envío gratis a todo Chile en compras sobre $50.000
2. ✅ Garantía oficial en todos los productos — Respaldo Datansy
3. 🎁 Usa el código BIENVENIDO10 y obtén 10% off en tu primera compra

### Hero
- **Headline:** Tecnología Premium / Al Precio Que / Debería Ser
- **Subline:** Envíos Gratis a todo Chile. Garantía Datansy Oficial
- **CTAs:** Ver Catálogo / Ofertas Flash
- **Trust:** +5,000 clientes felices
- **Stats:** 5.000+ Clientes / 6 Países / 100% Garantía Oficial

### Coverage
- **Header:** Operamos en 6 Países

### Sourcing
- **Header:** Los Mejores Precios Del Mundo
- **Sub-label:** 5+ Hubs de Abastecimiento
- Dubai / Emiratos Árabes Unidos
- Singapur / Sudeste Asiático
- Hong Kong / Puerta de entrada a China
- Estados Unidos / Miami & Los Angeles
- China (Shenzhen) / Manufactura directa

### Category
- **Header:** Explora por Categoría
- **CTA:** Ver catálogo completo

### VIP Pre-Order
- **Header:** ¿Buscas un producto que aún no tenemos?
- Precio Especial / Accede al mejor precio de preventa.
- Prioridad Total / Sé de los primeros en recibirlo.
- Stock Asegurado / Reserva garantizada desde el día uno.
- **CTA:** Solicitar cotización

### FAQ
- **Header:** Transparencia Total
1. ¿Los productos tienen garantía?
2. ¿Cuáles son los medios de pago?
3. ¿Hacen envíos a regiones?
4. ¿Tienen tienda física?
5. ¿Debo preocuparme por el "Aduanazo"?

### Email Capture
- **Header:** Tecnología a tu Alcance
- **Body:** Únete a nuestra comunidad y obtén 10% off en tu primera compra.
- **CTA:** Unirme

### Reviews
- **Header:** Experiencia Datansy
- **Sub:** Lo que dicen nuestros clientes en Chile.
- Carlos M. / Lonmao B8 Auriculares / "Llegó en perfecto estado. Excelente relación precio-calidad."
- Valentina R. / Smartwatch Vital Pro Max / "El mejor precio que encontré en Chile. Envío rápido a Santiago."
- Diego P. / Datansy Tech / "Atención excelente por WhatsApp. Compra 100% recomendada."

### Footer
- **Tagline:** Conectamos a Chile con la tecnología premium del mundo. Somos especialistas en electrónica de alta calidad con garantía oficial, los mejores precios y envío a todo el país.
- **Newsletter:** Únete a la comunidad Datansy. Recibe ofertas exclusivas, lanzamientos y novedades tech directo en tu correo.
- **CTA:** Suscribirme

---

## Copy aprobado

_Pegar aquí el copy final una vez aprobado en Fase 1, sección por sección, antes de implementar._

```
(pendiente)
```

---

## Notas técnicas

1. **`templates/index.json` y `header-group.json`** están marcados como auto-generados por Shopify. Los cambios vía git son válidos, pero ediciones posteriores en Theme Editor pueden sobrescribirlos. Documentar qué se cambió para re-aplicar si hace falta.

2. **Footer misión/newsletter:** `footer-group.json` no incluye hoy `mission_text` ni `newsletter_*`. Esos valores pueden venir de defaults en `footer.liquid` o de configuración previa en Admin. Al implementar, verificar en Theme Editor qué valores están activos.

3. **Hero rota 3 slogan sets** (`slogan_1`, `slogan_2`, `slogan_3`). El brief solo pide reescribir el headline principal. Decidir si slogan_2 y slogan_3 también se actualizan para coherencia de marca o se dejan como están.

4. **Product copy** (headline + párrafo + 5 bullets por producto) es un trabajo aparte sobre plantillas de producto y descripciones en Admin.

---

## Próximo paso

Completar **Fase 1**: redactar el copy nuevo por sección y obtener aprobación. Luego ejecutar checklist secciones B → C → D → E → F.
