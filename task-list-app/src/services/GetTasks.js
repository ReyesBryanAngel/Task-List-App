import axios from "axios";

const getTasks = async (baseUrl, accessToken) => {
    try {
        const res = await axios.get(`${baseUrl}/api/items`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        return res.data.item;
      } catch (error) {
        console.error(error);
  
        return {};
      }
}

export {
    getTasks
}