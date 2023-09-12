import { ethers } from "ethers";
import { DateTime, type DateTimeFormatOptions } from "luxon"
import { Horse } from "./Models";

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

export default function formatEther(wei: bigint, precision: number = 2) {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];
  const num = parseInt(ethers.formatEther(wei));
  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  return num;
}

export const dateFormat: DateTimeFormatOptions = {...DateTime.DATETIME_SHORT, month: '2-digit', day: '2-digit', year: '2-digit'};

export const bigIntToHorse = (val: bigint) => Horse[Number(val)];
