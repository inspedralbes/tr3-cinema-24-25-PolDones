# Guia de Funcionalitat

Aquest document descriu com interactuar amb l'aplicació Cinema des de la perspectiva de l'usuari final i de l'administrador.

## Experiència de l'Usuari (Client)

El flux de compra ha estat optimitzat per ser intuïtiu i ràpid:

1.  **Inici**: L'usuari visualitza la llista de propers esdeveniments amb un scroll horitzontal fluid en mòbil.
2.  **Selecció de Seients**:
    *   S'obre el mapa interactiu de la sala.
    *   Els colors indiquen l'estat: Vermell (Venut), Taronja (Reservat per algú altre), Blanc (Disponible), Vermell Brillant/Glow (La teva selecció).
    *   Hi ha un temporitzador de 5 minuts per completar la compra abans que els seients s'alliberin automàticament.
3.  **Pagament**:
    *   L'usuari introdueix el seu nom i email.
    *   Es genera un "Ticket Digital" visual.
4.  **Consulta d'Entrades**: A la secció "Les meves entrades", es poden recuperar els tickets introduint l'email.

## Panell d'Administració

L'accés a `/admin` permet una gestió total del cinema:

### Estadístiques Generals
Monitorització en temps real de:
- **Recaptació Total**: Consolidat de totes les vendes.
- **Entrades Venudes**: Comptador global.
- **Ocupació Mitjana**: Percentatge d'èxit de les sales.
- **Usuaris Online**: Persones navegant per l'app en aquest moment.

### Gestió d'Esdeveniments
Cada pel·lícula té les seves estadístiques individuals i accions:
- **Monitorització**: Estat detallat de la sala específica.
- **Reiniciar Seients (Reset)**: Botó crític que permet buidar la sala, esborrar les compres i tornar tots els seients a "disponibles" per a nous testos o sessions.

## Optimització Mòbil

Totes les pantalles s'adapten automàticament:
- Els mapes de seients permeten scroll lateral si la sala és molt gran.
- Els formularis de pagament s'apilen verticalment per facilitar l'escriptura.
- El disseny manté la sensació Premium amb botons grans i fàcils de polsar.
