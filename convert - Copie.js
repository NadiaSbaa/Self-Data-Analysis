console.log("Starting..");
document.getElementById("diva").hidden = true;

//features is the features of our CSV file
const features =[];
var emptyTab = 0;
const Names = [];

document.getElementById('fileInput').addEventListener('change', function() {
if (this.files.length === 0) {
 console.log('No file selected.');
 return;
}
const reader = new FileReader();
reader.onload = function fileReadCompleted() {
 // when the reader is done, the content is in reader.result.
 d =document.getElementById("delimiter").value ;
 arr = reader.result.split("\n").map(function(row){return row.split(d);})
 //features represente les features
 for(var i=0; i < arr[0].length ; i=i+1){
    features[i]= arr.map(x=>x[i]);
 }
 //Show the rest of the page
 document.getElementById("diva").hidden = false;
 document.getElementById("corImage").hidden = true;
 //Genrate the properties of the file
 generateFileProperties();
 //Add the name of the columns to all the selects in the page
 addFeatures(); 
 //Drow the MIN AVG MAX bar graph
 drowMinAVGMax();
 corrcoeffBest();

};
var ar = reader.readAsText(this.files[0]);
});

//Calcul all person correlation and choose the best one 
function corrcoeffBest(){
    // cor have all the correlations between numerical features
    insererTabHtml('pearsonCorrelatios',0,'Column 1','Column 2','Pearson Correlation');
    var cor = [];
    var f = [] ;
    var max = 0 ;
    var var1 = '' ;
    var var2 = '';
    for(var i=0; i < features.length ; i++){
        if (Names.indexOf(features[i][0]) != -1){
            f.push([].concat(features[i]));
        }
    }
    f = cleanVersion2(f);
    console.log("Pearson correlation ..");
    for(var i=0; i < f.length ; i++){
        
        for(var j=0; j < f.length ; j++){
            if ( i != j){
  
                var c = corrcoeff(convertToFloat(f[i]),convertToFloat(f[j])) ;
                insererTabHtml('pearsonCorrelatios',i+1,Names[i],Names[j],c);
                if (c > max){
                    max = c ;
                    var1 = Names[i];
                    var2 = Names[j];
                }
                cor.push(c);
            }
        }
    }
    var ch = "Maximum Pearson correlation is " +" between "+ var1 + " And "+ var2 + ":" + max ;
    console.log(ch);
    document.getElementById("maxPearsonCorr").innerHTML =  ch ;
 
    document.getElementById("labelHelp").innerHTML = "Guidelines to interpreting Pearson's correlation coefficient";
    
}

document.getElementById('help').addEventListener('click', function helpFunction() {
    document.getElementById("corImage").hidden = false;
    document.getElementById("help").hidden = true;
    document.getElementById("corImage").src = "MeaningPearson.png";
});

function insererTabHtml(s , i, contenu1, contenu2 , contenu3){
    var tableRef = document.getElementById(s).getElementsByTagName('tbody')[0];
    var newRow   = tableRef.insertRow(i);
    var cel1 = newRow.insertCell(0);
    cel1.innerHTML = contenu1  ;
    var cel1 = newRow.insertCell(1);
    cel1.innerHTML = contenu2 ;
    var cel1 = newRow.insertCell(2);
    cel1.innerHTML = contenu3 ;

}
//from string to float
function convertToFloat(elmt){
    var temp = [];
    for(var i=0 ; i <elmt.length ; i++){
        temp.push(Number.parseFloat(elmt[i]))
    }
    return temp ;
}

//range of an array
function range(elmt){
    var min = Math.min.apply(null, elmt);
    var max = Math.max.apply(null, elmt);
    return max - min;
}

//Generate explore
document.getElementById('exploreColumn').addEventListener('click', function exploreEachColumn() {
    var f1 =  document.getElementById("column3-select").value;
    //Show the details of a column
    details(matchNameFeatureToArrayFeature(f1));
   });

//Generate explore the dataset
document.getElementById('explore').addEventListener('click', function exploreColumns() {
    var tableRef = document.getElementById('headcolumns').getElementsByTagName('tbody')[0];
    if (emptyTab == 0){
    //There are no shown lines in the table
    //Show 5 lines of the data set
    for (var i=0 ; i < 6 ; i=i+1){
    var newRow   = tableRef.insertRow();
    for(var j=0 ; j < features.length; j++){
        var cel1 = newRow.insertCell(j);
        cel1.innerHTML = features[j][i] ;
    }}
    emptyTab = 1 ;
}

});


