
import * as bcrypt from 'bcrypt';

async function testBcrypt() {
    const password = 'newPassword123';
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);

    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);

    if (!hash.startsWith('$2b$')) {
        console.warn('WARNING: Hash does not start with $2b$');
        console.warn(`Actual prefix: ${hash.substring(0, 4)}`);
    } else {
        console.log('Hash starts with usually expected $2b$');
    }

    const match = await bcrypt.compare(password, hash);
    console.log(`Compare match: ${match}`);
}

testBcrypt();
