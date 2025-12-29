import { useState, useEffect } from 'react';
import { storage, FORMATS, formatText, type FormatId } from '../storage';

export function Popup() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [customFormat, setCustomFormat] = useState('{title} - {url}');
  const [feedback, setFeedback] = useState<{ formatId: FormatId | null; msg: string }>({ formatId: null, msg: '' });
  const [editingCustom, setEditingCustom] = useState(false);
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});


  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.title) setTitle(tab.title);
      if (tab?.url) setUrl(tab.url);
    });

    storage.get().then((settings) => {
      setCustomFormat(settings.customFormat);
    });

    chrome.commands.getAll().then((commands) => {
      const map: Record<string, string> = {};
      for (const cmd of commands) {
        if (cmd.name && cmd.shortcut) {
          map[cmd.name] = cmd.shortcut;
        }
      }
      setShortcuts(map);
    });
  }, []);

  const showFeedback = (formatId: FormatId, msg: string) => {
    setFeedback({ formatId, msg });
    setTimeout(() => setFeedback({ formatId: null, msg: '' }), 1500);
  };

  const handleCopy = async (formatId: FormatId) => {
    const format = FORMATS.find((f) => f.id === formatId);
    if (!format || !title || !url) return;

    const template = formatId === 'custom' ? customFormat : format.template;
    const text = formatText(template, title, url);

    try {
      await navigator.clipboard.writeText(text);
      showFeedback(formatId, '✅');
    } catch {
      showFeedback(formatId, '❌');
    }
  };

  const handleCustomFormatChange = async (value: string) => {
    setCustomFormat(value);
    await storage.setCustomFormat(value);
  };

  const getShortcut = (format: (typeof FORMATS)[number]) => {
    return shortcuts[format.command] || null;
  };

  return (
    <div className="w-72 p-3 text-sm">
      <h1 className="mb-2 text-base font-semibold">Better Copy Title And Link</h1>

      {/* 当前页面信息 */}
      <div className="mb-3 rounded bg-gray-100 p-2">
        <p className="truncate font-medium" title={title}>{title || '加载中...'}</p>
        <p className="truncate text-xs text-gray-500" title={url}>{url || ''}</p>
      </div>

      {/* 格式列表 */}
      <div className="space-y-1">
        {FORMATS.map((f) => (
          <div key={f.id}>
            <button
              onClick={() => handleCopy(f.id)}
              disabled={!title || !url}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-gray-100 disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <span>{f.icon}</span>
                <span>{f.name}</span>
                {feedback.formatId === f.id && (
                  <span className="text-xs">{feedback.msg}</span>
                )}
              </span>
              {getShortcut(f) && (
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                  {getShortcut(f)}
                </code>
              )}
            </button>

            {/* 自定义格式编辑 */}
            {f.id === 'custom' && (
              <div className="ml-7 mt-1">
                {editingCustom ? (
                  <input
                    type="text"
                    value={customFormat}
                    onChange={(e) => handleCustomFormatChange(e.target.value)}
                    onBlur={() => setEditingCustom(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingCustom(false)}
                    className="w-full rounded border px-2 py-1 text-xs"
                    placeholder="{title} {url}"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setEditingCustom(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {customFormat || '点击设置模板'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 快捷键设置链接 */}
      <div className="mt-3 border-t pt-2">
        <button
          onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
          className="text-xs text-blue-500 hover:underline"
        >
          自定义快捷键...
        </button>
      </div>
    </div>
  );
}
