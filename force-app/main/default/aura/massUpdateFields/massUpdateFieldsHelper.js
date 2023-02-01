({
    searchHelper : function(component,event,helper) {
        var action = component.get("c.getAllObject");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var arr = [];
                var storeResponse = response.getReturnValue();
                storeResponse.sort();
                // console.log('store======'+storeResponse);
                for(var i=0; i <storeResponse.length; i++){
                    arr.push({
                        value : storeResponse[i].split(',')[0],
                        label : storeResponse[i].split(',')[1]
                    });
                }               
                component.set("v.ObjectListMain", arr);
            }        
        });        
        $A.enqueueAction(action);    
        
    },
    
    getUserEmail : function(component,event, helper){
        
         var action = component.get("c.getEmail");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.UserEmail',response.getReturnValue());
            }           
        });        
        $A.enqueueAction(action);
    },
    
    onChangeObject : function(component,event, helper){
        component.set("v.IsSpinner", true); 
        var getFieldSet = component.get("c.getObjectSelectField");
        var selectedObject = component.get("v.selectedObject")+'';
        getFieldSet.setParams({
            "ObjectName" : selectedObject
        });
        getFieldSet.setCallback(this, function(response){
            var result = response.getState();
            if(result === 'SUCCESS' || result === 'DRAFT'){
                component.set("v.fieldList",response.getReturnValue());
            }else{
                component.set("v.IsSpinner", false); 
                helper.showToast(component,"Error", "Failed!", "Error accur, Something went wrong OnChangeObject");
            }
        }); 
        $A.enqueueAction(getFieldSet);  
        component.set("v.IsSpinner", false); 
    },

    callNexthandle : function(component,event, helper){   
        console.log('table Data====='+component.get("v.tabledata"));
        console.log('length tab data ======'+component.get("v.tabledata").length);
        if(component.get("v.tabledata").length == 0){
            helper.showToast(component,"Info", "Info!", "Please Upload File");
        }else if(component.get("v.selectedObject") == ''){
            helper.showToast(component,"Info", "Info!", "Please Select Object First");
        }else{
            component.set("v.IsSpinner", true); 
            var selectedStep = event.getSource().get("v.value");
            var nextStep = selectedStep == 'Step1' ? 'Step2' : 'finished';
            
            var fieldToUpdateList = [];
            var headerData = component.get("v.header");
            var objectField = component.get("v.fieldList");

            console.log('headerData====='+headerData);
            console.log('header length====='+headerData.length);
            console.log('objectField======'+JSON.stringify(objectField));

            for(var i=0; i< headerData.length;i++){
                var data = {};
                data['csvfield'] = headerData[i];
                for(var j=0; j<objectField.length;j++){
                    if(headerData[i] == objectField[j].apiName || headerData[i] == objectField[j].label){
                        data['SObjectField'] = objectField[j].apiName;
                    }
                }
                fieldToUpdateList.push(data);
            }
            // console.log('field to Update List===='+fieldToUpdateList);
            component.set('v.FieldToUpdateList', fieldToUpdateList);
			component.set("v.IsSpinner", false); 
            if(nextStep == 'finished'){
                component.set("v.finished", nextStep);
            }else{
                helper.addRowRecord(component,event, helper);
                component.set("v.currentStep", nextStep);
            }
        }        
    },

    onSelectAllChange : function(component, event, helper) {
        const myCheckboxes = component.find('checkboxfield'); 
        let chk = (myCheckboxes.length == null) ? [myCheckboxes] : myCheckboxes;
        if(component.get('v.isSelectAll') == false) {            
            chk.forEach(checkbox => checkbox.set('v.checked', component.get('v.isSelectAll')));
        }else{
            chk.forEach(checkbox => checkbox.set('v.checked', component.get('v.isSelectAll')));
        }
    },
    
    addRowRecord : function(component,event,helper){
        var tableListData = component.get("v.tableListData");
        
        tableListData.push({
            'csvfield': '',
            'operator': '=',
            'SObjectField': ''
        });
        component.set("v.tableListData", tableListData);
    },
    
    addRowMapRecord : function(component,event,helper){
        var selDataList     = component.get("v.FieldToUpdateList");
        selDataList.push({
            'csvfield': '',
            'SObjectField': ''
        });
        component.set("v.FieldToUpdateList", selDataList);  
    },
    
    deleteRowRecord : function(component,event,helper){
        
        var tableDataList = component.get("v.tableListData");
        var index = event.getSource().get('v.name');
        
        tableDataList.splice(index, 1);
        
        component.set("v.tableListData", tableDataList);          
    },
    deleteMapRowRecord : function(component,event,helper){
        
        var selDataList = component.get("v.FieldToUpdateList");
        var index = event.getSource().get('v.name');
        
        selDataList.splice(index, 1);
        
        component.set("v.FieldToUpdateList", selDataList);          
    },
    
    
    setSobject : function(component,event,helper, ResultOfAllData, sfPushDataListJson, selectObjectName){
        
        var action = component.get('c.setSobjectList'); 
        
        action.setParams({
            'allData'               : ResultOfAllData, 
            'FieldToUpdateList'     : sfPushDataListJson,
            'selectObjectName'      : selectObjectName,
        });
        action.setCallback(this, function(response){
            var result = response.getState();
            if(result == 'SUCCESS'){
                var res = response.getReturnValue();
                component.set("v.updateFieldList",res);
            }else{
                helper.showToast(component,"Error", "Failed!", "Error accur, Something went wrong setSobject");
            }
            component.set("v.IsSpinner", false);    
        });
        $A.enqueueAction(action);
    },
    
    getSobjectList : function(component, event, helper, resultdata, query, selectObjectName, tablePushDataListJson, headerData, sfPushDataListJson, selectedListOfFields){
        
        var pageSize = component.get('v.pageSize');
        var pageNumber = component.get('v.pageNumber');
        
        var action =  component.get("c.setSFData");
        action.setParams({
            'selectObjectName'      : selectObjectName,
            'csvData'               : resultdata,
            'query'                 : query,
            'tablePushDataListJson' : tablePushDataListJson,
            'headerData'            : headerData,
            'FieldToUpdateList'     : sfPushDataListJson,
            'selectedListOfFields'  : selectedListOfFields,
        });
        action.setCallback(this, function(response){
           var state = response.getState();
           
           if(state === 'SUCCESS' || state === 'DRAFT'){ 
                var fieldHeaderListing = [],SFData = [], CSVData = [];
                var ResultOfAllData = response.getReturnValue();

                console.log('ResultOfAllData===='+ResultOfAllData);
                var i = 0;                
                
                for(var key in ResultOfAllData){
                    
                    if(i < Object.keys(ResultOfAllData[key]).length){
                        fieldHeaderListing = [];
                        i = Object.keys(ResultOfAllData[key]).length;
                        var sfid = 0;
                        var srno = {};
                        srno['label'] = "Sr No";
                        srno['fieldName'] = "SrNo";
                        srno['type'] = "text";
                        srno['initialWidth'] = 70;
                        fieldHeaderListing.push(srno);
                        for(var val in ResultOfAllData[key]){
                            if(val.startsWith("SFId")){
                                sfid++;
                                var data = {};
                                data['label'] = val.replace('SF','');
                                data['fieldName'] = val;
                                data['type'] = 'url'; 
                                data['typeAttributes'] = {label:{fieldName:val},target:'_blank'};                               
                                fieldHeaderListing.push(data);
                            }
                        }
                        var csvCount = 0, sfCount = 0;
                        for(var val in ResultOfAllData[key]){
                            if(val.startsWith("SF")){
                                if(val !== "SFId"){
                                    sfCount++;
                                    var data = {};
                                    data['label'] = val.replace('SF','');
                                    data['fieldName'] = val;
                                    data['type'] = 'text';
                                    data['cellAttributes'] = {class: {fieldName:'sfcols'}};
                                    fieldHeaderListing.push(data);
                                }
                            }
                        }
                        for(var val in ResultOfAllData[key]){
                            if(val.startsWith("CSV")){
                                csvCount++;
                                var data = {};
                                data['label'] = val.replace('CSV','');
                                data['fieldName'] = val;
                                data['type'] = 'text';
                                data['cellAttributes'] = {class: {fieldName:'csvcols'}};
                                fieldHeaderListing.push(data);
                            }
                        }
                    }
                }
                var ListData = [], TempListData = [], srno = 1;
                for(var key in ResultOfAllData){
                    var data = {};
                    data['SrNo'] = srno+'';
                    for(var val in ResultOfAllData[key]){
                        if(val == 'SFId'){
                        	data[val] = '/'+ResultOfAllData[key][val];
                        }else{
                            data[val] = ResultOfAllData[key][val];    
                        }                     
                        if(val.startsWith('SF')){
                            data['sfcols'] = 'sfcol';
                        }else{
                            data['csvcols'] = 'csvcol';
                        }
                    }	
                    srno++;
                    ListData.push(data);  
                    if(TempListData.length < pageSize){
                        TempListData.push(data);
                    }
                }
                if(sfid==0){
                    helper.showToast(component,"Info", "Info!", "Could not found data");
                }
                if(ListData.length <= pageSize*(pageNumber)){
                    component.set('v.isLastPage',true);     
                }else{
                    component.set('v.isLastPage',false); 
                }
                var totalSize = ListData.length/pageSize;
                component.set("v.totalPage", totalSize);
                component.set("v.sfId", sfid);
                component.set("v.columns", fieldHeaderListing);
                component.set('v.ResultOfAllData',ListData); 
                component.set("v.dataSize", ListData.length);
                component.set('v.TableLightningData',TempListData); 
                
                helper.setSobject(component, event, helper, ResultOfAllData, sfPushDataListJson, selectObjectName);
                
            }else{
                component.set("v.IsSpinner", false); 
                helper.showToast(component,"Error", "Failed!", "Error accur, Something went wrong getSobjectList");
            }
           
        });
        $A.enqueueAction(action);
    },
     
    nextWriteQuery : function(component,event,helper){
        console.log('next write query called====');
        component.set("v.IsSpinner", true); 
        var selectedFieldsListArray = [];
        var action =  component.get("c.setQuery");
        var selectObjectName = component.get("v.selectedObject");
        var headerData = component.get('v.header');
        var tableData = component.get('v.tabledata');
        var tablePushDataList = component.get('v.tableListData');
        var sfPushData = component.get('v.FieldToUpdateList');
        var pageNumber = component.get('v.pageNumber');
        var pageSize = component.get('v.pageSize');
        
        var checkedBox = component.find('checkboxfield');
        for (var i = 0; i < checkedBox.length; i++) {
            if (checkedBox[i].get("v.checked") == true && checkedBox[i].get("v.name") != null) {
                selectedFieldsListArray.push(checkedBox[i].get("v.name"));
            }
        }
        
        var tableDataString       = JSON.stringify(tableData); 
        var tablePushDataListJson = JSON.stringify(tablePushDataList); 
        var sfPushDataListJson = JSON.stringify(sfPushData);
        
        action.setParams({
            'selectedListOfFields'  : selectedFieldsListArray,
            'selectObjectName'      : selectObjectName,
            'headerData'            : headerData,
            'tableData'             : tableDataString,
            'tablePushDataListJson' : tablePushDataListJson,
            'FieldToUpdateList'     : sfPushDataListJson,
        });
        
        action.setCallback(this, function(response){
            var resultFull = response.getState();
            
            if(resultFull === 'SUCCESS' || resultFull === 'DRAFT'){ 
                var res = response.getReturnValue(); 
                var result = res[0];
                helper.getSobjectList(component, event, helper, result['theMap'], result['theQuery'], selectObjectName, tablePushDataListJson, headerData, sfPushDataListJson, selectedFieldsListArray);
                
            }else{
                component.set("v.IsSpinner", false); 
                helper.showToast(component,"Error", "Failed!", "Error accur, Something went wrong nextWritequery");
            } 
        });
        $A.enqueueAction(action);
    },
    
    saveRecordData : function(component, event,helper){
        component.set("v.IsSpinner", true); 
        var action = component.get('c.insertCSVtoSF');    
        var data = component.get("v.updateFieldList");
        var sfPushData = component.get('v.FieldToUpdateList');
        var selectObjectName = component.get("v.selectedObject");
        var sfPushDataListJson = JSON.stringify(sfPushData);
       
        action.setParams({
            'data'              : data, 
            'FieldToUpdateList' : sfPushDataListJson, 
            'selectObjectName'  : selectObjectName
        });
        action.setCallback(this, function(response){
            var status = response.getState();
            if(status == 'SUCCESS'){
                
            }else{
                component.set("v.IsSpinner", false);
                helper.showToast(component,"Error", "Failed!", "Error accur, Something went wrong saveRecordData");
            }
            component.set("v.IsSpinner", false); 
        });
        $A.enqueueAction(action);
    },
    showToast : function(component,type, title, message) {
        try{
        	var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "type": type,
                "title": title,
                "message": message
            });
            toastEvent.fire();    
        }catch(e){
            component.set('v.toastMsg',type);            
            component.set('v.toastDescMsg',message);    
            setTimeout(function() {
                component.set('v.toastMsg',null);
            	component.set('v.toastDescMsg',null);
            }, 5000);
        }        
    },
    
    pageRecord : function(component, event, helper){
        var result = component.get('v.ResultOfAllData');        
        var pageNumber = component.get('v.pageNumber');
        var pageSize = component.get('v.pageSize');
        var dataSize = component.get('v.dataSize');
        if(dataSize <= pageSize*(pageNumber)){
        	component.set('v.isLastPage',true);     
        }else{
            component.set('v.isLastPage',false); 
        }
        var temp = (pageNumber-1)*pageSize;
        var tempData = [];
        for(var i= temp; i<temp+pageSize ;i++){
            if(result[i] != '' && result[i] != null){
             	tempData.push(result[i]);   
            }
        }   
        component.set('v.TableLightningData',tempData); 
    }
})