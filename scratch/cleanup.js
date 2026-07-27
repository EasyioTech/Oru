const { Client } = require('pg');

const c = new Client({
    connectionString: 'postgres://postgres:admin@localhost:5432/oru'
});

c.connect()
    .then(async () => {
        const email = 'gamingcristy19@gmail.com';
        const res = await c.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (res.rows.length) {
            const userId = res.rows[0].id;
            
            // Delete related rows first
            await c.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
            await c.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
            
            // Then delete the user
            await c.query('DELETE FROM users WHERE id = $1', [userId]);
            
            console.log(`Deleted user ${email} successfully.`);
        } else {
            console.log('User not found in the database.');
        }
    })
    .catch(console.error)
    .finally(() => c.end());
