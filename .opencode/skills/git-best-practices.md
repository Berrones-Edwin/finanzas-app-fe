---
name: git-best-practices
description: Aplica el estándar de Conventional Commits, actualización de CHANGELOG.md y verificación de seguridad en .gitignore.
---

# Skill: Git Best Practices & Security Standard

## Descripción
Aplica estándares profesionales para la gestión del control de versiones, prevención de fuga de datos sensibles y mantenimiento del historial del proyecto.

## Reglas de Ejecución

### 1. Control de Versiones e Higiene (.gitignore)
- **Verificación previa:** Antes de realizar cualquier cambio, commit o staging, revisa que el archivo `.gitignore` contenga y respete la exclusión de:
  - Variables de entorno (`.env`, `.env.local`, `.env.*`).
  - Directorios de dependencias (`node_modules/`, `venv/`, `.venv/`, `vendor/`).
  - Archivos/carpetas temporales y de estado de la IA o editor (`.opencode/`, `.cursor/`, `.tmp/`, `dist/`, `build/`).
- **Prevención de fugas:** Jamás sugieras, crees o incluyas llaves de API, tokens o credenciales en archivos rastreados por Git.

### 2. Formato de Commits (Conventional Commits)
Al redactar mensajes de commit o actualizar el historial de cambios, utiliza estrictamente el estándar **Conventional Commits**:

#### Formato:
`<tipo>(<alcance opcional>): <descripción corta en presente/imperativo>`

#### Tipos permitidos:
- `feat`: Nueva funcionalidad para el usuario.
- `fix`: Corrección de un error o bug en el código.
- `docs`: Cambios únicamente en la documentación.
- `style`: Cambios que no afectan el significado del código (espacios, formato, punto y coma).
- `refactor`: Cambio de código que no corrige un error ni añade una función.
- `test`: Añadir o corregir pruebas existentes.
- `chore`: Actualizaciones de tareas de construcción, paquetes o herramientas sin cambiar código fuente.

#### Ejemplos válidos:
- `feat(auth): add JWT authentication flow`
- `fix(chat): resolve memory leak in message listener`
- `chore(deps): update opencode dependencies`

### 3. Registro de Cambios (CHANGELOG.md)
- Al finalizar una característica importante o corrección crítica, actualiza o crea el archivo `CHANGELOG.md` documentando los cambios bajo las secciones: `Added`, `Changed`, `Fixed`, o `Removed`.