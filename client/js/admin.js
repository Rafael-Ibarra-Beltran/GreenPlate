document.addEventListener('DOMContentLoaded', async () => {
    const adminLoading = document.getElementById('admin-loading');
    const dashboardStatsDiv = document.getElementById('dashboard-stats');
    const statTotalPlatillos = document.getElementById('stat-total-platillos');
    const statTotalMensajes = document.getElementById('stat-total-mensajes');
    const statMensajesNuevos = document.getElementById('stat-mensajes-nuevos');

    const gestionPlatillosSection = document.getElementById('gestion-platillos');
    const btnMostrarFormPlatillo = document.getElementById('btn-mostrar-form-platillo');
    const formPlatilloContainer = document.getElementById('form-platillo-container');
    const formPlatillo = document.getElementById('form-platillo');
    const formPlatilloTitulo = document.getElementById('form-platillo-titulo');
    const platilloIdInput = document.getElementById('platillo-id');
    const platilloNombreInput = document.getElementById('platillo-nombre');
    const platilloDescripcionInput = document.getElementById('platillo-descripcion');
    const platilloPrecioInput = document.getElementById('platillo-precio');
    const platilloCategoriaInput = document.getElementById('platillo-categoria');
    const platilloImagenInput = document.getElementById('platillo-imagen');
    const btnCancelarFormPlatillo = document.getElementById('btn-cancelar-form-platillo');
    const tablaPlatillos = document.getElementById('tabla-platillos');
    const tbodyPlatillos = document.getElementById('tbody-platillos');
    const loadingPlatillosMensaje = document.getElementById('loading-platillos-mensaje');
    const mensajeFormPlatillo = document.getElementById('mensaje-form-platillo');

    const gestionMensajesSection = document.getElementById('gestion-mensajes');
    const tbodyMensajes = document.getElementById('tbody-mensajes');
    const loadingMensajesMensaje = document.getElementById('loading-mensajes-mensaje');
    const modalMensaje = document.getElementById('modal-mensaje');
    const btnCerrarModal = document.querySelectorAll('.btn-cerrar-modal');
    const btnActualizarEstado = document.getElementById('btn-actualizar-estado');
    const btnEliminarMensaje = document.getElementById('btn-eliminar-mensaje');
    const modalEstado = document.getElementById('modal-estado');
    let mensajeActualId = null;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.classList.add('modal-backdrop');
    document.body.appendChild(modalBackdrop);

    let editandoPlatillo = false;

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioGreenPlate'));
    if (!usuarioLogueado || usuarioLogueado.rol !== 'admin') {
        alert('Acceso denegado. Debes ser administrador para ver esta página.');
        window.location.href = 'login.html';
        return;
    }

    cargarEstadisticas();
    
    async function cargarEstadisticas() {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.status === 401 || response.status === 403) {
                alert('Tu sesión ha expirado o no tienes permiso. Serás redirigido al login.');
                localStorage.removeItem('usuarioGreenPlate');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido al cargar estadísticas.' }));
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const stats = await response.json();

            if (statTotalPlatillos) statTotalPlatillos.textContent = stats.total_platillos;
            if (statTotalMensajes) statTotalMensajes.textContent = stats.total_mensajes;
            if (statMensajesNuevos) statMensajesNuevos.textContent = stats.mensajes_nuevos;
            
            if (adminLoading) adminLoading.style.display = 'none';
            if (dashboardStatsDiv) dashboardStatsDiv.style.display = 'grid';
            if (gestionPlatillosSection) gestionPlatillosSection.style.display = 'block'; 
            
            cargarPlatillos(); 

        } catch (error) {
            console.error('Error al cargar estadísticas del dashboard:', error);
            if (adminLoading) adminLoading.textContent = `Error al cargar datos: ${error.message}`;
        }
    }

    async function cargarPlatillos() {
        if (loadingPlatillosMensaje) loadingPlatillosMensaje.style.display = 'block';
        if (tbodyPlatillos) tbodyPlatillos.innerHTML = ''; 

        try {
            const response = await fetch('/api/platillos');
            if (!response.ok) throw new Error('No se pudieron cargar los platillos.');
            const platillos = await response.json();

            if (platillos.length === 0) {
                if (loadingPlatillosMensaje) loadingPlatillosMensaje.textContent = 'No hay platillos registrados.';
            } else {
                platillos.forEach(platillo => {
                    const tr = document.createElement('tr');

                    tr.innerHTML = `
                        <td>${platillo.id}</td>
                        <td class="fuente-cuerpo">${platillo.nombre}</td>
                        <td class="fuente-cuerpo">$${parseFloat(platillo.precio).toFixed(2)}</td>
                        <td class="fuente-cuerpo">${platillo.categoria || '-'}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${platillo.id}">Editar</button>
                            <button class="btn-delete" data-id="${platillo.id}">Eliminar</button>
                        </td>
                    `;

                    tbodyPlatillos.appendChild(tr);
                });
                if (loadingPlatillosMensaje) loadingPlatillosMensaje.style.display = 'none';
            }
        } catch (error) {
            console.error('Error cargando platillos:', error);
            if (loadingPlatillosMensaje) loadingPlatillosMensaje.textContent = 'Error al cargar platillos.';
        }
    }

    function mostrarFormPlatillo(platillo = null) {
        editandoPlatillo = !!platillo;
        formPlatilloTitulo.textContent = editandoPlatillo ? 'Editar Platillo' : 'Añadir Nuevo Platillo';
        platilloIdInput.value = platillo ? platillo.id : '';
        platilloNombreInput.value = platillo ? platillo.nombre : '';
        platilloDescripcionInput.value = platillo ? platillo.descripcion : '';
        platilloPrecioInput.value = platillo ? parseFloat(platillo.precio).toFixed(2) : '';
        platilloCategoriaInput.value = platillo ? platillo.categoria : '';
        platilloImagenInput.value = platillo ? platillo.imagen : ''; 
        platilloImagenInput.placeholder = editandoPlatillo ? 'Dejar vacío para no cambiar imagen' : 'ej: hamburguesa.webp';

        if (mensajeFormPlatillo) mensajeFormPlatillo.textContent = '';
        if (formPlatilloContainer) formPlatilloContainer.style.display = 'block';
        if (btnMostrarFormPlatillo) btnMostrarFormPlatillo.style.display = 'none'; 
    }

    function ocultarFormPlatillo() {
        if (formPlatilloContainer) formPlatilloContainer.style.display = 'none';
        if (formPlatillo) formPlatillo.reset();

        platilloIdInput.value = '';
        editandoPlatillo = false;

        if (mensajeFormPlatillo) mensajeFormPlatillo.textContent = '';
        if (btnMostrarFormPlatillo) btnMostrarFormPlatillo.style.display = 'block'; 
    }

    btnMostrarFormPlatillo.addEventListener('click', () => mostrarFormPlatillo());
    btnCancelarFormPlatillo.addEventListener('click', ocultarFormPlatillo);

    formPlatillo.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (mensajeFormPlatillo) mensajeFormPlatillo.textContent = '';

        const id = platilloIdInput.value;
        const datosPlatillo = {
            nombre: platilloNombreInput.value,
            descripcion: platilloDescripcionInput.value,
            precio: parseFloat(platilloPrecioInput.value),
            categoria: platilloCategoriaInput.value,
            imagen: platilloImagenInput.value || null
        };

        if (datosPlatillo.imagen === '') { 
            delete datosPlatillo.imagen;
        }


        const url = editandoPlatillo ? `/api/platillos/${id}` : '/api/platillos';
        const method = editandoPlatillo ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPlatillo)
            });

            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.message || 'Error al guardar el platillo.');
            }
            
            if (mensajeFormPlatillo) {
                mensajeFormPlatillo.textContent = resultado.message || (editandoPlatillo ? 'Platillo actualizado con éxito.' : 'Platillo creado con éxito.');
                mensajeFormPlatillo.className = 'mensaje-form exito'; 
            }
            
            ocultarFormPlatillo();
            cargarPlatillos(); 
            cargarEstadisticas(); 
            
        } catch (error) {
            console.error('Error guardando platillo:', error);
            if (mensajeFormPlatillo) {
                mensajeFormPlatillo.textContent = error.message;
                mensajeFormPlatillo.className = 'mensaje-form error'; 
            }
        }
    });

    tbodyPlatillos.addEventListener('click', async (event) => {
        const target = event.target;
        const platilloId = target.dataset.id;

        if (target.classList.contains('btn-edit') && platilloId) {
            try {
                const response = await fetch(`/api/platillos/${platilloId}`);
                if (!response.ok) throw new Error('No se pudo obtener el platillo para editar.');
                const platilloAEditar = await response.json();
                mostrarFormPlatillo(platilloAEditar);
            } catch (error) {
                console.error('Error al obtener platillo para editar:', error);
                alert(error.message);
            }
        }

        if (target.classList.contains('btn-delete') && platilloId) {
            if (confirm(`¿Estás seguro de que quieres eliminar el platillo ID ${platilloId}?`)) {
                try {
                    const response = await fetch(`/api/platillos/${platilloId}`, { method: 'DELETE' });
                    const resultado = await response.json();
                    
                    if (!response.ok) throw new Error(resultado.message || 'Error al eliminar el platillo.');
                    
                    alert(resultado.message || 'Platillo eliminado con éxito.');
                    cargarPlatillos(); 
                    cargarEstadisticas(); 

                } catch (error) {
                    console.error('Error eliminando platillo:', error);
                    alert(error.message);
                }
            }
        }
    });

    async function cargarMensajes() {
        if (loadingMensajesMensaje) loadingMensajesMensaje.style.display = 'block';
        if (tbodyMensajes) tbodyMensajes.innerHTML = '';

        try {
            const response = await fetch('/api/contactos');
            if (!response.ok) throw new Error('No se pudieron cargar los mensajes.');
            const mensajes = await response.json();

            if (mensajes.length === 0) {
                if (loadingMensajesMensaje) loadingMensajesMensaje.textContent = 'No hay mensajes.';
            } else {
                mensajes.forEach(mensaje => {
                    const fecha = new Date(mensaje.fecha_envio).toLocaleString('es-ES');
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${mensaje.id}</td>
                        <td class="fuente-cuerpo">${fecha}</td>
                        <td class="fuente-cuerpo">${mensaje.nombre}</td>
                        <td class="fuente-cuerpo">${mensaje.asunto || '-'}</td>
                        <td><span class="estado-badge estado-${mensaje.estado} fuente-cuerpo">${mensaje.estado}</span></td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${mensaje.id}">Ver Detalles</button>
                        </td>
                    `;
                    tbodyMensajes.appendChild(tr);
                });
                
                if (loadingMensajesMensaje) loadingMensajesMensaje.style.display = 'none';
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            if (loadingMensajesMensaje) loadingMensajesMensaje.textContent = 'Error al cargar mensajes.';
        }
    }

    async function mostrarDetallesMensaje(id) {
        console.log(`Intentando mostrar detalles para mensaje ID: ${id}`);
        try {
            const response = await fetch(`/api/contactos/${id}`);
            if (!response.ok) throw new Error('No se pudo obtener el mensaje.');
            const mensaje = await response.json();

            mensajeActualId = mensaje.id;
            document.getElementById('modal-nombre').textContent = mensaje.nombre;
            document.getElementById('modal-correo').textContent = mensaje.correo;
            document.getElementById('modal-telefono').textContent = mensaje.telefono || 'No proporcionado';
            document.getElementById('modal-asunto').textContent = mensaje.asunto || 'Sin asunto';
            document.getElementById('modal-fecha').textContent = new Date(mensaje.fecha_envio).toLocaleString('es-ES');
            document.getElementById('modal-mensaje-texto').textContent = mensaje.mensaje;
            document.getElementById('modal-estado').value = mensaje.estado;

            console.log("Datos del mensaje cargados, mostrando modal y backdrop.");
            modalBackdrop.classList.add('active');
            modalMensaje.classList.remove('hidden');
            console.log("Clases de modal y backdrop actualizadas.");
            console.log("Estado de modalMensaje.classList: ", modalMensaje.classList);
            console.log("Estado de modalBackdrop.classList: ", modalBackdrop.classList);

        } catch (error) {
            console.error('Error obteniendo detalles del mensaje:', error);
            alert('Error al cargar los detalles del mensaje.');
        }
    }

    function ocultarModalMensaje() {
        modalBackdrop.classList.remove('active');
        modalMensaje.classList.add('hidden');
        mensajeActualId = null;
    }

    btnCerrarModal.forEach(btn => {
        btn.addEventListener('click', ocultarModalMensaje);
    });

    modalBackdrop.addEventListener('click', (event) => {
        if (event.target === modalBackdrop) {
            ocultarModalMensaje();
        }
    });

    btnActualizarEstado.addEventListener('click', async () => {
        if (!mensajeActualId) return;

        try {
            const response = await fetch(`/api/contactos/${mensajeActualId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: modalEstado.value })
            });

            if (!response.ok) throw new Error('Error al actualizar el estado.');
            
            alert('Estado actualizado correctamente.');
            ocultarModalMensaje();
            cargarMensajes();
            cargarEstadisticas();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            alert('Error al actualizar el estado del mensaje.');
        }
    });

    btnEliminarMensaje.addEventListener('click', async () => {
        if (!mensajeActualId) return;

        if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            try {
                const response = await fetch(`/api/contactos/${mensajeActualId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Error al eliminar el mensaje.');
                
                alert('Mensaje eliminado correctamente.');
                ocultarModalMensaje();
                cargarMensajes();
                cargarEstadisticas();
            } catch (error) {
                console.error('Error eliminando mensaje:', error);
                alert('Error al eliminar el mensaje.');
            }
        }
    });

    tbodyMensajes.addEventListener('click', event => {
        const target = event.target;
        console.log("Clic detectado en tabla de mensajes. Target:", target);
        if (target.classList.contains('btn-edit')) {
            const mensajeId = target.dataset.id;
            console.log(`Botón 'Ver Detalles' (btn-edit) clickeado para mensaje ID: ${mensajeId}`);
            mostrarDetallesMensaje(mensajeId);
        }
    });

    cargarMensajes();

    if (btnCerrarSesion) {
        console.log("Botón 'Cerrar Sesión' encontrado, añadiendo listener.");
        btnCerrarSesion.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Botón 'Cerrar Sesión' clickeado.");
            localStorage.removeItem('usuarioGreenPlate');
            window.location.href = 'index.html';
        });
    } else {
        console.error("Botón 'Cerrar Sesión' (id: btn-cerrar-sesion) no encontrado.");
    }
}); 