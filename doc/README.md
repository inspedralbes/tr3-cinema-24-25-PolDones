# Documentació del Projecte CinemaPremium

Benvingut a la documentació oficial del projecte Cinema. Aquest repositori conté una aplicació completa i d'alt rendiment per a la gestió de reserves de seients de cinema en temps real.

L'objectiu d'aquesta documentació és proporcionar una visió integral tant per a desenvolupadors com per a usuaris finals.

## Índex de Continguts

1.  [**Guia d'Execució**](execucio.md): Instruccions per posar en marxa l'aplicació amb Docker o de forma nativa. **(Lectura recomanada per començar)**.
2.  [**Arquitectura del Sistema**](arquitectura.md): Detalls sobre el stack tecnològic, el disseny de la base de dades, la integració amb la Movies API i la lògica de comunicació en temps real.
3.  [**Guia de Funcionalitat**](funcionalitat.md): Manual d'ús detallat per a l'usuari final (reserves) i per a l'administrador (gestió de sales).

## Visió General del Projecte

CinemaPremium ha estat dissenyat per oferir una experiència fluida i elegant, inspirada en les plataformes de streaming modernes. Les característiques clau inclouen:

- **Sincronització Real-time**: Qualsevol canvi en l'estat d'un seient es reflecteix a l'instant en tots els navegadors oberts gràcies a WebSockets.
- **Integració Dinàmica**: Els esdeveniments es generen automàticament a partir de dades reals de pel·lícules d'una API externa.
- **Disseny Adaptatiu**: Una interfície "Mobile-First" que garanteix una bona experiència en qualsevol dispositiu.
- **Contenidorització**: Totalment preparat per ser desplegat amb Docker, facilitant la portabilitat i el desplegament.

---
*Documentació actualitzada el Març de 2026 per Antigravity.*
