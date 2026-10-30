// Reminders the phone shows while the game is closed. No server: the phone schedules them itself
// (Capacitor Local Notifications). In a browser it does nothing.
import { t } from './i18n.js';

const plugin = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function at(daysFromNow, hour, minute, base) {
  const d = new Date(base);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// What to remind about, given the save. Pure, so it can be tested.
export function planNotifications(save, now = new Date()) {
  const today = dayKey(now);
  const list = [];
  const rewardTaken = save.daily && save.daily.last === today;
  list.push({ id: 201, at: rewardTaken ? at(1, 10, 0, now) : at(0, 12, 0, now), title: t('note.reward.title'), body: t('note.reward.body') });
  const chDone = save.dailyCh === today;
  const chAt = chDone ? at(1, 19, 0, now) : at(0, 19, 0, now);
  list.push({ id: 202, at: chAt > now ? chAt : at(1, 19, 0, now), title: t('note.daily.title'), body: t('note.daily.body') });
  list.push({ id: 203, at: at(3, 19, 30, now), title: t('note.back.title'), body: t('note.back.body', { n: save.level || 1 }) });
  list.push({ id: 204, at: at(7, 19, 30, now), title: t('note.back7.title'), body: t('note.back7.body') });
  return list.filter((n) => n.at > now);
}

export async function scheduleNotifications(save) {
  const ln = plugin();
  if (!ln) return false;
  try {
    const pending = await ln.getPending();
    if (pending && pending.notifications && pending.notifications.length) await ln.cancel({ notifications: pending.notifications });
    if (save.notify === false) return true;
    const list = planNotifications(save).map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: true } }));
    await ln.schedule({ notifications: list });
    return true;
  } catch (e) {
    return false;
  }
}

// Asked once, at a moment the player is happy (after an early win).
export async function askNotificationPermission() {
  const ln = plugin();
  if (!ln) return 'unavailable';
  try {
    const r = await ln.requestPermissions();
    return r && r.display;
  } catch (e) {
    return 'error';
  }
}