//Generate a line Graph
document.getElementById('line').addEventListener('click', function generateLineGraph() {
    var f1 =  document.getElementById("column1-select").value;
    var f2 =  document.getElementById("column2-select").value ;
    drowLine(matchNameFeatureToArrayFeature(f1),matchNameFeatureToArrayFeature(f2));
});

//Generate a Bar Graph per column
document.getElementById('BarPerColumn').addEventListener('click', function generateBARGraph() {
    var f1 =  document.getElementById("column3-select").value;
    var unique = matchNameFeatureToArrayFeature(f1).filter( onlyUnique ); 
    var elmt = [].concat(unique);
    elmt = clean(elmt) ;
    elmt.sort(function(a, b){return a-b});
    var t =[];
    for(var i=0 ; i < elmt.length ; i= i+1){
     t.push(countValues(matchNameFeatureToArrayFeature(f1),elmt[i])) ;     
    }
    if (elmt.length > 7){
        alert("This column contains too much classes . We are going to try a dynamic solution");
        divideIntoCategories(elmt,t);
     }
     else{
    drowBarColumn(elmt,t);
    }
    
});

//Generate a Bar Graph
document.getElementById('Bar').addEventListener('click', function generateLineGraph() {
    var f1 =  document.getElementById("column1-selectBar").value;
    var f2 =  document.getElementById("column2-selectBar").value ;
    drowBar(matchNameFeatureToArrayFeature(f1),matchNameFeatureToArrayFeature(f2));
});

function divideIntoCategories(elmt,t){
    //nombre de categorie
    var k = Math.round(Math.log2(elmt.length));
    var l = Math.round(elmt.length/k);
    var elmtcatego = [];
    var tcatego =[];
    var deb = 0 ;
    var moy = 0 ;
    var som = 0 ;
    for(var z=0 ; z < l ; z++){
        moy = 0 ;
        som = 0 ;
        for(var i=deb ; i < (z+1)*k ; i++){
            if (i == elmt.length ){
                break;
            }
            moy = moy + parseFloat(elmt[i]);
            som = som + t[i];
        }
        moy = moy / k;
        elmtcatego.push(Number.parseFloat(moy).toFixed(3)) ;
        tcatego.push(som);
        deb = deb + k;
        
    }
    if(elmtcatego.length > 8) {
        alert("Impossible! Dynamic solution fail");
    }
    else{
    drowBarColumn(elmtcatego,tcatego);
}}

