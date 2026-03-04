export interface QuickCommand {
  key: string;
  label: string;
  description: string;
}

export const QUICK_COMMANDS: QuickCommand[] = [
  { key: 'model', label: '/model', description: 'Switch model' },
  { key: 'think', label: '/think', description: 'Deep thinking mode' },
  { key: 'new', label: '/new', description: 'Create new session' },
  { key: 'clear', label: '/clear', description: 'Clear current session' },
  { key: 'help', label: '/help', description: 'Show help' }
];

export function parseCommand(input: string): { command: string; args: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const [command = '', ...argParts] = trimmed.slice(1).split(' ');
  return {
    command,
    args: argParts.join(' ').trim()
  };
}

export function filterCommands(query: string): QuickCommand[] {
  if (!query.trim()) {
    return QUICK_COMMANDS;
  }

  const lower = query.toLowerCase();
  return QUICK_COMMANDS.filter((command) => command.key.includes(lower));
}
