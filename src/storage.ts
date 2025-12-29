export type FormatId = 'url' | 'title' | 'title_url' | 'markdown' | 'custom';

export interface Settings {
  customFormat: string;
}

const STORAGE_KEY = 'copy-title-settings';

const DEFAULTS: Settings = {
  customFormat: '{title} - {url}',
};

export const storage = {
  async get(): Promise<Settings> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...DEFAULTS, ...result[STORAGE_KEY] };
  },

  async set(data: Partial<Settings>): Promise<void> {
    const current = await this.get();
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...current, ...data },
    });
  },

  async setCustomFormat(format: string): Promise<void> {
    await this.set({ customFormat: format });
  },
};

export const FORMATS = [
  { id: 'url' as const, name: '纯网址', icon: '🔗', template: '{url}', command: 'copy-url' },
  { id: 'title' as const, name: '纯标题', icon: '📝', template: '{title}', command: 'copy-title' },
  { id: 'title_url' as const, name: '标题, 网址', icon: '📋', template: '{title}, {url}', command: 'copy-title-url' },
  { id: 'markdown' as const, name: 'Markdown', icon: '📄', template: '[{title}]({url})', command: 'copy-markdown' },
  { id: 'custom' as const, name: '自定义', icon: '⚙️', template: '', command: 'copy-custom' },
];

export const COMMAND_TO_FORMAT = Object.fromEntries(
  FORMATS.map((f) => [f.command, f.id])
) as Record<string, FormatId>;

export function formatText(template: string, title: string, url: string): string {
  return template.replace(/{title}/g, title).replace(/{url}/g, url);
}
