function setKeyDownInt(e){                  
    var key = e.charCode || e.keyCode || 0;
    if(key == 8 || key == 9 || key == 46 || (key >= 37 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105))
        return true; 
    else return false;
}

function setKeyDownDecimal(e){                  
    var key = e.charCode || e.keyCode || 0;
    if(key == 109 || key == 110 || key == 190 || key == 8 || key == 9 || key == 46 || (key >= 37 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105))
        return true; 
    else return false;
}