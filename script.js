// Los datos corresponden al dataset de la NASA en referencia al posible impacto de asteroides sobre la Tierra
// Adrián de la Cuadra García. PR_Visualización de Información
var data_url = "https://api.npoint.io/51bc35bdf5e1442782fc"; // API csv. Base de datos utilizada
var colors_url = "https://api.npoint.io/3266ae6981d322336989"; // Tabla de color leyenda peligrosidad
var data, Asteroides_colors;
d3.json(data_url, loadData); // D3

function loadData(json){
	
  data = sortData(json);
  
  d3.json(colors_url, function(colors){
    Asteroides_colors = colors;
    visualize();
  });
}

function visualize(){
	
  var h = 725;
  var w = 600;
  var size = 950;
  var r = size/8;
  var barWidth = w/data.length;
  var animTime = 1500;

  var radiusScale = d3.scale.sqrt() // Cálculo escala del radio gráfica en función a los posibles impactos
    .domain([0, d3.max(data, function(d){ return d.Posibles_Impactos })])
    .range([0, r*3]);
  
  var colorScale = d3.scale.ordinal()
    .domain(arrayFromProperty(Asteroides_colors,"Color_Impacto"))
    .range(arrayFromProperty(Asteroides_colors,"color"));
  
  var svg = d3.select("body")
    .append("svg")
      .attr("height", h)
      .attr("width", w)
      .style("margin", "0 0 0 "+35+"% ");
  
  var pie = d3.layout.pie()
    .value(function(d){ return d.Diametro; })
    .sort(null);
  
  var arc_zero = d3.svg.arc()
    .outerRadius(r)
    .innerRadius(r);
  
  var arc = d3.svg.arc()
    .outerRadius(function(d){ return r + radiusScale(d.data.Posibles_Impactos) })
    .innerRadius(r);

  var g = svg.append("g")
    .attr("transform", "translate("+350+","+480+") rotate(-180)");
  g.transition().duration(animTime)
    .attr("transform", "translate("+350+","+480+")");


  var bars = g.selectAll("g")
    .data(pie(data)).enter()
    .append("g")
    .attr("class", "bar")
    .attr("id", function(d,i){ return i });
  
  bars.append("path")
    .attr("d", arc_zero)
    .attr("stroke", "#FFF")
    .attr("fill", function(d){ return colorScale(d.data.Color_Impacto) })
    .transition().duration(animTime)
    .attr("d", arc);
  
  var circle = g.append("circle")
    .attr("fill", "#333")
    .attr("r", 1)
    .transition().duration(animTime)
    .attr("r", r-5);
  
  var title_default = "Posibles Impactos";
  var title = g.append("text")
      .text(title_default)
      .attr("xml:space", "preserve")
      .attr("text-anchor", "middle")
      .attr("font-size", size/40+"px")
      .attr("fill", "white");
  
  var subtitle_default = data.length + " Asteroides";
  var subtitle = g.append("text")
      .text(subtitle_default)
      .attr("xml:space", "preserve")
      .attr("text-anchor", "middle")
      .attr("font-family", "Lato, sans-serif")
      .attr("font-size", size/63+"px")
      .attr("fill", "white")
      .attr("y", size/40);
  
  var subtitle_family = g.append("text")
      .text("")
      .attr("xml:space", "preserve")
      .attr("text-anchor", "middle")
      .attr("font-family", "Lato, sans-serif")
      .attr("font-size", size/63+"px")
      .attr("fill", "white")
      .attr("y", size/20);
  // Interactividad
  bars.on("mouseover", function(d){  title.text(d.data.Objeto);
                                     subtitle.text(d.data.Posibles_Impactos+" posibles impactos");
                                     subtitle_family.text("D: "+d.data.Diametro+" km, V: "+d.data.Velocidad +" km/s");  });
  bars.on("mouseout",  function(d){  title.text(title_default);
                                     subtitle.text(subtitle_default);
                                     subtitle_family.text("");  });
}

function sortData(data){
  var filter = "Color_Impactos";
  
  //Ordenar por filtro
  data.sort(sortProperty(filter));

  //Romper la matriz de impactos
  var impacts = d3.nest()
    .sortValues(sortProperty(filter))
    .key(function(d) { return d.Color_Impacto; })
    .entries(data);
  
  //Ordenar los impactos. Filtro total
  impacts.forEach(function(Color_Impacto){
    Color_Impacto.Posibles_Impactos = 0;
    Color_Impacto.values.forEach(function(member){
      Color_Impacto.Posibles_Impactos += member.Posibles_Impactos;
    })
  });
  impacts.sort(sortProperty(filter));
  
  return flattenTree(impacts);
}

function flattenTree(tree){
  var arr = [];
  tree.forEach(function(e,i){
    arr.push(e.values);
  });
  
  if (arr[0] instanceof Array) 
    return d3.merge(arr);
  else
    return arr;
}

function arrayFromProperty(arr, prop){
  var new_arr = [];
  arr.forEach(function(value){
    new_arr.push(value[prop]);
  });
  return d3.set(new_arr).values();
}

function sortProperty(property){
  return (function(a, b) {
            if (a[property] < b[property])
              return 1;
            else if (a[property] > b[property])
              return -1;
            return 0;
          });
}