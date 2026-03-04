# Guia d'Execució

Aquest document explica com posar en marxa l'aplicació CinemaPremium en diferents entorns.

## Prerequisits

- **Docker** i **Docker Compose** (recomanat)
- **Node.js** (v20 o superior) i **npm** (per a execució nativa)

---

## 1. Execució amb Docker (Recomanat)

Aquesta és la forma més ràpida de desplegar l'aplicació ja que configura automàticament el backend, el frontend i la xarxa entre ells.

### Passos:
1.  Situat a l'arrel del projecte.
2.  Executa la comanda de construcció i arrencada:
    ```bash
    docker-compose up --build
    ```
3.  L'aplicació estarà llista un cop vegis els logs de Nuxt i Express indicant que estan escoltant als ports 3000 i 3001 respectivament.

### Avantatges:
- No cal instal·lar dependències localment.
- Persistència de dades mitjançant volums de Docker.
- Entorn aïllat i idèntic al de producció.

---

## 2. Execució Nativa (Desenvolupament)

Si vols fer canvis i veure'ls a l'instant, pots executar els serveis per separat.

### Backend (Server)
1.  Entra a la carpeta: `cd server`
2.  Instal·la dependències: `npm install`
3.  Arrenca en mode desenvolupament: `npm run dev`
    *   *El servidor escoltarà al port 3001.*

### Frontend (Webapp)
1.  Entra a la carpeta: `cd webapp`
2.  Instal·la dependències: `npm install`
3.  Arrenca en mode desenvolupament: `npm run dev`
    *   *La web estarà disponible a http://localhost:3000.*

---

## Configuració de Variables d'Entorn

L'aplicació utilitza algunes variables per connectar el frontend amb el backend:

- **`NUXT_PUBLIC_API_BASE`**: Defineix la URL del servidor d'API. Per defecte és `http://localhost:3001`. En entorns Docker, es configura automàticament a través del fitxer `docker-compose.yml`.

## Resolució de Problemes

- **Base de dades buida**: Si la base de dades no existeix, el servidor la crearà i importarà les pel·lícules de la Movies API automàticament al primer inici.
- **Error de Sockets**: Assegura't que el port 3001 no estigui sent utilitzat per cap altra aplicació, ja que la comunicació en temps real depèn d'això.
- **Neteja de Docker**: Si tens problemes amb les imatges antigues, pots netejar-les amb `docker system prune -a`.
