import api from "./axios";

export interface SiteSearchParams {
  motCle?: string;
  categorie?: string;
  region?: string;
  tri?: string;
  asc?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const siteApi = {
  // GET /mboa/site
  getAll(params?: SiteSearchParams) {
    return api.get("/site", {
      params,
    });
  },

  updateReview(id: number, data: { note: number; commentaire: string }) {
    return api.put(`/avis/${id}`, data);
  },
  // GET /mboa/site/admin/{adminId}
  getByAdmin(adminId: number, params?: SiteSearchParams) {
    return api.get(`/site/admin/${adminId}`, { params });
  },


    // POST /mboa/img/uplaodImageSite/{idSite}
  addImage(siteId: number, file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`/img/uplaodImageSite/${siteId}`, formData);
  },

  // DELETE /mboa/img/{id}
  deleteImage(imageId: number) {
    return api.delete(`/img/${imageId}`);
  },


  // PUT /mboa/site/{id}
  update(id: number, site: object) {
    return api.put(`/site/${id}`, site);
  },

    // PUT /mboa/img/{id}/principal
  setMainImage(imageId: number) {
    return api.put(`/img/${imageId}/principal`);
  },
  
  // DELETE /mboa/site/{id}
  delete(id: number) {
    return api.delete(`/site/${id}`);
  },

  getAllComments(id: number) {
    return api.get(`/user/site/${id}/comments`);
  },

  deleteReview(id: number) {
    return api.delete(`/avis/${id}`);
  },

  getReviewsByUserApi(userId: number) {
    return api.get(`/avis/utilisateur/${userId}`);
  },

  addReview(data: {
    utilisateurId: number;
    siteId: number;
    note: number;
    commentaire: string;
  }) {
    return api.post("/avis/ajouter", data);
  },

  // GET /mboa/site/destination
  search(params?: SiteSearchParams) {
    return api.get("/site/destination", {
      params,
    });
  },

  // GET /mboa/site/{id}
  getById(id: number) {
    return api.get(`/site/${id}`);
  },
  //commentaire
  getComment(id: number) {
    return api.get(`/user/site/${id}/comment`);
  },
  // GET /mboa/site/{id}/details
  getDetails(id: number) {
    return api.get(`/site/${id}/details`);
  },

  // GET /mboa/site/{id}/stat
  getStatistics(id: number) {
    return api.get(`/site/${id}/stat`);
  },

  // POST /mboa/site/brouillon
  createDraft(site: object, images: File[]) {
    const formData = new FormData();

    formData.append("site", JSON.stringify(site));

    images.forEach((image) => {
      formData.append("images", image);
    });

    return api.post("/site/brouillon", formData);
  },

  // POST /mboa/site/publier
  createPublished(site: object, images: File[]) {
    const formData = new FormData();

    formData.append("site", JSON.stringify(site));

    images.forEach((image) => {
      formData.append("images", image);
    });

    return api.post("/site/publier", formData);
  },

  // PUT /mboa/site/{id}/modifPublier
  publish(id: number) {
    return api.put(`/site/${id}/modifPublier`);
  },

  // PUT /mboa/site/{id}/modifEtBrouillon
  draft(id: number) {
    return api.put(`/site/${id}/modifEtBrouillon`);
  },
};
