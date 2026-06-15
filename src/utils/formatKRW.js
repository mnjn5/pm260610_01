export function formatKRW(value) {
  const number = Number(value) || 0
  return `${number.toLocaleString('ko-KR')} KRW`
}