function matchNameFeatureToArrayFeature(name){
    for(var i=0 ; i < features.length ; i= i+1){
        if (name.localeCompare(features[i][0].trim()) == 0){
            return features[i];
        }
    }
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
//test empty function 
function empty(data)
{
  if(typeof(data) == 'number' || typeof(data) == 'boolean')
  { 
    return false; 
  }
  if(typeof(data) == 'undefined' || data === null)
  {
    return true; 
  }
  if(typeof(data.length) != 'undefined')
  {
    return data.length == 0;
  }
  var count = 0;
  for(var i in data)
  {
    if(data.hasOwnProperty(i))
    {
      count ++;
    }
  }
  return count == 0;
}
//Remove the undefined rows
function clean(elmt){
    //The first line always have the name of the column 
    elmt.splice(0, 1);
    for( var i=0; i < elmt.length ; i++){
        if  ( empty(elmt[i]) || empty(elmt[i].toString() )){
            elmt.splice( elmt.indexOf(elmt[i]), 1 );
            i -- ;
        }
    }
    return elmt
}
//Remove the undefined rows
function cleanVersion2(f){
    //The first line always have the name of the column 
    for(var j=0 ; j< f.length ;j++){
        f[j].splice(0, 1);
    }
    for(var k=0 ; k < f.length ; k++){
    for( var i=0; i < f[k].length ; i++){
        if  ( empty(f[k][i]) || empty(f[k][i].toString() )){
            for(var j=0 ; j< f.length ;j++){
                f[j].splice(i,1 );
            }
            i -- ;
        }
    }}
    return f
}



function details(a){
    var unique = a.filter( onlyUnique ); 
    let elmt = [].concat(unique);
    elmt = clean(elmt) ;
    var val = false ;
    if (elmt.length > 10){
        val = confirm("This column contains "+elmt.length+" classes. Are you sure you want to explore it ?");
    }
    if( (elmt.length <10 ) || (val == true) ) {
            
    var tableLength = document.getElementById("eachcolumn").rows.length ;
    if ( tableLength!= 0){
        for(var i=0 ; i < tableLength ; i= i+1){
        document.getElementById("eachcolumn").deleteRow(0);
        }   
    }
    var tableRef = document.getElementById('eachcolumn').getElementsByTagName('tbody')[0];
    for(var i=0 ; i < elmt.length ; i= i+1){
        var newRow   = tableRef.insertRow();
        var cel1 = newRow.insertCell(0);
        cel1.innerHTML = elmt[i] ;
        var cel2 = newRow.insertCell(1);
        cel2.innerHTML = countValues(a,elmt[i]) ;      
    } 
    }
    var tableLength = document.getElementById('properties').rows.length ;
    if ( tableLength!= 0){
        for(var i=0 ; i < tableLength ; i= i+1){
        document.getElementById('properties').deleteRow(0);
        }   
    }
    if ( !isNaN(elmt[0])){
    addProperties(elmt); }
}

function getMinMaxAVGColumns(){
    var mins = [] ;
    var maxs = [] ;
    var avgs = [] ;
    for(var i=0; i < features.length ; i++){
        if (Names.indexOf(features[i][0]) != -1){
            var unique = features[i].filter( onlyUnique ); 
            let elmt = [].concat(unique);
            elmt = clean(elmt);
            mins.push(Number.parseFloat(Math.min.apply(null, elmt)).toFixed(3));
            maxs.push(Number.parseFloat(Math.max.apply(null, elmt)).toFixed(3));
            avgs.push(Number.parseFloat(getMean(elmt)).toFixed(3));
    }}
    return  [mins,avgs,maxs] ;
}
  

function addProperties(elmt){
    var tableRef = document.getElementById('properties').getElementsByTagName('tbody')[0];
   addProperty(tableRef, 'AVG', Number.parseFloat(getMean(elmt)).toFixed(3));
   addProperty(tableRef, 'SD', Number.parseFloat(sd(elmt)).toFixed(3));
   addProperty(tableRef, 'Lower Quartile Q1', Number.parseFloat(Quartile_25(elmt)).toFixed(3));
   addProperty(tableRef, 'Median', Number.parseFloat(Quartile_50(elmt)).toFixed(3));
   addProperty(tableRef, 'Upper Quartile Q3', Number.parseFloat(Quartile_75(elmt)).toFixed(3));
   addProperty(tableRef, 'Min', Number.parseFloat(Math.min.apply(null, elmt)).toFixed(3));
   addProperty(tableRef, 'Max', Number.parseFloat(Math.max.apply(null, elmt)).toFixed(3));
   addProperty(tableRef, 'Range', Number.parseFloat(range(elmt)).toFixed(3));

}
function addProperty(tableRef, nom,valeur){
    var newRow   = tableRef.insertRow();
    var cel1 = newRow.insertCell(0);
    cel1.innerHTML = nom ;
    var cel2 = newRow.insertCell(1);
    cel2.innerHTML =  valeur ;
}
function countValues(a, val){
    var c = 0 ;
    for(var i=0 ; i < a.length ; i= i+1){
        if (a[i] == val){
            c= c+1 ;
        }
    }
    return c ;
}
//Draw a bar
function drowBarColumn(elmt, t){
    var ctx = document.getElementById("graph3").getContext('2d')
    var data =[];
    for(var i=0 ; i < elmt.length ; i= i+1){
        var dt = [];
        for(var j=0 ; j < elmt.length ; j= j+1){
            if (i == j){
                dt.push(t[i]);
            }
            else 
            dt.push(0);
        }
        data.push({
            label : elmt[i],
            backgroundColor: getRandomColor(),
            data: dt,
        })
    }
    var data = {
        labels: elmt,
        datasets: data
    }
    var options
    var config = {
        type: 'bar',
        data: data,
        options: options
    }
    var graph3 = new Chart(ctx, config)
}

function drowMinAVGMax(){
    var MAM = getMinMaxAVGColumns();
    var ctx = document.getElementById("MinAvgMaxChart").getContext("2d");
    var data = {
        labels: Names,
        datasets: [
            {
                label: "Min",
                backgroundColor: getRandomColor(),
                data: MAM[0]
            },
            {
                label: "Average",
                backgroundColor: getRandomColor(),
                data: MAM[1]
            },
            {
                label: "Max",
                backgroundColor: getRandomColor(),
                data: MAM[2]
            }
        ]
    };
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            barValueSpacing: 20,
            scales: {
                yAxes: [{
                    type: 'logarithmic',
                    ticks: {
                        min: 0,
                    }
                }]
            }
        }
    });
}

