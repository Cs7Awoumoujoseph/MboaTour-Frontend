import api from "./axios"

export const regionApi = {
  getAll() {
    return api.get("/restReg")
  },
}