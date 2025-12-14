import { storage, FORMATS, COMMAND_TO_FORMAT, formatText } from '../storage';

chrome.commands.onCommand.addListener(async (command) => {
  const formatId = COMMAND_TO_FORMAT[command];
  if (!formatId) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.title || !tab?.url || !tab?.id) return;

  const format = FORMATS.find((f) => f.id === formatId);
  if (!format) return;

  let template = format.template;
  if (formatId === 'custom') {
    const settings = await storage.get();
    template = settings.customFormat;
  }

  const text = formatText(template, tab.title, tab.url);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy: string, formatName: string) => {
        navigator.clipboard.writeText(textToCopy);
        const id = 'copy-title-toast';
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = id;
        const truncated = textToCopy.length > 80 ? textToCopy.slice(0, 80) + '...' : textToCopy;
        toast.innerHTML = `<div style="font-family:Georgia,serif;font-size:14px;color:#181818;margin-bottom:6px">已复制 · ${formatName}</div><div style="font-size:12px;color:#87867F;word-break:break-all;line-height:1.4">${truncated}</div>`;
        Object.assign(toast.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '14px 18px',
          borderRadius: '12px',
          backgroundColor: '#F9F9F7',
          border: '1px solid #E8E6DC',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: '2147483647',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'opacity 0.3s',
          maxWidth: '320px',
        });
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 2000);
      },
      args: [text, format.name],
    });
  } catch {
    // Fallback to notification if script injection fails
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/icons/icon-48.png'),
      title: 'Lovpen Copy Title',
      message: '❌ 复制失败',
    });
  }
});
