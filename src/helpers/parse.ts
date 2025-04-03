import { decode } from "@ffsm/serialize";

function normalize(value: string) {
  if (!value) {
    return "";
  }

  value = decode(value);

  if (["true", "false"].includes(value.toLowerCase())) {
    return value.toLowerCase() === "true";
  }

  const asNumber = Number(value);
  if (
    !Number.isNaN(asNumber) &&
    Number.isFinite(asNumber) &&
    asNumber !== Infinity &&
    asNumber !== -Infinity &&
    asNumber >= Number.MIN_SAFE_INTEGER &&
    asNumber <= Number.MAX_SAFE_INTEGER
  ) {
    return asNumber;
  }

  if (value === "null") {
    return null;
  }

  if (value === "undefined") {
    return undefined;
  }

  if (value === "NaN") {
    return NaN;
  }

  if (value === "Infinity") {
    return Infinity;
  }

  if (value === "-Infinity") {
    return -Infinity;
  }

  if (value === "[]") {
    return [];
  }

  if (value === "{}") {
    return {};
  }

  if (value.startsWith("{") && value.endsWith("}")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

export function parse(search: string) {
  search = search?.replace(/^\?|\#/, '');

  if (!search) {
    return {};
  }

  const rs: Record<string, unknown> = {};
  const parts = search.split('&');

  parts.forEach((part) => {
    let [key, value] = part.split('=');

    key = decode(key);
    value = normalize(value);

    if (!key || key === "" || key === "[]") {
      rs[key] = value;
    }

    if (!key.includes("[") || !key.endsWith("]")) {
      rs[decode(key)] = value;
      return;
    }

    const keys = key.split("[").map((k) => k.replace(/\]$/, ""));
    let target = rs;

    for (let i = 0; i < keys.length; i++) {
      const current = keys[i].trim();
      const isLast = i === keys.length - 1;

      if (!isLast) {
        const nextKey = keys[i + 1].trim();
        const isNextArray = nextKey === "" || !isNaN(Number(nextKey));
        const nextTarget = isNextArray ? [] : {};

        if (Array.isArray(target)) {
          target.push(nextTarget);
        } else {
          target[current] = nextTarget;
        }

        target = nextTarget;
      } else {
        if (Array.isArray(target[current])) {
          target[current].push(value);
        } else {
          target[current] = value;
        }
      }
    }
  });

  return rs;
}