import { fetchUtils } from "react-admin";

const apiUrl = "http://localhost:10000/api/mod";

const httpClient = (url, options = {}) => {

  options.credentials = "include"; // Ensures cookies are sent with requests

  options.headers = new Headers({ Accept: "application/json" });

  if (!options.headers.has("Content-Type")) {
    options.headers.set("Content-Type", "application/json");
  }

  return fetchUtils.fetchJson(url, options);
};

const dataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const url = `${apiUrl}/${resource}?page=${page-1}&limit=${perPage}&sortField=${field}&sortOrder=${order}`;
    return httpClient(url).then(({ headers, json }) => {
      console.log("headers ==>",headers.get("Content-Range"))
      const total = parseInt(headers.get("Content-Range").split("/").pop(), 10)
      console.log("total ==>",total)
        ? parseInt(headers.get("Content-Range").split("/").pop(), 10)
        : 0 ; // Ensure that the total count is parsed as an integer
      return {
        data: json,
        total,  // Set the total count for pagination
      };
    });
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({ data: json })),
};

export default dataProvider;
