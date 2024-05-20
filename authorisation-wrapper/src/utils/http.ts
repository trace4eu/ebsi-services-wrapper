export const httpCall = {
  post: async (
    url: string,
    data: string | URLSearchParams,
    options = {},
  ): Promise<Response> => {
    return await fetch(url, {
      method: "POST",
      body: data,
      ...options,
    });
  },

  get: async (url: string, options = {}): Promise<Response> => {
    return await fetch(url, {
      method: "GET",
      ...options,
    });
  },
};
