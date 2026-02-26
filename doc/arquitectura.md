# Arquitectura del Sistema

Aquest document detalla l'estructura tècnica i les decisions de disseny preses en el desenvolupament de l'aplicació Cinema.

## Stack Tecnològic

El projecte es divideix en dues parts principals: el frontend (webapp) i el backend (server).

### Frontend (User Interface)
- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue.js 3).
- **Estils**: CSS Vanilla amb un sistema de variables personalitzat per mantenir l'estètica Premium.
- **Estat i Magatzem**: `useLocalStorage` de VueUse per mantenir la identitat de l'usuari.
- **Comunicació**: Client de Socket.IO per a la sincronització en temps real.

### Backend (API i Sockets)
- **Runtime**: Node.js amb [Express](https://expressjs.com/).
- **Sockets**: [Socket.IO](https://socket.io/) per a la gestió d'esdeveniments en temps real (reserves, actualitzacions de mapa).
- **Base de Dades**: SQLite per a la persistència de dades, gestionat amb el driver `sqlite3`.

## Estructura de la Base de Dades

El fitxer `server/database.js` defineix l'esquema de dades:

- **Events**: Informació sobre les pel·lícules (nom, data, localització, dimensions de la sala).
- **Seats**: Estat de cada butaca (disponible, reservat, venut), preu i coordinades (fila/columna).
- **Purchases**: Registre de les compres realitzades (email, import total).
- **Purchase_items**: Relació entre compres i seients específics.

## Lògica de Sincronització (Real-time)

La comunicació es basa en events de Socket.IO:

1.  **join_event**: L'usuari s'uneix a una "sala" (room) específica de l'esdeveniment.
2.  **reserve_seat**: Reserva temporal d'un seient (5 minuts d'auto-alliberament).
3.  **confirm_purchase**: Transforma els seients reservats en "venuts" permanentment.
4.  **admin_update**: Event global que actualitza les estadístiques del panell d'administració.

## Flux de Reserva Atòmica

Per evitar que dos usuaris reservin el mateix seient alhora, el servidor realitza consultes `UPDATE` atòmiques amb condicions `WHERE status = 'available'`, assegurant la integritat de les dades fins i tot amb alta concurrència.
