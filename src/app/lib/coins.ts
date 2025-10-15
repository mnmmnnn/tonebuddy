const COINS_KEY = "tonebuddy_coins";
const RESET_KEY = "tonebuddy_last_reset";

// Проверка: выполняется ли код в браузере (а не на сервере при билде)
const isBrowser = () => typeof window !== "undefined";

// Сбрасывает счётчик монет раз в день
export function resetCoinsDaily() {
  if (!isBrowser()) return; // если нет window — выходим
  const today = new Date().toDateString();
  const last = localStorage.getItem(RESET_KEY);
  if (last !== today) {
    localStorage.setItem(RESET_KEY, today);
    localStorage.setItem(COINS_KEY, "10"); // 5 бесплатных анализов в день
  }
}

// Получаем количество оставшихся монет
export function getCoins(): number {
  if (!isBrowser()) return 10; // на сервере всегда возвращаем дефолт
  const v = localStorage.getItem(COINS_KEY);
  return v ? parseInt(v) : 10;
}

// Пробуем потратить одну монету, возвращаем true если получилось
export function trySpendCoin(): boolean {
  if (!isBrowser()) return true; // SSR: просто пропускаем
  const coins = getCoins();
  if (coins > 0) {
    localStorage.setItem(COINS_KEY, String(coins - 1));
    return true;
  }
  return false;
}
