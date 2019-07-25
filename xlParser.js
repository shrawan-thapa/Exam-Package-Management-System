const xlReader = require("xlsx");
module.exports = function(workbook){
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
        var roa = xlReader.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if(roa.length > 0){
            result[sheetName] = roa;
        }
    });
    return result;
}