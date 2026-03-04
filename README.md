# CinemaPremium: tr3-cinema-24-25-PolDones

Aplicació de gestió de reserves de cinema en temps real amb estètica Premium i sincronització instantània.

## Descripció

Aquesta plataforma permet als usuaris navegar per la cartellera de pel·lícules (obtinguda de la Movies API), seleccionar seients en un mapa interactiu 3D i realitzar reserves temporals que es sincronitzen en temps real entre tots els clients connectats. Inclou un panell d'administració avançat per a la monitorització de la sala i les vendes.

## Com executar el projecte

La forma més senzilla d'executar tota la pila (backend i frontend) és utilitzant **Docker Compose**:

```bash
docker-compose up --build
```

Un cop arrencat, l'aplicació estarà disponible a:
- **Webapp**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:3001](http://localhost:3001)

Per a instruccions detallades sobre l'execució nativa o configuracions avançades, consulta la [**Guia d'Execució**](doc/execucio.md).

## Documentació Completa

S'ha creat una documentació exhaustiva en català per detallar cada aspecte del sistema:

1.  [**Índex de Documentació**](doc/README.md): Visió general del projecte.
2.  [**Guia d'Execució**](doc/execucio.md): Com instal·lar i córrer l'app (Docker i Nativa).
3.  [**Guia de Funcionalitat**](doc/funcionalitat.md): Manual d'ús per a clients i administradors.
4.  [**Arquitectura del Sistema**](doc/arquitectura.md): Estructura tècnica, base de dades i lògica de sockets.

---
**Estat:** Finalitzat, optimitzat per a mòbils i lliure d'emojis.
