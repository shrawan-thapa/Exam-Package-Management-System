const xlReader = require("xlsx");
module.exports = function(workbook){
    var result = {};
    // console.log(getHeaders(workbook))
    //console.log(workbook.Sheets.Sheet1['!ref'])
    
    
    workbook.SheetNames.forEach(function(sheetName) {
       
        var roa = xlReader.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if(roa.length > 0){
            result[sheetName] = roa;
        }
    });
    return result;
}