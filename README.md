# Draconómicon

Juego de estrategia por turnos con dragones de la literatura y la mitología universal. Bestiario iluminado, combate táctico y un sistema elemental que premia la planificación.

## Jugabilidad

- **Bestiario:** Explora 10 dragones, cada uno con origen, elemento, habilidad especial y pasiva única.
- **Formar equipo:** Elige 3 dragones de tu bando.
- **Batalla:** Enfréntate a un equipo rival controlado por la IA. Ataca, usa habilidades o defiende. El orden de turno depende de la velocidad.

### Sistema elemental

Ciclo: **Fuego > Tierra > Aire > Agua > Fuego**
- Fuerza: ×1.4 de daño
- Debilidad: ×0.7 de daño

**Caos:** No sigue el ciclo. Inflige y recibe ×1.15 de daño contra todos los elementos.

## Dragones

| Dragón | Elemento | Origen |
|--------|----------|--------|
| Smaug | Fuego | *El Hobbit*, J. R. R. Tolkien |
| Y Ddraig Goch | Fuego | *Mabinogion*, mitología gales |
| Yamata no Orochi | Agua | *Kojiki*, Japón |
| Shenlong | Agua | Mitología china |
| Fafnir | Tierra | *Saga Völsunga*, nórdico |
| Ladón | Tierra | Mitología griega |
| Quetzalcóatl | Aire | Mitología mesoamericana |
| Vritra | Aire | *Rig Veda*, hindú |
| Tiamat | Caos | *Enuma Elish*, mesopotámica |
| Nidhogg | Caos | *Edda poética*, nórdica |

## Estructura del proyecto

```
├── index.html      # Markup de la aplicación (3 vistas)
├── style.css       # Estilos — tema grimorio/iluminado, responsive
├── game.js         # Motor de combate, renderizado, IA
├── dragons.json    # Datos de dragones (stats, habilidades, pasivas)
└── README.md
```

## Cómo ejecutar

Abre `index.html` en un navegador moderno. No se necesita servidor.

> **Nota:** Si abres el archivo con doble clic (protocolo `file://`), algunos navegadores bloquean `fetch`. El juego carga datos de respaldo incorporados automáticamente.

Para evitarlo, usa un servidor local:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Y abre `http://localhost:8000`.

## Tecnologías

- HTML5, CSS3, JavaScript (ES2020+)
- Fonts: Cinzel + Spectral (Google Fonts)
- Sin dependencias externas ni frameworks

## Licencia

Proyecto educativo / personal. Consulta al autor para uso comercial.
