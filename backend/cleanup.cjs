const { Client } = require('pg');

const c = new Client({
    connectionString: 'postgres://postgres:admin@localhost:5432/oru'
});

c.connect()
    .then(async () => {
        // Delete users created recently or specific test users
        const emailsToDelete = ['gamingcristy19@gmail.com', 'test2@gmail.com', 'test3@gmail.com'];
        
        for (const email of emailsToDelete) {
            const res = await c.query('SELECT id FROM users WHERE email = $1', [email]);
            if (res.rows.length) {
                const userId = res.rows[0].id;
                await c.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
                await c.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
                await c.query('DELETE FROM users WHERE id = $1', [userId]);
                console.log(`Deleted user ${email} successfully.`);
            }
        }
        
        // Also let's just delete the last created user if they used something else today
        const recent = await c.query("SELECT id, email FROM users ORDER BY created_at DESC LIMIT 5");
        console.log("Recent users in DB:");
        console.table(recent.rows);
    })
    .catch(console.error)
    .finally(() => c.end());
