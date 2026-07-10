import { BaseParams } from "@/types/api";

export const generateQueryString = (params: BaseParams = {}): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.append(key, String(v));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export const appendQueryString = (
  url: string,
  queryString?: string
): string => {
  if (!queryString) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${queryString}`;
};

export const updateBrowserQueryParams = (
  params: BaseParams
): void => {
  if (typeof window === "undefined") return;

  const queryString = generateQueryString(params);
  const newUrl = `${window.location.pathname}${
    queryString ? `?${queryString}` : ""
  }`;

  window.history.replaceState({}, "", newUrl);
};