function drowLine(feature1, feature2){
    var name = feature2[0]
    var copfeature2 = [].concat(feature2);
    copfeature2.splice(0,1);
    var ctx = document.getElementById("graph1").getContext('2d')
    var data = {
        labels: feature1.filter( onlyUnique ),
        datasets: 
        [
            {   borderColor: document.getElementById("BorderColorLine").value,
                backgroundColor: document.getElementById("BackgroundColorLine").value,
                borderWidth: document.getElementById("BorderWidthLine").value,
                label : name,
                data: copfeature2
            },
         ]
    }
    var options = {
        responsive: true,
        title: {
            display: true,
            text: 'Line Chart'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            x: {
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: feature1[0]
                }
            },
            y: {
                display: true,
                scaleLabel: {
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
                    },
                    labelString: feature2[0]
                }
            }
        }
    }
    var config = {
        type: 'line',
        data: data,
        options: options
    }
    var graph1 = new Chart(ctx, config)
}
//Draw a bar
function drowBar(feature1, feature2){
    name = feature2[0]
    let copfeature2 = [].concat(feature2) ;
    copfeature2.splice(0,1);
    var ctx = document.getElementById("graph2").getContext('2d')
    var data = {
        labels: [feature1[0]],
        datasets: 
        [
            {   borderColor: document.getElementById("BorderColorBar").value,
                backgroundColor: document.getElementById("BackgroundColorBar").value,
                borderWidth: document.getElementById("BorderWidthBar").value,
                label : name,
                data: copfeature2
            },
         ]
    }
    var options
    var config = {
        type: 'bar',
        data: data,
        options: options
    }
    var graph1 = new Chart(ctx, config)
}
//Generate a line Graph
function generateFileProperties(){
    let featuresName="File contiens "+features.length + " columns" ;
    document.getElementById("nbrcolumns").innerHTML = featuresName;
    const n = features[0].length -1;
    document.getElementById("nbrlignes").innerHTML = "File contiens "+ n +" lignes";
    featuresName = " Columns : "+ features[0][0] ;
    val = parseFloat(features[0][1]);
    if(!isNaN(val))
        Names.push(features[0][0]);
    for(var i =1 ; i< features.length; i= i+1)
        {
            featuresName = featuresName + " , " +features[i][0] ;
            val = parseFloat(features[i][1]);
            if(!isNaN(val))
                Names.push(features[i][0]);
        }
    document.getElementById("columns").innerHTML = featuresName;
}

//Compte missing values
function compteMissingValues(feature){
    let nb = 0 ;
    for(var i=0 ; i < feature.length ; i= i+1){
        if (feature[i].type == "NAN"){
            nb = nb+1 ;
        }
    }
    return nb;
}
//add features
function addFeatures(){
    var a = document.getElementsByTagName("select") ;
    for(var j = 0 ; j < a.length ; j ++){
        var x = a[j] ;
        for(var i=0 ; i < features.length ; i= i+1){
            var option = document.createElement("option");
            option.text = features[i][0];
            x.add(option);
        }
    }
}

