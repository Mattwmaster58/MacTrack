export const API_SUFFIX = "/api";

const ApiEndpoints = {
  currentUser: `${API_SUFFIX}/current-user`,
  register: `${API_SUFFIX}/register`,
  filter: {
    list: `${API_SUFFIX}/filters/list`,
    update: `${API_SUFFIX}/filters/update`,
    create: `${API_SUFFIX}/filters/create`,
  },
  search: `${API_SUFFIX}/search`,
  signIn: `${API_SUFFIX}/sign-in`,
};

export { ApiEndpoints };
