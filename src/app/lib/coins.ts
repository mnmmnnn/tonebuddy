const COINS_KEY = "tonebuddy_coins";
const RESET_KEY = "tonebuddy_last_reset";

export function resetCoinsDaily() {
  const today = new Date().toDateString();
  const last = localStorage.getItem(RESET_KEY);
  if (last !== today) {
    localStorage.setItem(RESET_KEY, today);
    localStorage.setItem(COINS_KEY, "5"); // 5 бесплатных на день
  }
}

export function getCoins(): number {
  const v = localStorage.getItem(COINS_KEY);
  return v ? parseInt(v) : 5;
}

export function trySpendCoin(): boolean {
  const coins = getCoins();
  if (coins > 0) {
    localStorage.setItem(COINS_KEY, String(coins - 1));
    return true;
  }
  return false;
}
