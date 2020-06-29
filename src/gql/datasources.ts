import  ApolloCDRService  from '../services/cdr/ApolloCDRService'

const dataSources = (): any => {
    return {
        cdrAPI:  new ApolloCDRService()
    }
}
export default dataSources
