require('dotenv').config({ path: '../../.env' });
const Usuario = require('../models/usuario.model.js');

const initAdmin = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const adminData = {
            nombre_usuario: process.env.ADMIN_USER || 'admin',
            password: process.env.ADMIN_PASSWORD || 'GreenPlate2024!',
            rol: 'admin'
        };

        try {
            const admin = await Usuario.create(adminData);
            console.log('✅ Usuario administrador creado exitosamente:', admin.nombre_usuario);
        } catch (error) {
            if (error.message === 'El nombre de usuario ya existe.') {
                console.log('ℹ️ El usuario administrador ya existe.');
            } else {
                throw error;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear el usuario administrador:', error.message);
        process.exit(1);
    }
};

initAdmin(); 