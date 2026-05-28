# Cinema Premium: Immersió en la Penombra

## Direcció i Sensació
- **Concept**: Immersió en una sala de cinema de luxe.
- **Feel**: Penombra, vellut, llum de projector, elegància clàssica.

## Tokens: El Món del Cinema
```css
:root {
  /* Fons: L'obscuritat de la sala */
  --canvas: #0a0a0b;
  --surface-low: #111113;
  --surface: #16161a;
  --surface-high: #1e1e24;

  /* Accent: El Roig Vellut */
  --brand: #9b0000;
  --brand-muted: #4a0000;
  --brand-glow: rgba(155, 0, 0, 0.4);

  /* Text: Llum de Projector */
  --ink-primary: #fffdf0; /* Blanc càlid */
  --ink-secondary: #a1a1aa;
  --ink-tertiary: #71717a;
  --ink-muted: #3f3f46;

  /* Semàntic */
  --success: #2e7d32;
  --warning: #f57c00;
  --error: #c62828;
  --info: #1565c0;

  /* Separació */
  --border-soft: rgba(255, 255, 255, 0.05);
  --border-medium: rgba(255, 255, 255, 0.1);
}
```

## Estratègia de Fondària
- **Borders + Layered Shadows**: Ús de vores gairebé invisibles i ombres de gran radi per simular focus de llum i superfícies tàctils.

## Tipografia
- **Títols**: Serif elegant (e.g., Cormorant Garamond o Playfair Display) per evocar el cinema clàssic.
- **Cos**: Sans-serif d'alta llegibilitat (Inter) per a dades i controls.

## Signatura: Projecció Anamòrfica
- El mapa de seients utilitza `perspective` i `transform` per crear una corba que recordi les pantalles de cinema IMAX/Cinerama.
