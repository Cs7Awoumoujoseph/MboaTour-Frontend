import api from "./axios"

export const categorieApi = {
  getAll() {
    return api.get("/restCat")
  },
}