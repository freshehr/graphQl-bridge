// src/MoviesAPI.ts

import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import CDRService  from "./CDRService";
import {APIType} from "./CDRConfigs";


class ApolloCDRService extends RESTDataSource {
    private cdrService: CDRService

    willSendRequest(request: RequestOptions) {
        if (this.cdrService.config.basicToken != null) {
            request.headers.set('Authorization', this.cdrService.config.basicToken);
        }
    }

    activateCDR(cdrName: string) {
        this.cdrService.setActiveCDR(cdrName)
    }

    constructor() {
        super()
        this.cdrService = new CDRService('c4h_r')
        this.baseURL = this.cdrService.restUrl('')
    }

    // Strips control characters from a Json string
    // Useful for AQL which reads better formatted with newlines, tabs etc.
    // from https://gist.github.com/jamischarles/1046671
    sanitizeAQL = (unsanitized: string): string => unsanitized.replace(/\s\s+/g, ' ');


    async listTemplates() {

        if (this.cdrService.config.apiType === APIType.openEHR) {

            const response = await this.get('definition/template/adl1.4');
            return Array.isArray(response)
                ? response.map((template: any) => {
                    //      console.log(JSON.stringify(template))
                    return {
                        templateId: template.template_id,
                        createdOn: template.created_timestamp,
                    }
                })
                : [];

        } else {
            const response = await this.get('template');
            return Array.isArray(response.templates)
                ? response.templates.map((template: any) => {
                    return {
                        templateId: template.templateId,
                        createdOn: template.createdOn,
                    }
                })
                : [];

        }
    }

//     addEhrFilter (aql : string, ehrId : string|undefined) : string
// {
//        if (ehrId) {
//            return ` ${aql} where e/ehr_id/value = ${ehr_id}`
//        }
//        return aql
// }

    async runAQL(aqlString: string, ehrId: string) {


        if (this.cdrService.config.apiType === APIType.openEHR) {

            const response = await this.post(`query/aql`, {q: this.sanitizeAQL(aqlString)});

            //    console.log(JSON.stringify(response.rows))
            return {q: response.q, rows: response.rows, columns: response.columns}

        } else {
            const response = await this.post(`query`, {aql: this.sanitizeAQL(aqlString)});


            //    console.log(JSON.stringify(response))
            return {q: response.executedAql, rows: response.resultSet, columns: response.columns}

        }
    }

    async listEhrs() {


        const aqlString: string = `SELECT
                            e/ehr_id/value as ehrId, 
                            e/ehr_status/subject/external_ref/id/value as subjectId, 
                            e/ehr_status/subject/external_ref/namespace as subjectNamespace
                            FROM EHR e`;

        if (this.cdrService.config.apiType === APIType.openEHR) {

            const response = await this.post('query/aql', {q: this.sanitizeAQL(aqlString)});
            return Array.isArray(response.rows)
                ? response.rows.map((row: any) => {
                    console.log(JSON.stringify(row))
                    return {
                        ehrId: row[0],
                        subjectId: row[1],
                        subjectNamespace: row[2],
                    }
                })
                : [];

        } else {
            const response = await this.post('query', {aql: this.sanitizeAQL(aqlString)});
            return Array.isArray(response.resultSet)
                ? response.resultSet.map((row: any) => {
                    return {
                        ehrId: row.ehrId,
                        subjectId: row.subjectId,
                        subjectNamespace: row.subjectNamespace,
                    }
                })
                : [];

        }
    }


    async findEhr(ehrId: String) {

        if (this.cdrService.config.apiType === APIType.openEHR) {

            const response = await this.get(`ehr/${ehrId}`)
            console.log(JSON.stringify(response))

            return {
                ehrId: response.ehr_id.value,
                subjectId: response.ehr_status.subject.external_ref.id.value,
                subjectNamespace: response.ehr_status.subject.external_ref.namespace,
                queryable: response.ehr_status.is_queryable,
                modifiable: response.ehr_status.is_modifiable,
            }

        } else {

            const response = await this.get(`ehr/${ehrId}`);
            return {
                ehrId: response.ehrId,
                subjectId: response.ehrStatus.subjectId,
                subjectNamespace: response.ehrStatus.subjectNamespace,
                queryable: response.ehrStatus.queryable,
                modifiable: response.ehrStatus.modifiable,
            }
        }

    }

    async findEhrBySubject(subjectId: String, subjectNamespace: string) {

        if (this.cdrService.config.apiType === APIType.openEHR) {


            const response = await this.get('ehr', {subject_id: subjectId, subject_namespace: subjectNamespace});
            return {
                ehrId: response.ehr_id.value,
                subjectId: response.ehr_status.subject.external_ref.id.value,
                subjectNamespace: response.ehr_status.subject.external_ref.namespace,
                queryable: response.ehr_status.is_queryable,
                modifiable: response.ehr_status.is_modifiable,
            }

        } else {

            const response = await this.get('ehr', {subjectId: subjectId, subjectNamespace: subjectNamespace})
            return {
                ehrId: response.ehrId,
                subjectId: response.ehrStatus.subjectId,
                subjectNamespace: response.ehrStatus.subjectNamespace,
                queryable: response.ehrStatus.queryable,
                modifiable: response.ehrStatus.modifiable,
            }
        }

    }


    populateEhrBody(subjectId: string, subjectNamespace: string) {
       return {
            _type: "EHR_STATUS",
            subject: {
                external_ref: {
                    id: {
                        _type: "GENERIC_ID",
                        value: subjectId,
                        scheme: subjectNamespace
                    },
                    namespace: subjectNamespace,
                    type: "PERSON"
                }
            },
            is_modifiable: "true",
            is_queryable: "true"
        }
    }


        async createEHR(subjectId: string, subjectNamespace: string) {

        const body = this.populateEhrBody(subjectId,subjectNamespace)

        if (this.cdrService.config.apiType === APIType.openEHR) {
            try {
                const response = await this.post('ehr', body, {headers : {prefer : 'return=representation'}})

                return {subjectId :subjectId, ehrId : response.ehr_id.value }
            }
            catch(e)
            {
                console.log(e.message)
            }


        } else {
            const response = await this.post('ehr', {subjectId : subjectId , subjectNamespace: subjectNamespace}, );
            return {ehrId : response.ehrId}

        }
    }


}

export default ApolloCDRService