# 🎮 Aprende las Tablas - ¡Matemáticas Divertidas!
## Descripción
**Aprende las Tablas** es un juego educativo diseñado para hacer que el aprendizaje de las tablas de multiplicar sea divertido y emocionante. Con múltiples modos de juego, animaciones interactivas y una interfaz amigable, este proyecto es ideal para niños y adultos que desean mejorar sus habilidades matemáticas.

---

## 🚀 Características
- **Explorar Tablas**: Aprende cada tabla paso a paso.
- **Quiz Rápido**: Pon a prueba tu memoria con preguntas rápidas.
- **Desafío Contrarreloj**: Resuelve tantas preguntas como puedas antes de que se acabe el tiempo.
- **Batalla Matemática**: Derrota a monstruos resolviendo multiplicaciones.
- **Personalización**: Cambia el fondo y la música para una experiencia única.
- **Soporte de Voz**: Escucha las tablas con síntesis de voz.

---

## 📋 Instrucciones para el Usuario

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Conexión a internet para cargar recursos externos (opcional).

### Cómo Jugar
1. **Abrir el Juego**: Abre el archivo `index.html` en tu navegador.
2. **Seleccionar un Modo**:
   - Explorar Tablas: Aprende paso a paso.
   - Quiz Rápido: Responde preguntas rápidas.
   - Desafío Contrarreloj: Resuelve tantas como puedas en 60 segundos.
   - Batalla Matemática: Resuelve multiplicaciones para atacar.
3. **Personalización**:
   - Cambia el fondo con una imagen o URL.
   - Selecciona música personalizada para el modo batalla.
4. **Disfruta y Aprende**: Sigue las instrucciones en pantalla y diviértete aprendiendo.

---

## 🛠️ Documentación Técnica

### Estructura del Proyecto
- **index.html**: Archivo principal que contiene la estructura del juego.
- **CSS Inline**: Estilos personalizados para animaciones y diseño.
- **JavaScript Inline**: Lógica del juego, manejo de eventos y animaciones.

### Dependencias
- **Tailwind CSS**: Utilizado para diseño responsivo y estilización.
- **Google Fonts**: Fuentes `Fredoka One` y `Nunito`.
- **Speech Synthesis API**: Para soporte de voz.

### Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/aprende-las-tablas.git
   ```
2. Abre el archivo `index.html` en tu navegador.

### Personalización
- **Fondo**: Modifica el elemento `#bgLayer` para cambiar el fondo.
- **Música**: Usa el input de música en el menú principal para cargar tu propia música.

### Funciones Clave
- **showScreen(screen)**: Cambia entre las diferentes pantallas del juego.
- **populateVoiceList()**: Rellena el selector de voces disponibles.
- **generateTablesGrid()**: Genera dinámicamente las tarjetas de tablas.

### Notas para Desarrolladores
- **Compatibilidad**: Asegúrate de probar en diferentes navegadores.
- **Extensibilidad**: Puedes agregar nuevos modos de juego extendiendo la función `showScreen` y creando nuevas pantallas.
- **Almacenamiento Local**: Se utiliza `localStorage` para guardar configuraciones de fondo y música.

---

## 🧑‍💻 Contribuciones
¡Las contribuciones son bienvenidas! Si encuentras un error o tienes una idea para mejorar el juego, abre un issue o envía un pull request.

---

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 🌟 Agradecimientos
