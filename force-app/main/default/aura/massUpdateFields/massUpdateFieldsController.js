({
    doinit: function (component, event, helper) {
        component.set("v.IsSpinner", true);
        helper.searchHelper(component, event, helper);
        helper.getUserEmail(component, event, helper);
        component.set("v.IsSpinner", false);

        console.log('object main====>' + component.get("v.ObjectListMain"));
    },

    onblur: function (component, event, helper) {
        component.set("v.listOfSearchRecords", null);
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },

    // function for clear the Record Selection 
    clear: function (component, event, helper) {
        helper.clear(component, event, helper);
    },

    // This function call when the end User Select any record from the result list.   
    handleComponentEvent: function (component, event, helper) {
        helper.handleComponentEvent(component, event, helper);
    },

    onChangeObject: function (component, event, helper) {
        helper.onChangeObject(component, event, helper);
    },

    callNexthandle: function (component, event, helper) {
        helper.callNexthandle(component, event, helper);
    },

    onSelectAllChange: function (component, event, helper) {
        helper.onSelectAllChange(component, event, helper);
    },

    dragAndDropBar: function (component, event, helper) {
        var selectedStep2 = event.getSource().get("v.value");
        var nextStep = 'Step1';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    mapFieldBar: function (component, event, helper) {
        var selectedStep2 = event.getSource().get("v.value");
        var nextStep = 'Step2';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    updateFieldBar: function (component, event, helper) {
        var selectedStep3 = event.getSource().get("v.value");
        var nextStep = 'Step3';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    previousClikButton: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        console.log('selectstep=====' + selectedStep);
        var nextStep = selectedStep == 'Step2' ? 'Step1' : 'finished';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            // --------------------------------------------------------- jenish gangani
            // $A.get('e.force:refreshView').fire();
            // let lastname = sessionStorage.getItem('key');
            // console.log('lastnammeata:::' + lastname);
            // csv
            helper.deleteRowRecord(component, event, helper);
            // --------------------------------------------------------- jenish gangani
            component.set("v.currentStep", nextStep);

        }
    },

    PreviousStep2: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        var nextStep = selectedStep == 'Step3' ? 'Step2' : 'finished';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    addRow: function (component, event, helper) {
        helper.addRowRecord(component, event, helper);
    },

    addMapRow: function (component, event, helper) {
        helper.addRowMapRecord(component, event, helper);
    },

    deleteRow: function (component, event, helper) {
        helper.deleteRowRecord(component, event, helper);
    },

    deleteMapRow: function (component, event, helper) {
        helper.deleteMapRowRecord(component, event, helper);
    },

    callNextButton: function (component, event, helper) {

        console.log('next Button called');
        var validateSelect;
        if (component.find("selectDropValues") != undefined) {
            validateSelect = component.find("selectDropValues").reduce(function (validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
            }, true);
        }

        var tablePushDataList = component.get('v.tableListData');
        var sfPushData = component.get('v.FieldToUpdateList');

        if (tablePushDataList.length < 1 && sfPushData.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Condition and One Mapping Field");
        } else if (tablePushDataList.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Condition");
        } else if (sfPushData.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Mapping Field");
        } else if (!validateSelect) {
            helper.showToast(component, "Error", "Error!", "Please Select All Fields");
        } else if (validateSelect) {
            var selectedStep = event.getSource().get("v.value");
            var nextStep = selectedStep == 'Step2' ? 'Step3' : 'finished';

            if (nextStep == 'finished') {
                component.set("v.finished", nextStep);
            } else {
                helper.nextWriteQuery(component, event, helper);
                component.set("v.currentStep", nextStep);
            }
        }
    },

    saveRecordsToSF: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        var nextStep = selectedStep == 'Step3' ? 'finished' : 'finished';

        if (nextStep == 'finished') {
            helper.saveRecordData(component, event, helper);
            component.set("v.currentStep", nextStep);
            component.set("v.finished", true);
        }
    },

    nextPageRecord: function (component, event, helper) {
        var pageNumber = component.get('v.pageNumber');
        component.set('v.pageNumber', pageNumber + 1);
        helper.pageRecord(component, event, helper);
    },

    prevPageRecord: function (component, event, helper) {
        var pageNumber = component.get('v.pageNumber');
        component.set('v.pageNumber', pageNumber - 1);
        helper.pageRecord(component, event, helper);
    },

    showSelectObjectHelp: function (component, event, helper) {
        if (component.get('v.selectObjectHelp')) {
            component.set('v.selectObjectHelp', false);
        } else {
            component.set('v.selectObjectHelp', true);
        }

    },

    showSelectFieldHelp: function (component, event, helper) {
        component.set('v.SelectFieldHelp', true);
    }
})