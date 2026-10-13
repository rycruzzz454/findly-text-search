import { spawn } from 'node:child_process';
const commands = [
  { name: 'API', cwd: 'backend', command: 'npm', args: ['run', 'dev'] },
  { name: 'UI', cwd: 'frontend', command: 'npm', args: ['start'] }
];
const children = commands.map(({ name, cwd, command, args }) => {
  const child = spawn(command, args, { cwd, shell: process.platform === 'win32', stdio: 'inherit' });
  child.on('error', error => console.error(`${name} error:`, error.message));
  return child;
});
function stop() { for (const child of children) child.kill(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
