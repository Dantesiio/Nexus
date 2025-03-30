const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = '123456'; // Cambia por la contraseña real
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hash:', hashedPassword);
}

hashPassword();
