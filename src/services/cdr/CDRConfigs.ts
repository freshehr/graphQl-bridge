import {CDRConfig} from "./CDRService";

export enum CDRProduct {
    Better,
    Ethercis,
    Dips,
    EhrBase,
    Code24,
    Cabolabs,
    Ocean,
    Ehrscape = 7,
}

export enum APIType {
    openEHR,
    Ehrscape,
    Dips,
    Code24,
    Cabolabs,
    Ocean,
}


const CDRConfigs : CDRConfig[] =[
    {
        name: 'c4h_e',
        type: CDRProduct.Ehrscape,
        url: 'https://cdr.code4health.org/rest/v1',
        username: '82a0395f-6556-4fe3-990a-c265a9cd6cb4',
        password: '$2a$10$619ki',
        basicToken: 'Basic ODJhMDM5NWYtNjU1Ni00ZmUzLTk5MGEtYzI2NWE5Y2Q2Y2I0OiQyYSQxMCQ2MTlraQ==',
        apiType: APIType.Ehrscape
    },
    {
        name: 'c4h_r',
        type: CDRProduct.Better,
        url: 'https://cdr.code4health.org/rest/openehr/v1',
        username: '82a0395f-6556-4fe3-990a-c265a9cd6cb4',
        password: '$2a$10$619ki',
        basicToken: 'Basic ODJhMDM5NWYtNjU1Ni00ZmUzLTk5MGEtYzI2NWE5Y2Q2Y2I0OiQyYSQxMCQ2MTlraQ==',
        apiType: APIType.openEHR
    },
    {
        name: 'ehrbase',
        type: CDRProduct.EhrBase,
        url: 'http://localhost:8080/ehrbase/rest/openehr/v1',
        username: 'SuperSecretPassword',
        password: '$2a$10$7RUqg',
        basicToken: 'Basic ZWhyYmFzZS11c2VyOlN1cGVyU2VjcmV0UGFzc3dvcmQ=',
        apiType: APIType.openEHR
    },

];

export default CDRConfigs;

