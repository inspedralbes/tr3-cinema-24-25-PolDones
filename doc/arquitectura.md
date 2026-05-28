# Arquitectura del Sistema

Aquest document detalla l'estructura tècnica, les decisions de disseny i el flux de dades de l'aplicació CinemaPremium.

## Estructura Multicapa

L'aplicació segueix un model client-servidor desacoblat, facilitant el manteniment i l'escalabilitat.

### 1. Frontend (Webapp)
- **Framework**: [Nuxt 3](https://nuxt.com/) amb Vue.js 3.
- **Estils**: Sistema de disseny "Dark Premium" utilitzant CSS Vanilla i variables globals.
- **Gestió de l'Estat**: Composables de Vue3 i `useCookie` per a la persistència d'identitat de l'usuari.
- **Comunicació**: Client de Socket.IO configurat com a plugin de Nuxt per a comunicació bidireccional.

### 2. Backend (Server)
- **Runtime**: Node.js amb Express.
- **Sockets**: [Socket.IO](https://socket.io/) per a la gestió de sales (rooms) i events de reserva.
- **Base de Dades**: SQLite3 per a una persistència lleugera i ràpida.

---

## Integració amb la Movies API

Una de les funcionalitats clau és la importació automàtica de dades:
- El servidor es connecta a `https://devsapihub.com/api-movies` durant la inicialització.
- Si la base de dades local està buida, descarrega les pel·lícules i les converteix en "Esdeveniments" dins del sistema.
- Aquest procés inclou el mapatge d'imatges i descripcions reals per omplir la cartellera.

## Esquema de Dades (SQLite)

La base de dades (`database.sqlite`) conté les següents taules:
- **`events`**: Títol, descripció, data, localització, URL de la imatge i dimensions de la sala.
- **`seats`**: Estat de la butaca (`available`, `reserved`, `sold`), preu, i relació amb l'usuari.
- **`purchases`**: Registre de transaccions finalitzades.
- **`purchase_items`**: Detall de quins seients pertanyen a quina compra.

---

## Lògica de Sincronització en Temps Real

El sistema de WebSockets permet una experiència sense recàrregues:
1.  **Bloqueig Temporal**: Quan un usuari prem un seient disponible, aquest es marca com a `reserved` i s'inicia un temporitzador de 5 minuts al servidor.
2.  **Difusió d'Estat**: Qualsevol canvi d'estat (reserva, alliberament o compra) s'emet a tots els clients connectats a la mateixa sala de l'esdeveniment.
3.  **Reserva Atòmica**: Per evitar la "doble reserva", el backend realitza transaccions SQL que només permeten el canvi d'estat si el seient encara està disponible en el moment precís de la petició.

## Docker i Networking

En l'entorn de Docker, s'utilitzen variables d'entorn per a la configuració:
- `NUXT_PUBLIC_API_BASE`: Permet que el frontend Nuxt sàpiga exactament on buscar el backend de Sockets i API, ja sigui dins de la xarxa de Docker o des del navegador de l'usuari.
