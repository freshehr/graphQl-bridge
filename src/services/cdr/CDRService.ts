
import axios, {AxiosResponse} from "axios";
import {btoa} from "abab";
import CDRConfigs, {APIType, CDRProduct,} from "./CDRConfigs";


export class CDRConfig {
    name? : string
    type? : CDRProduct
    readonly url? : string
    username? : string
    password? :  string
    basicToken? : string
    apiType?: APIType }

export default class CDRService {
    config : CDRConfig
    
    constructor(name :string |undefined) {
        this.config = new CDRConfig();
        if (name !== undefined){
            this.setActiveCDR(name);
        }

    }
    // Strips control characters from a Json string
    // Useful for AQL which reads better formatted with newlines, tabs etc.
    // from https://gist.github.com/jamischarles/1046671
    static sanitizeJSON = (unsanitized : string) : string => unsanitized.replace(/\s\s+/g,' ');


    //Returns the formatted Rest URL endpoint
    restUrl = (resource : string) : string =>

    {
        switch (this.config.type) {
            case CDRProduct.Ehrscape || CDRProduct.Ethercis :
                return `${this.config.url}/${resource}`;

            case CDRProduct.EhrBase || CDRProduct.Ocean :
                return `${this.config.url}/${resource}`

            default:
                return `${this.config.url}/${resource}`
        }
    }

    // Sets the activeCDR to on of the current configs
    setActiveCDR = ( name :string |undefined) : void => {

        if (name !== undefined)
        {
            const config: CDRConfig | undefined = CDRConfigs.find(cdr => cdr.name === name);
            if (config !== undefined)
                this.config = config
        }
    }

    authHeader() : object {
        const auth : string = this.config.basicToken ? this.config!.basicToken : 'Basic ' + btoa(`${this.config.username}:${this.config.password}`)
        return  {'Authorization': `${auth}`}
    }

    async listRegisteredTemplates(): Promise<any> {
        try  {
            const url = this.restUrl(`template`);

            const response = await axios.get(url,
                {
                    headers : this.authHeader()
                },
            );
            return await response.data.templates;

        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    //Performs a simple check of a passed in username and password to see if they satisfy Basic Auth

    checkLogin(userName :string, password :string) : boolean {

        return userName === this.config.username && password === this.config.password

    }

    async createEhr(subjectId :string, subjectNamespace :string, otherDetails : object) :Promise<any>{
        try  {
            const response : AxiosResponse= await axios.post(this.restUrl(`ehr`),
                otherDetails,
                {
                    params : {
                        subjectId,
                        subjectNamespace
                    },
                    headers : this.authHeader()
                });
            return await response.data.ehrId;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async updateEhr(ehrId :string, otherDetails :string) : Promise<any>{
        try  {
            const response : AxiosResponse = await axios.put(this.restUrl(`ehr/status/${ehrId}`),otherDetails,
                {
                    headers : await this.authHeader()

                });
            return await response.data;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async findEhrBySubjectId(subjectId :string, subjectNamespace : string) : Promise<any> {
        try  {
            const response  : AxiosResponse= await axios.get(this.restUrl(`ehr`),
                {
                    params : {
                        subjectId,
                        subjectNamespace
                    },
                    headers : await this.authHeader()


                });
            return await response.data;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async findEhrIdBySubjectId(subjectId  :string, subjectNamespace  :string) {
        try  {
        const ehr = await this.findEhrBySubjectId(subjectId,subjectNamespace);
            return ehr.ehrId;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async listEhrs() : Promise<any> {
        const aqlString : string = `SELECT
                            e/ehr_id/value as ehrId, 
                            e/ehr_status/subject/external_ref/id/value as subjectId, 
                            e/ehr_status/subject/external_ref/namespace as subjectNamespace 
                            FROM EHR e`;
        try
        {
            return await this.runQuery(aqlString);
        }
        catch(e) {
            console.log(e.message)
        }
    }

    async runQuery(aqlString : string)  : Promise<any> {
        const sanitizedAql = CDRService.sanitizeJSON(aqlString);

        try  {
            const response = await axios.post(this.restUrl(`query`),
                {
                    aql: sanitizedAql,
                },
                {
                    headers : await this.authHeader()

                });
            return await response.data.resultSet;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async commitComposition(ehrId : string, format : string, templateId : string, committerName: string, composition: JSON)  : Promise<any> {
        try  {
            const response = await axios.post(this.restUrl(`composition`),
                composition,
                {
                    params : {
                        ehrId,
                        templateId,
                        format,
                        committerName
                    },
                    headers : await this.authHeader()
                });
            return await response.data.resultSet;
        }
        catch(e)
        {
            console.log(e.message)
        }
    }

    async listCompositions(ehrId : string)  : Promise<any>{

        let ehr_id_constraint : string = '';

        if (ehrId !== undefined)
            ehr_id_constraint = ` [ehr_id/value='${ehrId}']`;

        const aqlstring : string = `SELECT
                            e/ehr_id/value as ehrId, 
                            c/uid/value as compositionId,
                            c/name/value as compositionName 
                            FROM EHR e ${ehr_id_constraint}
                            CONTAINS  COMPOSITION c`;

        try
        {
            return await this.runQuery(aqlstring);
        }
        catch(e) {
            console.log(e.message)
        }
    }

}
