({  
    showcsvdata :  function (component, event, helper){
        component.set('v.progress', 0);
        var fileInput = component.find("file").get("v.files");
        console.log('fileInput ======='+JSON.stringify(fileInput));
        console.log("file Input length====="+fileInput.length);
        var fileName = 'No File Selected..';
        var file = fileInput[0];
        console.log('file====='+JSON.stringify(file));
        console.log('length==='+event.getSource().get("v.files").length);
        if (event.getSource().get("v.files").length > 0) {
            var fName = event.getSource().get("v.files")[0]['name'];
        }
        
        if(fName.indexOf(".csv") !== -1){           
            console.log('fileName====='+fileName);
            
            component.set("v.fileName", fileName);
            console.log('filename===='+component.get("v.fileName"));

        	if (file) {
                component.set("v.showcard", true);                
                var tabledata=[];
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    var csv = evt.target.result;
                    if(csv.length > 4000000){
                        helper.showToast("Info", "Info!", "Please upload smaller size of csv file");
                    }else{
                        var rows = csv.split("\n");
                        var trimrow = rows[0].split(",");   
                        console.log('trimRow====='+trimrow);             
                        component.set("v.header",trimrow);                    
                        for (var i = 1; i < rows.length; i++) {
                            tabledata.push(rows[i]);
                        }
                        for(var j=0;j<=100;j++){
                            task(j);                                
                        }
                        function task(j) { 
                          setTimeout(function() { 
                        	component.set('v.progress',j);
                          }, 2*j);
                        }
                        component.set("v.tabledata",tabledata);  
                        console.log('tableData===='+tabledata.length);
                        var fileName = fName;
                        component.set("v.fileName",fileName);    
                        console.log('file Name After==='+fileName);
                    }
                                        
                }
            }
        }else{    
            helper.showToast("Info", "Info!", "Please upload only CSV file");
        }
    },     
})




// ({  
//     showcsvdata :  function (component, event, helper){
//         component.set('v.progress', 0);
//         var fileInput = event.getParam("files");

//         console.log('length of file======'+fileInput.length);
//         console.log('fileInput ======='+JSON.stringify(fileInput));
        
//         var fileName = 'No File Selected..';
//         var file = fileInput[0];
//         console.log('file input[0]==='+file['name']);

//         // console.log('file====='+JSON.stringify(file));
//         if (fileInput.length > 0) {
//             var fName = fileInput[0]['name'];
//         }
        
//         console.log('fname===='+fName);
//         console.log('fName.indexOf(".csv")===='+fName.indexOf(".csv"));
        
//         if(fName.indexOf(".csv") !== -1){        
//             component.set("v.fileName", fileName);
            
//         	if (file) {
//                 component.set("v.showcard", true);                
//                 var tabledata=[];
//                 var reader = new FileReader();
//                 reader.readAsText(file, "UTF-8");
//                 reader.onload = function (evt) {
//                     var csv = evt.target.result;
//                     console.log('csv.length====='+csv.length);
//                     if(csv.length > 4000000){
//                         helper.showToast("Info", "Info!", "Please upload smaller size of csv file");
//                     }else{
//                         var rows = csv.split("\n");
//                         var trimrow = rows[0].split(",");                
//                         component.set("v.header",trimrow);                    
//                         for (var i = 1; i < rows.length; i++) {
//                             tabledata.push(rows[i]);
//                         }
//                         for(var j=0;j<=100;j++){
//                             task(j);                                
//                         }
//                         function task(j) { 
//                           setTimeout(function() { 
//                         	component.set('v.progress',j);
//                           }, 2*j);
//                         }
//                         component.set("v.tabledata",tabledata);  
//                         var fileName = fName;
//                         component.set("v.fileName",fileName);    
//                         console.log('file Name After==='+fileName);
//                     }
                                        
//                 }
//             }
//         }else{    
//             helper.showToast("Info", "Info!", "Please upload only CSV file");
//         }
//     },     
// })