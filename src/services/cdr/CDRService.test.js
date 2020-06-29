import CDRService from './CDRService';

const serviceNames = ['c4h_nutshell','ethercis_cloud'];
let cdrService;

beforeAll(() => {

    cdrService = new CDRService(serviceNames[0]);
});

test('returns SessionId', async () => {
    expect(await cdrService.getSessionId()).toBeDefined();
});

test('runs Query Post', async () => {
    expect(await cdrService.runQuery('select e/ehr_id/value from EHR e')).toBeDefined();
});

test('lists EHRs', async () => {
    expect( await cdrService.listEhrs()).toBeDefined();
});


it('lists Templates', async () => {
    expect( await cdrService.listRegisteredTemplates()).toBeDefined();
});

it('Finds Ehr by SubjectId', async () => {
    expect( await cdrService.findEhrBySubjectId('9999999068','uk.nhs.nhs_number')).toBeDefined();
});

test('Finds EhrId by SubjectId', async () => {
    const ehrId = await cdrService.findEhrIdBySubjectId('9999999400','uk.nhs.nhs_number');
    expect( ehrId).toBeDefined();
});

test('Creates New EHR', async () => {
    const ehrId = await cdrService.createEhr('9999999400','uk.nhs.nhs_number', {
        queryable: true,
        modifiable: true
    });
    expect( ehrId).toBeDefined();
});

test('Updates EHR', async () => {
    const data = await cdrService.updateEhr('cbee29e8-467b-4268-95d1-0789bb6d35bb',  {
        subjectId: "9999999400",
        subjectNamespace: "uk.nhs.nhs_number",
        queryable: true,
        modifiable: true
    });
    expect( data.action).toBe('UPDATE');
});

test('Commits FLAT JSON composition', async () => {
    const data = await cdrService.commitJSONComposition('cbee29e8-467b-4268-95d1-0789bb6d35bb',testTemplateId, testTemplatecomposition,'FLAT');
    expect( data.action).toBe('UPDATE');
});
