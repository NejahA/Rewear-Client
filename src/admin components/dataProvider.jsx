import { fetchUtils } from "react-admin";

const apiUrl = ""+import.meta.env.VITE_GITHUB_URI+"/api/mod";

const httpClient = (url, options = {}) => {

  options.credentials = "include"; // Ensures cookies are sent with requests

  options.headers = new Headers({ Accept: "application/json" });

  if (!options.headers.has("Content-Type")) {
    options.headers.set("Content-Type", "application/json");
  }

  return fetchUtils.fetchJson(url, options);
};
const convertToFormData = (data, resource) => {
  const formData = new FormData();

  // Append non-file fields
  Object.keys(data).forEach((key) => {
    if (key === "itemPics" || key === "profilePic") return; // skip file fields for now
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key]);
    }
  });

  // Append files
  if (resource === "items" && Array.isArray(data.itemPics)) {
    data.itemPics.forEach((pic) => {
      if (pic.rawFile instanceof File) {
        formData.append("itemPics", pic.rawFile); // key must match what backend expects
      }
    });
  }

  if (resource === "users" && Array.isArray(data.profilePic) && data.profilePic[0]?.rawFile instanceof File) {
    formData.append("profilePic", data.profilePic[0].rawFile);
  }

  return formData;
};

const isMultipart = (resource, data) =>
  (resource === "items" && Array.isArray(data.itemPics)) ||
  (resource === "users" && Array.isArray(data.profilePic));

  

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

  // create: (resource, params) =>
  //   httpClient(`${apiUrl}/${resource}`, {
  //     method: "POST",
  //     body: JSON.stringify(params.data),
  //   }).then(({ json }) => ({ data: json })),

    
  create: (resource, params) => {
    const isForm = isMultipart(resource, params.data);
    const body = isForm ? convertToFormData(params.data, resource) : JSON.stringify(params.data);

    return httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body,
      headers: isForm ? undefined : new Headers({ "Content-Type": "application/json" }),
    }).then(({ json }) => ({ data: json }));
  },

  
  update: (resource, params) => {
    const isForm = isMultipart(resource, params.data);
    const body = isForm ? convertToFormData(params.data, resource) : JSON.stringify(params.data);

  const options = {
    method: "PUT",
    body,
    credentials: "include", // <-- assure l’envoi des cookies
  };

  if (!isForm) {
    options.headers = new Headers({ "Content-Type": "application/json" });
  }

  return httpClient(`${apiUrl}/${resource}/${params.id}`, options)
    .then(({ json }) => ({ data: json }));

    // return httpClient(`${apiUrl}/${resource}/${params.id}`, {
    //   method: "PUT",
    //   body,
    //   credentials: "include",

    //   headers: isForm ? undefined : new Headers({ "Content-Type": "application/json" }),
    // }).then(({ json }) => ({ data: json }));
  },
  

  // update: (resource, params) =>
  //   httpClient(`${apiUrl}/${resource}/${params.id}`, {
  //     method: "PUT",
  //     body: JSON.stringify(params.data),
  //   }).then(({ json }) => ({ data: json })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({ data: json })),
};

export default dataProvider;
