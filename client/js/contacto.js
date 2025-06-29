document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-contacto');
    const mensajeRespuesta = document.getElementById('mensaje-respuesta-contacto');

    if (!formulario) {
        console.error('El formulario de contacto no fue encontrado.');
        return;
    }

    if (!mensajeRespuesta) {
        console.error('El contenedor para mensajes de respuesta del contacto no fue encontrado.');
    }

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        mensajeRespuesta.textContent = ''; 
        mensajeRespuesta.classList.remove('exito', 'error'); 

        const formData = new FormData(formulario);
        const datosContacto = {
            nombre: formData.get('nombre'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono'),
            asunto: formData.get('asunto'),
            mensaje: formData.get('mensaje'),
        };

        if (!datosContacto.nombre || !datosContacto.correo || !datosContacto.mensaje || !datosContacto.asunto) {
            mensajeRespuesta.textContent = 'Por favor, completa todos los campos obligatorios (Nombre, Correo, Asunto, Mensaje).';
            mensajeRespuesta.classList.add('error');
            return;
        }

        try {
            const response = await fetch('/api/contactos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosContacto),
            });

            const resultado = await response.json();

            if (response.ok) {
                mensajeRespuesta.textContent = resultado.message || '¡Mensaje enviado con éxito!';
                mensajeRespuesta.classList.add('exito');
                formulario.reset(); 
            } else {
                mensajeRespuesta.textContent = resultado.message || 'Error al enviar el mensaje. Inténtalo de nuevo.';
                mensajeRespuesta.classList.add('error');
            }
        } catch (error) {
            console.error('Error en la petición fetch:', error);
            mensajeRespuesta.textContent = 'Ocurrió un error de conexión. Por favor, revisa tu conexión a internet e inténtalo de nuevo.';
            mensajeRespuesta.classList.add('error');
        }
    });
}); 