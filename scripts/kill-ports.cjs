const { execSync } = require('child_process');

const ports = [3000, 5001, 5173, 5174];
for (const port of ports) {
  try {
    const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
    const pids = [...new Set(out.trim().split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean))];
    for (const pid of pids) {
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          process.kill(Number(pid));
          console.log(`Freed port ${port} (PID ${pid})`);
        } catch (_) {}
      }
    }
  } catch (_) {
    // Port not in use
  }
}
console.log('Ports 3000, 5173, and 5174 are clean and ready.');
