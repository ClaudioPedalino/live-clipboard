# Ideas para mejorar Live Clipboard

## Prioridad alta

1. **Renombrar páginas**  
   Permitir que el usuario cambie "Page 1" por algo como "Notas trabajo" o "Snippets". Guardar el label en localStorage o en Supabase (requeriría otra columna o tabla).

2. **Soporte markdown preview**  
   Toggle para ver el texto como Markdown renderizado. Útil para notas con formato.

3. **Historial / versión anterior**  
   Botón "Deshacer" o lista de versiones recientes. Supabase puede guardar un log de cambios o una columna `content_history` (JSON array de snapshots).

4. **Copia de enlace directo**  
   Botón para copiar la URL de la página actual al clipboard. Útil para compartir una página específica.

## Prioridad media

5. **Páginas ilimitadas / crear páginas**  
   En lugar de 4 fijas, permitir crear páginas dinámicas. Cambiaría el modelo de datos (id UUID o slug generado).

6. **Modo solo lectura**  
   Parámetro de URL `?readonly` que deshabilita edición. Útil para compartir sin riesgo de que modifiquen.

7. **Indicador de conexión**  
   Mostrar cuando se pierde la conexión con Supabase (offline/online).

8. **Atajos de teclado**  
   - Ctrl+S para guardar  
   - Ctrl+Shift+1..4 para cambiar de página  
   - Ctrl+K para focus en el textarea  

9. **Contador de palabras/caracteres**  
   Mostrar en la toolbar.

10. **Export/Import**  
    Descargar todo el contenido como JSON o TXT. Importar desde archivo.

## Prioridad baja

11. **Tema claro/oscuro**  
    Toggle o detección de prefers-color-scheme.

12. **PWA**  
    Instalar como app en el móvil. Service worker + manifest.

13. **Cifrado opcional**  
    Encriptar contenido antes de enviar a Supabase. La key podría estar en la URL (fragment) para compartir de forma segura.

14. **Rate limiting visual**  
    Si hay muchos edits, mostrar "Esperando..." para evitar conflictos.
