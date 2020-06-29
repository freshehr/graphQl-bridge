import axios from 'axios';
import https from "https";

class DemographicService {

    constructor (cdrService){
        this.cdrService = cdrService;
    }



    async queryPatients(queryParams) {
        try {

            const response = await axios.get(this.cdrService.restUrl('demographics/party/query'), ///?lastNames=**'
                {
                    params: queryParams,
                    headers: await this.cdrService.getAuthHeader()
                });
            return await response.data.parties;
        }
        catch (e) {
            console.log(e.message)
        }
    }

}

export default  DemographicService;
