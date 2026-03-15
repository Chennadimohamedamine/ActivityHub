
import  api from '../../auth/hooks/axiosConfig';


export const createActivity = async (data: any) => { 
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
        if (typeof value === "number") {
            formData.append(key, value.toString());
        } else {
            formData.append(key, value as any);
        }
    }
    });


  
  return api.post("/activities", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

export const followUser = async (userId: string) => {
  const response = await api.post(`/keepups/follow/${userId}`);
  return response.data;
}

export const unfollowUser = async (userId: string) => {
  const response = await api.delete(`/keepups/unfollow/${userId}`);
  return response.data;
}

export const getFeedActivities = async () => {
  const response = await api.get("/activities/feed");
  return response.data;
};

export const getExploreActivities = async () => {
  const response = await api.get("/activities/explore");
  return response.data;
};

export const saveActivity = async (activityId: string) => {
  const response = await api.post(`activities/save-activities/save/${activityId}`);
  return response.data;
};

export const unSaveActivity = async (activityId: string) => {
  const response = await api.delete(`activities/save-activities/unsave/${activityId}`);
  return response.data;
};

export const getSavedActivities = async () => {
  const response = await api.get("activities/save-activities");
  return response.data;
};

export const joinAnActivity = async (activityId: string) => {
   await api.post(`activities/${activityId}/join`)
}

export const leaveAnActivity = async (activityId: string) => {
  await api.delete(`activities/${activityId}/join`)
}

export const getAllCategories = async () => {
  const response = await api.get("/categories")
  const categories = response.data.map((categorie: any) => categorie.name);
  return categories;
}

export const getSearchedActivities = async ( q: string, category: string, location: string, sortBy: string, limit: number, page: number) => {
  const res = await api.get('/activities/search', {
    params: { q, category, location, sortBy, limit, page }
  });
  return res.data;
};

export const searchLocationsApi = async (query: string) => {
  const MAPBOX_TOKEN = import.meta.env.MAPBOX_TOKEN;
  const res = await api.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=ma&access_token=${MAPBOX_TOKEN}`)
  return res;
}