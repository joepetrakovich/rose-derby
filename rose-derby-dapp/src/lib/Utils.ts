export function truncateWithCenterEllipses(str: string, maxLength: number) {
  if (!str) {
    return '';
  }
  
  if (str.length <= maxLength) {
    return str;
  }

  const ellipsis = '...';
  const ellipsisLength = ellipsis.length;

  const midpoint = Math.ceil(maxLength / 2);
  const charsToShowBeforeEllipsis = Math.floor((maxLength - ellipsisLength) / 2);
  const charsToShowAfterEllipsis = maxLength - charsToShowBeforeEllipsis - ellipsisLength;

  const truncatedString =
    str.substr(0, charsToShowBeforeEllipsis) +
    ellipsis +
    str.substr(str.length - charsToShowAfterEllipsis);

  return truncatedString;
}

export function blockTimestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp * BigInt(1000)));
}
