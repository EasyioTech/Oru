import { spawn } from 'child_process';

const p = spawn('npx', ['drizzle-kit', 'push', '--config=drizzle.config.prod.ts', '--force'], { cwd: process.cwd(), shell: true });

p.stdout.on('data', d => {
    process.stdout.write(d);
    if (d.toString().includes('Is crm_activities') || d.toString().includes('❯') || d.toString().includes('?')) {
        p.stdin.write('\r\n');
    }
});
p.stderr.on('data', d => process.stderr.write(d));
p.on('close', code => process.exit(code));
