import axios from "axios";
export const searchSugget = async (apiKey: string, q: string, at: string)=>{
    try {
        const respone = await axios.get(`https://autosuggest.search.hereapi.com/v1/autosuggest?apikey=${apiKey}&q=${q}&at=${at}`);
        if(respone.status === 200)
        return respone.data.items
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.log('Error of aoxis:', error.response.data);
            throw new Error(`Error while fetching: ${error.response.data.message}`);
          } else {
            console.log('Error while fetching:', error);
            throw new Error('An unexpected error occurred while fetching.');
          }
    }
}