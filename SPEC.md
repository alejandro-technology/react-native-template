***

# Plantilla Spec-First para Proyectos de IA

**Instrucción:** Llena cada sección de este documento con la información de tu proyecto antes de escribir una sola línea de código o de pasarle el prompt a la IA.

## SECCIÓN 1 — Visión del producto
La descripción más corta y clara de lo que vas a construir. Limítate a dos o tres oraciones. Si no puedes explicarlo de manera sencilla, aún no está claro.

**Preguntas guía a responder:**
* ¿Qué hace exactamente este producto?
* ¿Para quién está dirigido?
* ¿Qué problema específico resuelve?

**Tu visión:**
> [Escribe aquí tu respuesta...]

---

## SECCIÓN 2 — Usuarios y casos de uso
Define quién usará el producto y para qué. No te centres en perfiles de marketing, sino en acciones concretas que hará cada tipo de usuario dentro del sistema.

**Preguntas guía a responder:**
* ¿Quién es el usuario principal?
* ¿Hay usuarios con roles diferentes? (Ej. Administrador, usuario estándar, visitante).
* ¿Cuáles son las 3 acciones principales que hace cada tipo de usuario?

**Tus usuarios y casos de uso:**
> [Escribe aquí tu respuesta...]

---

## SECCIÓN 3 — Funcionalidades
La lista completa de lo que hace el sistema, organizada por módulos. Escribe cada funcionalidad como: "El usuario puede..." o "El sistema permite...". **Regla de oro:** No hables de implementación ni de código, solo de la función a grandes rasgos.

**Preguntas guía a responder:**
* ¿Qué módulos tiene el sistema? (Ej. Autenticación, Facturación, Perfil).
* ¿Qué puede hacer el usuario en cada módulo?
* ¿Qué hace el sistema automáticamente?

**Tus funcionalidades:**
>[Escribe aquí tu respuesta organizada por módulos...]

---

## SECCIÓN 4 — Flujos de usuario
Los pasos exactos que sigue un usuario para completar cada acción principal en la aplicación.

**Preguntas guía a responder:**
* ¿Cuáles son las 3 a 5 acciones más importantes de tu producto?
* ¿Qué pasos sigue el usuario para completarla cuando todo va bien? (Happy Path).
* ¿Qué pasa si algo sale mal en cada paso? (Manejo de errores, fallos de API, fallos de pago, etc.).

**Tus flujos de usuario:**
> **Flujo 1: [Nombre de la acción]**
> * Happy Path: [Paso 1, Paso 2, Paso 3...]
> * Error Path:[Qué sucede si falla el Paso X...]
> 
> *(Repite para los demás flujos principales)*

---

## SECCIÓN 5 — Arquitectura
La estructura técnica del sistema. Aquí es donde decides el stack tecnológico. Si no tienes decisiones técnicas previas o no tienes conocimientos de programación, puedes pedirle a la IA (en tu prompt inicial) que te sugiera el mejor stack para tu caso.

**Preguntas guía a responder:**
* ¿Es una app web, móvil o ambas?
* ¿Necesitas backend propio o usarás servicios externos (BaaS como Supabase o Firebase)?
* ¿Dónde y cómo se almacenarán los datos?
* ¿Hay autenticación de usuarios?
* ¿Se integrará con otros servicios? (Stripe, pasarelas, APIs externas).

**Tu arquitectura:**
> * **Frontend:**[Ej. React, Next.js, Flutter...]
> * **Backend:** [Ej. Node.js, Python, Supabase...]
> * **Base de datos:** [Ej. PostgreSQL, MongoDB...]
> * **Autenticación:** [Ej. Clerk, Firebase Auth...]
> * **Hosting / Deployment:** [Ej. Vercel, Render, AWS...]

---

## SECCIÓN 6 — Requisitos no funcionales
Las restricciones técnicas y de rendimiento que el sistema debe cumplir para funcionar correctamente en producción.

**Preguntas guía a responder:**
* ¿En qué idioma(s) estará la aplicación?
* ¿Cuántos usuarios simultáneos necesitas soportar al inicio?
* ¿Hay datos sensibles que requieran seguridad adicional?
* ¿Necesita la aplicación funcionar sin conexión (offline)?
* ¿Qué tiempos de carga o rendimiento son aceptables?

**Tus requisitos:**
> * **Rendimiento:**[Ej. Carga inicial < 3 segundos]
> * **Seguridad:** [Ej. Datos encriptados, roles protegidos]
> * **Escalabilidad:** [Ej. Preparado para 1,000 usuarios concurrentes]
> * **Idioma:**[Ej. Español por defecto]
> * **Otros:** [Escribe aquí si aplica...]

***