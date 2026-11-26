const net = require('net');
const { spawn } = require('child_process');

function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function ensureTunnel() {
  const isPgOpen = await checkPort(5432);
  const isRedisOpen = await checkPort(6379);

  if (isPgOpen && isRedisOpen) {
    console.log('[Tunnel] ✅ Postgres (5432) and Redis (6379) tunnels are active.');
    return;
  }

  console.log('[Tunnel] 🔄 Starting background SSH tunnel to VPS (oru)...');

  // Spawn SSH in detached background mode so it survives terminal closing
  if (process.platform === 'win32') {
    const { execSync } = require('child_process');
    try {
      execSync(
        'powershell -NoProfile -Command "Start-Process ssh -ArgumentList \\"-N -o ServerAliveInterval=30 -o ServerAliveCountMax=5 -L 5432:127.0.0.1:5432 -L 6379:127.0.0.1:6379 oru\\" -WindowStyle Hidden"',
        { stdio: 'ignore' }
      );
    } catch (_) {}
  } else {
    const child = spawn(
      'ssh',
      [
        '-N',
        '-o', 'ServerAliveInterval=30',
        '-o', 'ServerAliveCountMax=5',
        '-o', 'ExitOnForwardFailure=yes',
        '-L', '5432:127.0.0.1:5432',
        '-L', '6379:127.0.0.1:6379',
        'oru'
      ],
      {
        detached: true,
        stdio: 'ignore',
        shell: false,
      }
    );
    child.unref();
  }

  // Wait up to 8 seconds for the ports to become active
  const startTime = Date.now();
  while (Date.now() - startTime < 8000) {
    await new Promise((r) => setTimeout(r, 500));
    const ready = await checkPort(5432);
    if (ready) {
      console.log('[Tunnel] ✅ SSH tunnel established successfully (5432, 6379).');
      return;
    }
  }

  console.warn('[Tunnel] ⚠️ Warning: SSH tunnel launched, but port 5432 did not respond within 8 seconds.');
}

ensureTunnel().catch((err) => {
  console.error('[Tunnel] Error ensuring tunnel:', err.message);
});
