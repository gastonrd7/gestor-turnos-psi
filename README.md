# Challenge Product Engineer para PSI Mammoliti

## Resumen

Este proyecto responde a lograr un MVP para completar el siguiente challenge:
[Challenge product engineer](https://psimammoliti.notion.site/Challenge-Product-Engineer-2257bb70dfe5806c93d1d38fa0e64188)
Sumandole que los turnos deben ser presencial / online.

## Tecnologia utilizada

- NextJS
- TypeScript
- Patrón flux (reduxjs/toolkit): para manejo del estado global.
- Jest (test unitarios)
- Nock (test integracion)
- tailwindcss

## CI (Integración Continua) / CD (Despliegue Continuo)

Este repositorio cuenta con CI/CD automatizado utilizando GitHub Actions, lo que garantiza que cada cambio pase por una validación completa antes de ser integrado.

Cada push o pull request a main ejecuta automáticamente:

-Verificación de linting con ESLint para asegurar calidad de código.
-Ejecución de todos los tests con Jest (unitarios e integrados).
-Validación de tipos con TypeScript para prevenir errores en tiempo de compilación.

Esta integración continua no solo mejora la confiabilidad del código, sino que permite una entrega continua ágil y segura. El workflow está configurado para escalar sin fricción a medida que el proyecto crece.

## Instalacion y ejecucion de la web localmente

Node: v20.19.4

```
npm install
```

```
npm run dev
```

Frontend local: [http://localhost:3000](http://localhost:3000)

```
npm run test
```