function sd(data) {
    let m = getMean(data);
    return Math.sqrt(data.reduce(function (sq, n) {
            return sq + Math.pow(n - m, 2);
        }, 0) / (data.length - 1));
};
function getMean(data) {
    return data.reduce(function (a, b) {
        return Number(a) + Number(b);
    }) / data.length ;
};
//Quartiles
function Median(data) {
    return Quartile_50(data);
  }
  
  function Quartile_25(data) {
    return Quartile(data, 0.25);
  }
  
  function Quartile_50(data) {
    return Quartile(data, 0.5);
  }
  
  function Quartile_75(data) {
    return Quartile(data, 0.75);
  }
  
  function Quartile(data, q) {
    data=Array_Sort_Numbers(data);
    var pos = ((data.length) - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if( (data[base+1]!==undefined) ) {
      return data[base] + rest * (data[base+1] - data[base]);
    } else {
      return data[base];
    }
  }
  
  function Array_Sort_Numbers(inputarray){
    return inputarray.sort(function(a, b) {
      return a - b;
    });
  }
  //Get categories
  function getPossibleCategories(param, a, elmt){
     const number = []
     if (elmt.length > param){

     }
     for(var i=0 ; i < elmt.length ; i=i+1){
         number.push(countValues(a,elmt[i]))
     } 
  }
  //Get random color
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//display all options
function displayOptions() {
    var x = document.getElementById("column1-select");
    var t =[]
    var i;
    for (i = 0; i < x.options.length; i++) {
        t.push(x.options[i].value);
    }
    return t;
}



//Scatter Max
document.getElementById("ScatterMatrix").addEventListener('click',function generateScatter() {
//Get the file name
var f = document.getElementById('fileInput').value;
var words = f.split('\\');
Plotly.d3.csv(words[words.length -1], function(err, rows){

    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    var colors = [];
    numb =[0.5 , 0 , 1 , 0.25 , 0.75];
    comb =[];
    var unique = features[features.length-1].filter(onlyUnique);
    let elmt = [].concat(unique);
    elmt.splice(0, 1);
    for(var i=0 ; i < elmt.length ; i++){
        comb.push([elmt[i], numb[i]]);
    }
    for (var i=0; i < unpack(rows,features[features.length -1]).length; i++) {
        for(var j=0 ; j < comb.length ; j++){
      if (unpack(rows, features[features.length -1])[i] == comb[j][0]) {
        colors.push(comb[j][1]);
      }}
    }

    var pl_colorscale=[
               [0.0, '#19d3f3'],
               [0.333, '#19d3f3'],
               [0.333, '#e763fa'],
               [0.666, '#e763fa'],
               [0.666, '#636efa'],
               [1, '#636efa']
    ]
    
    var axis = () => ({
      showline:false,
      zeroline:false,
      gridcolor:'#ffff',
      ticklen:4
    })
    var dimensions =[];
    var n =displayOptions().length
    if (n > 5){
        n = 5;
    }
    for(var j=0 ; j< n  ; j++){
        var s ={label: displayOptions()[j], values:unpack(rows,displayOptions()[j])}
        dimensions.push(s);
    }
    var data = [{
      type: 'splom',
      dimensions: dimensions,
      text: unpack(rows, 'class'),
      marker: {
        color: colors,
		colorscale:pl_colorscale,
        size: 7,
        line: {
          color: 'white',
          width: 0.5
        }
      }
    }]

    var layout = {
      title:'Data set',
      height: 800,
      width: 800,
      autosize: false,
      hovermode:'closest',
      dragmode:'select',
      plot_bgcolor:'rgba(240,240,240, 0.95)',
      xaxis:axis(),
      yaxis:axis(),
      xaxis2:axis(),
      xaxis3:axis(),
      xaxis4:axis(),
      yaxis2:axis(),
      yaxis3:axis(),
      yaxis4:axis()
    }
    Plotly.react('myDiv', data, layout)

})
});
function pearson(elmt1, elmt2) {

   var moy1 = getMean(elmt1);
   var moy2 = getMean(elmt2);
   var p = 1 ; var q1 = 1 ; var q2 = 1 ;
   var max = elmt1.length;
   for(var i=0 ; i < max ; i++){
        q1 = q1* Math.pow( elmt1[i] - moy1, 2);
        q2 = q2* Math.pow( elmt2[i] - moy2, 2);
    }
    q1 = Math.sqrt(q1);
    q2 = Math.sqrt(q2);

   for(var i=0 ; i < max ; i++){
        p = p *(( elmt1[i] - moy1 ) * ( elmt2[i] - moy2));
    }


    return p / (q1*q2)
    }

    stdev = function stdev(arr, flag) {
        return Math.sqrt(variance(arr, flag));
    }

    mean = function mean(arr) {
        return sum(arr) / arr.length;
    };

    sum = function sum(arr) {
        var sum = 0;
        var i = arr.length;
        while (--i >= 0)
          sum += arr[i];
        return sum;
       
    };
      
    covariance = function covariance(arr1, arr2) {
        var u = mean(arr1);
        var v = mean(arr2);
        var arr1Len = arr1.length;
        var sq_dev = new Array(arr1Len);
        var i;
      
        for (i = 0; i < arr1Len; i++)
          sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);
      
        return sum(sq_dev) / (arr1Len - 1);
    };

    // (pearson's) population correlation coefficient, rho
    corrcoeff = function corrcoeff(arr1, arr2) {
        return covariance(arr1, arr2) /
            stdev(arr1, 1) /
            stdev(arr2, 1);
    };

    variance = function variance(arr, flag) {
        return sumsqerr(arr) / (arr.length - (flag ? 1 : 0));
    };

    sumsqerr = function sumsqerr(arr) {
        var mn = mean(arr);
        var sum = 0;
        var i = arr.length;
        var tmp;
        while (--i >= 0) {
          tmp = arr[i] - mn;
          sum += tmp * tmp;
        }
        return sum;
      };
      