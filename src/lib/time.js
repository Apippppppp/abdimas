export const WIB = 'Asia/Jakarta';

const dateKeyFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: WIB, year: 'numeric', month: '2-digit', day: '2-digit',
});

export function jakartaDateKey(date) {
  return dateKeyFormat.format(date);
}
