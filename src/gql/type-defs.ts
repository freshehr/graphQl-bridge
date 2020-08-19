import {gql}  from 'apollo-server';

export default gql`

    scalar DateTime
    scalar JSON
    
    type Template {
        templateId : String!
        createdOn : DateTime
    }

    type AQLResultSet {
        rows : JSON
        columns : JSON
        q : String
    }

    enum CodeMeaning {
        PRIMARY
        SYNONYM
        CLASSIFICATION
    }
    
    enum CompositionFormat {
        XML
        JSON
        FLAT
        STRUCTURED
    }
    
    type Coding {
        code : String
        system : String
        version : String
        meaning : CodeMeaning
        display : String
    }
    
    type CodeableConcept {
        token : String
        text: String!
        codes : [Coding]
    }
    
    type Composition {
        header : CompositionHeader
        body : JSON
    }

    type CompositionHeader {
        format : CompositionFormat
        ehrId : String
        uid : String
        name : String!
        committerId : ID
        composerName: String
        composerID : String
        facilityName: String
        facilityId: String
        startTime : DateTime!
        templateId: String
    }
    
    type Query {
        """
        Test Message.
        """
        testMessage: String!
        
        listTemplates :[Template]
        aqlResultSet(aql : String, ehrId : String) : AQLResultSet
        listEhrs : [Ehr]
        listCompositions(ehrId: String) : [Composition]
        findEhr(ehrId : String) :Ehr
        findEhrBySubject(subjectId : String, subjectNamespace : String) :Ehr
        findComposition(ehrId: String, compositionID : String) : Composition
    }
    
    type Mutation {
        createEhr(subjectId :String, subjectNamespace : String) : Ehr
    }
    
    type Ehr {
        ehrId: String!
        subjectId: ID
        subjectNamespace: String
        queryable : Boolean!
        modifiable : Boolean!
        birthSex : String
        gender : String
        yearOfBirth : DateTime
        vitalStatus : String
    }
`
