# Webapp CinemaPremium (Nuxt 3)

Aquest és el frontend de l'aplicació Cinema, construït amb Nuxt 3 i optimitzat per a una experiència d'usuari d'alta gamma.

## Característiques Tècniques

- **Framework**: Nuxt 3 (Vue 3).
- **Client de Sockets**: Socket.io-client.
- **Estils**: CSS Pur amb un enfocament "Mobile-First".

## Configuració de Desenvolupament

Per executar només la webapp localment:

1.  Instal·la dependències:
    ```bash
    npm install
    ```
2.  Arrenca el servidor de desenvolupament:
    ```bash
    npm run dev
    ```

### Variables d'Entorn Importants

La webapp necessita saber on es troba el servidor d'API. Pots configurar-ho mitjançant:
- **`NUXT_PUBLIC_API_BASE`**: Per defecte `http://localhost:3001`.

## Dockerització

Aquest mòdul està preparat per ser construït com una imatge de Docker. Pots fer-ho manualment o utilitzar el `docker-compose.yml` situat a l'arrel del projecte.

---
Per a la guia completa d'execució, consulta [Guia d'Execució](../doc/execucio.md).
