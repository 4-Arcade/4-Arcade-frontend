const playerColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
];

/** 닉네임 해시 기반으로 8색 중 하나를 안정적으로 결정한다. */
export function colorOf(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = (hash * 31 + nickname.charCodeAt(i)) | 0;
  }
  return playerColors[Math.abs(hash) % playerColors.length];
}
