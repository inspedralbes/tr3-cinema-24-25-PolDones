# Guia de Funcionalitat

Aquest document serveix com a manual d'usuari per entendre totes les capacitats de l'aplicació CinemaPremium.

## 1. Experiència de l'Usuari (Venda d'Entrades)

L'aplicació ha estat dissenyada per ser intuïtiva i ràpida, minimitzant els passos per completar una compra.

### Cartellera (Inici)
- L'usuari arriba a una pantalla de benvinguda on es mostren les pel·lícules actuals.
- Cada pel·lícula mostra el seu poster (si està disponible), títol i una breu descripció.
- El disseny és totalment adaptatiu: en dispositius mòbils, la cartellera es converteix en un carrusel horitzontal suau.

### Selecció de Seients
- En clicar "Veure Entrades", s'entra al mapa de la sala.
- **Simulació 3D**: La sala té una perspectiva inclinada que recorda a un cinema real.
- **Codificació de Colors**:
    - **Blanc**: Seient disponible.
    - **Taronja**: Seient reservat per un altre usuari (bloquejat temporalment).
    - **Vermell Clar**: Seient venut (ocupat permanentment).
    - **Vermell Brilliant (Glow)**: La teva selecció actual.
- **Limitacions**: Es poden seleccionar un màxim de 5 seients per transacció.

### Procés de Pagament
- Un cop seleccionats els seients, l'usuari passa a la pantalla de pagament.
- Cal introduir el nom i el correu electrònic.
- El sistema mostra un **Ticket Digital** visual com a confirmació abans de finalitzar.

---

## 2. Panell d'Administració

L'administrador té accés a una consola de control total a la ruta `/admin`.

### Dashboard de Mètriques
- **Recaptació**: Suma total dels ingressos de totes les vendes.
- **Ocupació**: Percentatge global d'èxit d'ompliment de les sales.
- **Usuaris Online**: Comptador de connexions actives via WebSockets en temps real.

### Monitorització de Sales
- L'administrador pot veure l'estat de cada esdeveniment individualment (quants seients hi ha venuts, lliures o reservats).
- **Reset de Sala**: Funció crítica per a manteniment o noves sessions. Permet buidar completament una sala, alliberant tots els seients i esborrant l'historial de compres d'aquell esdeveniment.

---

## 3. Gestió de Tickets Propis

A la secció "Les meves entrades", qualsevol usuari pot recuperar les seves compres anteriors introduint el seu correu electrònic. El sistema buscarà a la base de dades i mostrarà tots els seients adquirits sota aquest compte.
