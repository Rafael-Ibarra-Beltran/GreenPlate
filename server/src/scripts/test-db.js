const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'u560808886_gp_user',
            password: 'GreenPlate2024!DB',
            database: 'u560808886_greenplate_db'
        });

        console.log('✅ Conexión exitosa a la base de datos');
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS test_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                test_field VARCHAR(255)
            )
        `);
        
        console.log('✅ Tabla de prueba creada exitosamente');
        
        await connection.query('DROP TABLE IF EXISTS test_table');
        console.log('✅ Tabla de prueba eliminada exitosamente');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Código de error:', error.code);
    }
}

testConnection(); 