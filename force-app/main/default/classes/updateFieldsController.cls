/**********************************************************************
 * Author       :   MV Clouds
 * Date         :   24-03-2020
 * Description  :   Display Csv data and Update Csv data into Salesforce
***********************************************************************/

public with sharing class updateFieldsController {
    
    //Gets all standard and custom Object from salesforce
    @AuraEnabled(cacheable=true)
    public static List<string> getAllObject() {  
         List<String> sObjectList = new List<String>();
         
        System.debug('global==='+schema.getGlobalDescribe());
        System.debug('global==='+schema.getGlobalDescribe().values());

        for(Schema.SObjectType sObj : schema.getGlobalDescribe().values()){
            if(sObj.getDescribe().isUpdateable() && sObj.getDescribe().isAccessible()){
                sObjectList.add(sObj.getDescribe().getName()+','+sObj.getDescribe().getLabel());
            }
        }
        System.debug('obects===='+sObjectList);
        return sObjectList;
    }
    
    // Current user email address from salesforce 
	@AuraEnabled(cacheable=true)
    public static String getEmail() {    
        String email = UserInfo.getUserEmail();
        System.debug('User Info===='+email);
        return email;
    }    
    
    //Getting fields from salesforce using ObjectName
    @AuraEnabled
    public static List<pairWrapper1> getObjectSelectField(String ObjectName){
        List<pairWrapper> lstfieldname = new List<pairWrapper>();
        List<pairWrapper1> apiNameAndList = new List<pairWrapper1>(); 
        List<String> apiList = new List<String>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(ObjectName).getDescribe().fields.getMap();
      
        for (Schema.SObjectField fields: fieldMap.Values()) {  
            if(fields.getDescribe().isAccessible() && fields.getDescribe().isUpdateable()){
                schema.describefieldresult dfield = fields.getDescribe();
                
                pairWrapper field = new pairWrapper();
                
                field.label            = dfield.getLabel();
                field.apiName          = dfield.getName();
                field.fieldType        = String.valueOf(dfield.getType());
                field.fieldSize        = Integer.valueOf(dfield.getLength());
                field.refrence         = String.valueOf(dfield.getReferenceTo());
                field.formulaField     = dfield.getDefaultValueFormula();
                field.relationshipName = dfield.getRelationshipName();    

                 apiList.add(dfield.getName());
                // pairWrapper1 field1 = new pairWrapper1();
                // field1.apiNameList = dfield.getName();

                if(field.apiName == 'Id'){
                    lstfieldname.add(field);
                }else if(dfield.isUpdateable() == true &&  dfield.getType() != Schema.DisplayType.DATETIME && dfield.getType() != Schema.DisplayType.TIME){
                    lstfieldname.add(field);
                   

                }
            }
        }
        pairWrapper1 field1 = new pairWrapper1();


        field1.pairWrapperList = lstfieldname;
        field1.apiNameList = apiList;
        
        System.debug('lstfieldname===='+lstfieldname);
        System.debug('APiListName===='+apiList);
        apiNameAndList.add(field1);
        System.debug('apinameeee:::'+ apiNameAndList);

        // return lstfieldname;
        return apiNameAndList;
    }
    
    //  Get the csv data and make query for getting salesforce data
    @AuraEnabled
    public static List<wrapDataList> setQuery(List<String> selectedListOfFields,String selectObjectName,List<String> headerData,String tableData,String tablePushDataListJson, String FieldToUpdateList){
        
        System.debug('Set query called==============');
        System.debug('selectedListOfFields===='+selectedListOfFields);
        System.debug('selectObjectName======'+selectObjectName);
        System.debug('headerData======'+headerData);
        System.debug('tableData======'+tableData);
        System.debug('tablePushDataListJson======'+tablePushDataListJson);
        System.debug('FieldToUpdateList====='+FieldToUpdateList);


        Map<String, Integer> IndexFieldCSV = new Map<String, Integer>();
        
        Integer x = 0;
        for(String s : headerData){
            IndexFieldCSV.put(s, x);
            x++;
        }
        
        List<String>                    dataList                         = (List<String>)                   System.JSON.deserialize(tableData               , List<String>.class);
        List<uploadCsvFileJsonWrapper>  tablePushDataListJsonDeserialize = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(tablePushDataListJson   , List<uploadCsvFileJsonWrapper>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        
        Map<String,Set<String>>         keyValueMap     = new Map<String,Set<String>>();
        Map<String,Map<String,String>>  csvAllDataMap   = new Map<String,Map<String,String>>();
        
        for(uploadCsvFileJsonWrapper ucv:tablePushDataListJsonDeserialize){        
            keyValueMap.put(ucv.SObjectField, new Set<String>()); 
        }
        if(!selectedListOfFields.contains('Id')){
            selectedListOfFields.add('Id');
        }
        System.debug('selected field==='+selectedListOfFields);
        List<String> mnList = new List<String>();
        Integer j = 0;
        
        String strKey;
        Map<String,String> strValue = new Map<String,String>(); 
        Integer k = 0;
        SObjectType r = ((SObject)(Type.forName('Schema.'+selectObjectName).newInstance())).getSObjectType();
   		DescribeSObjectResult d = r.getDescribe();
        //Getting CSV data and storing it into *csvAllDataMap* map
        for(String data : dataList){
            strKey = ''; 
            strValue = new Map<String, String>();
            k = 0;
            data=data.trim(); 
            if(data != ''){  
                if(data.endsWith(',')) data += ' ';
                
                List<String> StringData = data.split(',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)');
                System.debug(StringData);
                for(uploadCsvFileJsonWrapper ucv : tablePushDataListJsonDeserialize){
                    if(IndexFieldCSV.get(ucv.csvfield)!=null){
                        if(keyValueMap.containskey(ucv.SObjectField)){
                            if(d.fields.getMap().get(ucv.SObjectField).getDescribe().isUpdateable() && d.fields.getMap().get(ucv.SObjectField).getDescribe().isAccessible()){
                                String fieldType = String.valueOf(d.fields.getMap().get(ucv.SObjectField).getDescribe().getType());
                            
                                if(fieldType == 'DATE'){
                                    strKey += String.valueOf(date.parse(StringData[IndexFieldCSV.get(ucv.csvfield)])).removeEnd(' 00:00:00').trim()+'^';
                                }else{
                                    if(StringData[IndexFieldCSV.get(ucv.csvfield)].trim().startsWith('"') && StringData[IndexFieldCSV.get(ucv.csvfield)].trim().endsWith('"')){
                                        System.debug(StringData[IndexFieldCSV.get(ucv.csvfield)].trim().removeStart('"').removeEnd('"'));
                                    	strKey += StringData[IndexFieldCSV.get(ucv.csvfield)].trim().removeStart('"').removeEnd('"')+'^';                                            
                                    }else{
                                      	strKey += StringData[IndexFieldCSV.get(ucv.csvfield)].trim()+'^';     
                                    }
                                }
                                keyValueMap.get(ucv.SObjectField).add(StringData[IndexFieldCSV.get(ucv.csvfield)].trim());
                            }
                        }
                    }
                }
                // System.debug(keyValueMap);
                for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                    if(IndexFieldCSV.get(field.csvfield)!=null){
                        if(StringData[IndexFieldCSV.get(field.csvfield)].trim().startsWith('"') && StringData[IndexFieldCSV.get(field.csvfield)].trim().endsWith('"')){
                        	strValue.put('CSV' + field.csvfield , StringData[IndexFieldCSV.get(field.csvfield)].trim().removeStart('"').removeEnd('"'));    
                        }else{
                            strValue.put('CSV' + field.csvfield , StringData[IndexFieldCSV.get(field.csvfield)].trim());    
                        }                       
                    }
                }
                csvAllDataMap.put(strKey.removeEnd('^'), strValue);
            }
        }
        
        Set<String> listSql = new Set<String>();    
        String soqlQuer = 'SELECT ';
        
        //Mapping of fields which data have to save into which fields
        if(FieldToUpdateListWpr.size() > 0){
            for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                if(field.SObjectField != null){
                    if(!listSql.contains(field.SObjectField)){
                        listSql.add(field.SObjectField);
                    }
                }
            }
        }
        
        //Selected fields from CSV to making condition for fetching record
        if(tablePushDataListJsonDeserialize.size() > 0){
            for(uploadCsvFileJsonWrapper field : tablePushDataListJsonDeserialize){
                if(field.SObjectField != null){
                    if(!listSql.contains(field.SObjectField)){
                        listSql.add(field.SObjectField);
                    }
                }
            }
        }
        
        //Showing the fields which data have to Showing from salesforce
        if(selectedListOfFields != null && selectedListOfFields.size() > 0){
            for(String fd : selectedListOfFields){
                if(!listSql.contains(fd)){
                    listSql.add(fd);
                }
            }
        }
        
        
        List<String> lstFetchField = new List<String>();
        lstFetchField.addAll(listSql);
        String allstring = string.join(lstFetchField,',');

        soqlQuer += allstring;
        soqlQuer += ' FROM ' +selectObjectName+ ' WHERE ';
        
        //****************************************** Where condition start from here ***********************************!!
        
        //Getting schema of selected Object
   		
        integer i=0;
        for(String st1 : keyValueMap.keyset()){
            String whereStr = '(';
            String fieldType = String.valueOf(d.fields.getMap().get(st1).getDescribe().getType());        
            for(String s : keyValueMap.get(st1)){
                if(s != null && s != ''){
                	if(fieldType == 'NUMBER' || fieldType == 'DOUBLE' || fieldType == 'Boolean' || fieldType == 'CURRENCY' || fieldType == 'DATETIME' || fieldType == 'PERCENT' || fieldType == 'TIME'){
                        whereStr += s+',';
                    }else if(fieldType == 'DATE'){
                        whereStr += String.valueOf(date.parse(s))+',';    
                    }else{
                        if(s.contains('\'')){
                            whereStr += '\''+s.replace('\'', '\\\'')+'\',';
                        }else{
                            whereStr += '\''+s+'\',';
                        }
                    }
                }
            }
            whereStr = whereStr.removeEnd(',') + ')';
            if(i==0){
                soqlQuer += st1 + ' IN ' + whereStr;
            }else{
                soqlQuer += ' AND ' + st1 + ' IN ' + whereStr;
            }
            i++;
        }
        
        List<ContentWorkspace> ws = [SELECT Id, RootContentFolderId FROM ContentWorkspace WHERE Name = 'Mass Update' LIMIT 1];
        if(ws.isEmpty()){
            ContentWorkspace wsf = new ContentWorkspace();
            wsf.Name = 'Mass Update';
            try{
                insert wsf;                                 
            }catch(Exception e){
                // Folder Existed
            }
        }
        
        List<wrapDataList> listData = new List<wrapDataList>();
        listData.add(new wrapDataList(soqlQuer, csvAllDataMap));
        System.debug('ListData====='+listData);
        return listData;
    }
    
    
    // Get data from salesforce and match with csv data
    @AuraEnabled
    public static Map<String,Map<String,String>> setSFData(String selectObjectName, Map<String,Map<String,String>> csvData, String query, String tablePushDataListJson, List<String> headerData, String FieldToUpdateList, List<String> selectedListOfFields){
        System.debug('csvData==='+csvData);
        System.debug('query======'+query);
        System.debug('tablePushDataListJson==='+tablePushDataListJson);
        System.debug('headerData==='+headerData);
        System.debug('FieldToUpdateList==='+FieldToUpdateList);
        System.debug('selectedListOfFields===='+selectedListOfFields);



        List<uploadCsvFileJsonWrapper>  tablePushDataListJsonDeserialize = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(tablePushDataListJson   , List<uploadCsvFileJsonWrapper>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        

        System.debug('tablePushDataListJsonDeserialize==='+tablePushDataListJsonDeserialize);
        System.debug('FieldToUpdateListWpr====='+FieldToUpdateListWpr);

        	
      
        if(!selectedListOfFields.contains('Id'))    selectedListOfFields.add('Id');
        
        Map<String, Integer> IndexFieldCSV = new Map<String, Integer>();
        Integer x = 0;
        for(String s : headerData){
            IndexFieldCSV.put(s, x);
            x++;
        }
        try {
            List<SObject> SObjectList = database.query(query);  
            
            Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(selectObjectName).getDescribe().fields.getMap();
            
            Map<String, SObject> abcList = new Map<String, SObject>();
            
            for(SObject s : SObjectList){
                string id =''; 
                // Creating Id for data from coming from salesforce
                for(uploadCsvFileJsonWrapper ucv : tablePushDataListJsonDeserialize){
                    if(IndexFieldCSV.get(ucv.csvfield) != null){
                        if(fieldMap.get(ucv.SObjectField).getDescribe().getType() == Schema.DisplayType.DATE){
                            id += String.valueOf(s.get(ucv.SObjectField)).removeEnd(' 00:00:00') + '^';
                        }
                        else if(fieldMap.get(ucv.SObjectField).getDescribe().getType() == Schema.DisplayType.DATETIME){
                            System.debug('Date Time Field Not Supported');
                        }
                        else{
                        	id += s.get(ucv.SObjectField)+'^';
                        }
                    }
                }
                id = id.removeEnd('^');
                abcList.put(id, s);
                    
            }
            for(String str : abcList.keyset()){
                if(csvData.containsKey(str)){
                    Map<String,String> lstStr = csvData.get(str);
                    SObject lstSalesforce = abcList.get(str);
             
                    for(String a : selectedListOfFields){
                        if(lstSalesforce.get(a) != null ){
                            if(fieldMap.get(a).getDescribe().getType() == Schema.DisplayType.DATETIME){
                                
                            }else if(fieldMap.get(a).getDescribe().getType() == Schema.DisplayType.DATE){
                                lstStr.put('SF' + a , String.valueOf(Date.valueOf(lstSalesforce.get(a))));
                            }else{
                                lstStr.put('SF' + a , lstSalesforce.get(a)+'' );
                            }
                        }else{
                            lstStr.put('SF' + a , '' ); 
                        }
                    }
                    csvData.put(str,lstStr);
                }
            }
        } catch (Exception e) {
            System.debug('Error ' + e.getMessage() + e.getLineNumber());
        }

        // System.debug('csvData')
        return csvData;
    }
    
    // It will set list of Sobject for updating data into salesforce
    @AuraEnabled
    public static String setSobjectList(Map<String,Map<String,String>> allData, String FieldToUpdateList, String selectObjectName){
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        List<SObject> objList = new List<SObject>(); 
       
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(selectObjectName).getDescribe().fields.getMap();
        
        Schema.SObjectType sobj1 = Schema.getGlobalDescribe().get(selectObjectName);
        
        for(Map<String,String> addMap : allData.values()){
            SObject sobj = sobj1.newSObject();
            System.debug(FieldToUpdateListWpr);
            for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                    if(addMap.get('CSV'+field.csvfield) != ''){
                        if(sobj.Id == null){
                            sobj.put('Id' , addMap.get('SFId'));
                        }
                        Schema.DisplayType fielddataType = fieldMap.get(field.SObjectField).getDescribe().getType();
                        if(fieldMap.get(field.SObjectField).getDescribe().isAccessible() && fieldMap.get(field.SObjectField).getDescribe().isUpdateable()){
                            if(fielddataType == Schema.DisplayType.PERCENT || fielddataType == Schema.DisplayType.CURRENCY || fielddataType == Schema.DisplayType.Double){
                                sobj.put(field.SObjectField, Decimal.valueof(addMap.get('CSV'+field.csvfield).trim()));
                            }
                            else if(fielddataType == Schema.DisplayType.DATE){
                                try{
                                    sobj.put(field.SObjectField, date.parse(addMap.get('CSV'+field.csvfield).removeEnd(' 00:00:00').trim()));      
                                }catch(Exception e){
                                    System.debug('Error ' + e.getMessage());
                                }
                            } 
                            else if(fielddataType == Schema.DisplayType.DATETIME){
                                // sobj.put(field.SObjectField, DATETIME.valueof(lstStr.get(listCSv)));  
                            }
                            else if(fielddataType == Schema.DisplayType.TIME){
                                sobj.put(field.SObjectField, addMap.get('CSV'+field.csvfield).trim());  
                            }
                            else if(fielddataType == Schema.DisplayType.Boolean){
                                sobj.put(field.SObjectField, Boolean.valueof(addMap.get('CSV'+field.csvfield).trim()));  
                            }
                            else{
                                sobj.put(field.SObjectField, addMap.get('CSV'+field.csvfield));  
                                System.debug(addMap.get('CSV'+field.csvfield));
                            }                            
                        }                        
                    }
            }   
            if(sobj.Id != null){
                objList.add(sobj);    
            }
        }
        return JSON.serialize(objList);
    }
    
    // this method will update data using batch class
    @AuraEnabled
    public static void insertCSVtoSF(String data, String FieldToUpdateList, String selectObjectName){

        List<SObject>                   dataList             = (List<SObject>)                   System.JSON.deserialize(data, List<SObject>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr = (List<uploadCsvFileJsonWrapper>)  System.JSON.deserialize(FieldToUpdateList, List<uploadCsvFileJsonWrapper>.class);
        
        List<String> csvField = new List<String>();
        
        csvField.add('Id');
        for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
            if(field.SObjectField != 'Id' && !csvfield.contains(field.SObjectField)){
             	csvfield.add(field.SObjectField);   
            }
        }    
        String strcsvfield = string.join(csvfield,',');
        
        UpdateSobjectBatchable updateSObject = new UpdateSobjectBatchable(dataList, strcsvfield, selectObjectName, csvField);
        Database.executeBatch(updateSObject);
    }
    
    public class pairWrapper{
        @AuraEnabled public String label{get; set;}
        @AuraEnabled public String apiName{get; set;}
        @AuraEnabled public String fieldType{get; set;}
        @AuraEnabled public Integer fieldSize{get; set;}
        @AuraEnabled public String refrence{get; set;}
        @AuraEnabled public String formulaField{get; set;}
        @AuraEnabled public String relationshipName{get; set;}
        @AuraEnabled public String NotUpdatable{get; set;}

    }


    // -----------jenish gangani
public class pairWrapper1{
        @AuraEnabled public List<string> apiNameList{get; set;}
        @AuraEnabled public List<pairWrapper> pairWrapperList{get; set;}

    }
    // -----------jenish gangani

    
    public class uploadCsvFileJsonWrapper{
        @AuraEnabled public String csvfield{get; set;}  
        @AuraEnabled public String operator{get; set;}  
        @AuraEnabled public String SObjectField{get; set;}
    }
    
    public class wrapDataList{
        @AuraEnabled public String theQuery{get;set;}
        @AuraEnabled public Map<String,Map<String,String>> theMap{get;set;}
        
        public wrapDataList(String theQuery, Map<String,Map<String,String>> theMap){
            this.theQuery   = theQuery;
            this.theMap    = theMap;
        }
    }
    
    public class wrapDataSecond{
        @AuraEnabled public List<SObject> theList{get;set;}
        @AuraEnabled public Map<String,Map<String,String>> theMap{get;set;}
        
        public wrapDataSecond(List<SObject> theList, Map<String,Map<String,String>> theMap){
            this.theList   = theList;
            this.theMap    = theMap;
        }
    }
}