# Mejoras sugeridas

## Pruebas realizadas
- ✅ Build: `npm run build` OK
- ✅ Linter: sin errores
- ⚠️ Supabase vacío: si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` faltan, la app carga pero fallan las queries (solo console.warn)

---

## Mejoras prioritarias

### 1. Manejo de conexión perdida
**Problema**: Si el usuario pierde internet, los saves fallan en silencio o solo muestran "Error".
**Solución**: Detectar offline (navigator.onLine, o catch de fetch), mostrar banner "Sin conexión. Los cambios se guardarán al reconectar." y reintentar en cola cuando vuelva online.

### 2. Debounce en save-on-unmount
**Problema**: Al cambiar de página muy rápido, el save async puede no terminar antes del unmount.
**Solución**: Usar `navigator.sendBeacon` para el save de emergencia, o un pequeño delay antes de permitir navigation (ej. bloqueando 100ms mientras se envía).

### 3. Indicador de "guardando al salir"
**Problema**: El usuario no sabe si se guardó al cambiar de página.
**Solución**: Toast breve "Guardado al cambiar de página" cuando el save-on-unmount tiene éxito (difícil sin state, alternativa: guardar en beforeunload y mostrar en la página de destino).

### 4. Errores de Supabase más claros
**Problema**: "Error" genérico. "Row level security" o "realtime no habilitado" no se entienden.
**Solución**: Mapear errores comunes a mensajes amigables: "No se pudo guardar. Revisá la conexión y las variables de entorno." + log del error real en dev.

---

## Mejoras de UX

### 5. Ctrl+S para guardar
Atajo de teclado global. Ya tenés forceSave, solo falta el listener.

### 6. beforeunload cuando hay cambios
Si el usuario cierra la pestaña con cambios sin guardar, `window.onbeforeunload` puede advertir. El save-on-unmount ayuda pero una página refresh pierde todo.

### 7. Contador de caracteres/palabras
En la toolbar, opcional. Útil para notas con límite.

### 8. Loading state en la carga inicial
Mientras se hace el `load()` del useClipboardPage, el textarea está vacío. Mostrar un skeleton o "Cargando..." evita confusión.

---

## Mejoras técnicas

### 9. React Query o SWR para Supabase
Simplificaría cache, retries y estados de loading/error. Ahora está todo manual en el hook.

### 10. Tests
- Unit: hook useClipboardPage con mock de supabase
- E2E: Playwright para "escribir → cambiar página → volver → ver contenido"

### 11. Limpiar assets no usados
`src/typescript.svg` parece sobrante del template vanilla. Revisar y borrar.

---

## Resumen rápido
| Prioridad | Mejora | Esfuerzo |
|-----------|--------|----------|
| Alta | Offline / reconnect | Medio |
| Alta | beforeunload con cambios | Bajo |
| Media | Ctrl+S | Bajo |
| Media | Loading inicial | Bajo |
| Baja | Errores amigables | Bajo |
| Baja | Tests | Alto |
