document.addEventListener('DOMContentLoaded', () => {
    const platillosContenedorPrincipal = document.getElementById('platillos-columnas-contenedor');
    const columnaIzquierda = document.getElementById('platillos-columna-izquierda');
    const columnaDerecha = document.getElementById('platillos-columna-derecha');
    const menuToggle = document.getElementById('menu-toggle');
    const menuLinks = document.querySelectorAll('#menu a');

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menuToggle.checked = false;
            }
        });
    });

    if (!platillosContenedorPrincipal || !columnaIzquierda || !columnaDerecha) {
        console.error('Alguno de los contenedores de platillos (principal, izquierda o derecha) no fue encontrado.');
        return;
    }

    async function cargarPlatillos() {
        try {
            const response = await fetch('/api/platillos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const platillos = await response.json();
            mostrarPlatillos(platillos);
        } catch (error) {
            console.error('Error al cargar los platillos:', error);
            platillosContenedorPrincipal.innerHTML = '<p class="fuente-cuerpo error-mensaje">No se pudieron cargar los platillos. Intenta más tarde.</p>';
        }
    }

    function mostrarPlatillos(platillos) {
        columnaIzquierda.innerHTML = '';
        columnaDerecha.innerHTML = '';

        if (platillos.length === 0) {       
            platillosContenedorPrincipal.innerHTML = '<p class="fuente-cuerpo">No hay platillos disponibles en este momento.</p>';
            return;
        }

        platillos.forEach((platillo, index) => {
            const platilloArticle = document.createElement('article');
            platilloArticle.classList.add('platillo');

            const imagenSrc = platillo.imagen ? `./images/${platillo.imagen}` : './images/placeholder-platillo.webp';

            platilloArticle.innerHTML = `
                <h3 class="fuente-titulo">${platillo.nombre}</h3>
                <p class="fuente-cuerpo platillo-descripcion">${platillo.descripcion || 'Descripción no disponible.'}</p>
                <div class="precio-platillo-container"><p class="fuente-titulo precio-platillo">$${parseFloat(platillo.precio).toFixed(2)}</p></div>
                <img src="${imagenSrc}" alt="${platillo.nombre}" class="platillo-imagen">
            `;

            if (index % 2 === 0) {
                columnaIzquierda.appendChild(platilloArticle);
            } else {
                columnaDerecha.appendChild(platilloArticle);
            }
        });
    }

    cargarPlatillos();
}); 