document.addEventListener('DOMContentLoaded', () => {
    const formularioLogin = document.getElementById('formulario-login');
    const mensajeLogin = document.getElementById('mensaje-login');

    if (!formularioLogin) {
        console.error('Formulario de login no encontrado.');
        return;
    }

    formularioLogin.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (mensajeLogin) {
            mensajeLogin.textContent = '';
            mensajeLogin.className = 'mensaje-login'; 
        }

        const nombre_usuario = formularioLogin.nombre_usuario.value;
        const password = formularioLogin.password.value;

        if (!nombre_usuario || !password) {
            if (mensajeLogin) {
                mensajeLogin.textContent = 'Usuario y contraseña son obligatorios.';
                mensajeLogin.classList.add('error');
            }

            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre_usuario, password })
            });

            const resultado = await response.json();

            if (response.ok) {
                if (mensajeLogin) {
                    mensajeLogin.textContent = resultado.message;
                    mensajeLogin.classList.add('exito');
                }

                localStorage.setItem('usuarioGreenPlate', JSON.stringify(resultado.usuario));
                
                if (resultado.usuario && resultado.usuario.rol === 'admin') {
                    window.location.href = 'admin.html'; 
                } else {
                    window.location.href = 'index.html'; 
                }

            } else {
                if (mensajeLogin) {
                    mensajeLogin.textContent = resultado.message || 'Error en el login.';
                    mensajeLogin.classList.add('error');
                }
            }
        } catch (error) {
            console.error('Error al intentar iniciar sesión:', error);
            if (mensajeLogin) {
                mensajeLogin.textContent = 'Error de conexión al intentar iniciar sesión.';
                mensajeLogin.classList.add('error');
            }
        }
    });
}); 