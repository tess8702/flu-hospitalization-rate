$(function(){
    

  /// size variable
   var width = 600,
    	 height = 300;
    	var margin = {top: 50, right: 100, bottom: 50, left: 100};
    	var drawHeight=height-margin.top-margin.bottom;
    	var drawWidth=width-margin.left-margin.right;
 
    var ageOrderlist = ["0-4 yr", "5-17 yr", "18-49 yr", "50-64 yr", "65-74 yr", "75-84 yr", "85+", "Overall"];
    
    var svg = d3.select('#flu-hos-rate')
                  .append('svg')
                  //.attr('width', width)
                  //.attr('height', height)
                 .attr("preserveAspectRatio", "xMinYMin meet")
                 .attr("viewBox", [0, 0, width, height])
                 .style("overflow", "visible")
                 .classed("svg-content", true);
                 
     /// transform the canvas area
       var g=svg.append('g')
                .attr("transform","translate("+margin.left+","+margin.top+")")
                 .attr('height', drawHeight)
    				     .attr('width', drawWidth);
    				     
    				     
    				     
    				     

  d3.csv("data/LabConfirmedFluRateData.csv",function(error,masterData){
    
     console.log(masterData);
     
       var data= masterData.map(function(d){
            return{
              state:d.CATCHMENT,
              year:d["MMWR.YEAR"],
              week:d["MMWR.WEEK"],
              ageCategory:d.ageCategory,
              ageOrder:d.ageOrder,
              rate:d["WEEKLY.RATE"],
              show:(d.ageCategory=="Overall") ? true:false
            };
        
           }).filter(function(d2){
                return (d2.state=="California"|d2.state=="Minnesota") 
                & (d2.year=="2019"|d2.year=="2018")});
          
          
  
    
    console.log(data);
    
    // create the state dropdown
    var select_state=document.getElementById("state-name-select");
    var opts_state=d3.set(data.map(function(d){return d.state})).values().sort();
    
    for (var i=0;i< opts_state.length;i++){
      var opt=opts_state[i];
      var el=document.createElement("option");
      el.textContent=opt;
      el.value =opt;
      select_state.appendChild(el);
      
    } 
    
    
    
    // create the year dropdown
    var select_year=document.getElementById("mmwr-year-select");
    var opts_year=d3.set(data.map(function(d){return d.year})).values().sort();
    console.log(opts_year);
  
    for (var j=0; j< opts_year.length;j++){
      var opt_year=opts_year[j];
      var el_year=document.createElement("option");
      el_year.textContent=opt_year;
      el_year.value =opt_year;
      select_year.appendChild(el_year);
      
    } 
  
/// x axis group
       var xaxis=svg.append('g')
                     .attr('transform',
                           'translate('+margin.left+','+(margin.top+drawHeight)+')')
                     .attr('class','x-axis');
/// y axis group
        
       var yaxis=svg.append('g')
                     .attr('transform','translate('+margin.left+','+margin.top+')')
                     .attr('class',"y-axis");
                     
                     
        
/// x axis title settings (don't specify the text yet)
       var xTitle=svg.append("text")
                     .attr("class","axis-title")
                     .attr("transform",
                            "translate(" + (width/2) + " ," + 
                                           (height - margin.bottom/2+10) + ")")
                     .style("text-anchor", "middle")
                     .style("fill", "#f5f5f5");
                     
/// y axis title settings (don't specify the text yet)
       var yTitle=svg.append("text")
                      .attr("class","axis-title")
                      .attr("transform", "rotate(-90)")
                      .attr("y",  margin.left/2)
                      .attr("x",0 - (drawHeight*2)/3)
                      .attr("dy", "1em")
                      .style("text-anchor", "middle")
                      .style("fill", "#f5f5f5");

        
/// x axis position 
        var x=d3.axisBottom();
       
       
/// y axis position
        var y=d3.axisLeft();
    
    
/// x axis scale settings (don't specify the range and domain yet)
        var xLineScale=d3.scaleLinear();
        
/// y axis scale settings (don't specify the range and domain yet)
       var yLineScale=d3.scaleLinear();
       
/// color scale settings (don't specify the range and domain yet)       
       var color=d3.scaleOrdinal(); 
 
/// lengend group      
    
    var legend = svg.append("g")
                    .attr('transform','translate('+(drawWidth+80)+','+margin.top+')');



 
/// default loading line graph

    var e1 = document.getElementById("state-name-select").value;
    var e2 = document.getElementById("mmwr-year-select").value;
    filterData=data.filter(function(d){return d.state== e1 & d.year== e2})
                    .sort(function(a,b){
                         if(+a.week<+b.week)return -1;
                         if(+a.week>+b.week) return 1;
                         return 0;
                        });
    drawLine(filterData);       
    
/// Group the data by age group settings (don not specify the entries yet)
       var dataByAge=d3.nest()
                     .key(function(d){return d.ageCategory})
                     //.key(function(d){return d.show})
                     .sortKeys(function(a,b) {return ageOrderlist.indexOf(b) - ageOrderlist.indexOf(b)});
                     //.entries(filterData);
                     


////draw function

   function drawLine(filterData){
     
         dataByAge=d3.nest()
                     .key(function(d){return d.ageCategory})
                     //.key(function(d){return d.show})
                     .sortKeys(function(a, b) {return ageOrderlist.indexOf(b)-ageOrderlist.indexOf(a);})
                     .entries(filterData);
                     
         dataByAge2 = d3.nest()
                        .key(function(d) {return d.ageCategory})
                        .sortKeys(function(a, b) {return ageOrderlist.indexOf(b)-ageOrderlist.indexOf(a);})
                        .entries(filterData.filter(function(d2){return d2.show===true}));
                        
            console.log(dataByAge);
                     
     var ageCategory=dataByAge.map(function(d){return d.key});
     
     color.domain(ageCategory)
          .range(d3.schemeCategory10);
          
     var startWeek=d3.min(filterData.filter(function(d2){return d2.show===true}),function(d){return +d.week;});
     var endWeek=d3.max(filterData.filter(function(d2){return d2.show===true}),function(d){return +d.week;});
     
     xLineScale.domain([startWeek,endWeek])
               .range([0,drawWidth]);
               
    
    
     var rateMax=d3.max(filterData.filter(function(d2){return d2.show===true}),function(d){return +d.rate});
     var rateMin=d3.min(filterData.filter(function(d2){return d2.show===true}),function(d){return +d.rate});
    
     yLineScale.domain([rateMin,rateMax])
               .range([drawHeight,0]);
               
               
      ///padding to avoid cut off on x and y axis        
     var padding = (xLineScale.domain()[1] - xLineScale.domain()[0])/100;
     //var padding=0.0001;
     
     xLineScale.domain([xLineScale.domain()[0] - padding, xLineScale.domain()[1] + padding]).nice();          
     yLineScale.domain([yLineScale.domain()[0] - padding, yLineScale.domain()[1] + padding]).nice();
  
     // Set the scale of your x and y axis object
        x.scale(xLineScale);
        y.scale(yLineScale);
        

        // Render (call) your xAxis in your xAxisLabel
        xaxis.call(x);
        yaxis.call(y);
        
        xTitle.text("MMWR WEEK");
            
        yTitle.text("MMWR WEEKLY RATE");
        
  // line graph
           
      console.log("dataByAge2",dataByAge2);  
      	/// Draw the line
        var lines=g.selectAll("path")
                    .data(dataByAge2);
                    
                    
                    
                lines.exit()
                 .remove();
            
           lines.enter().append("path")
                .merge(lines)
                .attr('id',function(d){return "Line-"+d.key.replace(/\s+|\+/g, '-')})
                .attr("fill", "none")
                .attr("stroke", function(d){ return color(d.key) })
                .attr("stroke-width", 1.5)
                //.attr("class", "line") if selectAll(".line")
                .attr("d", function(d){
                  return d3.line()
                    .x(function(d) { return xLineScale(+d.week); })
                    .y(function(d) { return yLineScale(+d.rate); })
                    .curve(d3.curveMonotoneX)
                    (d.values);
                });
                
                
             // add legend text for each series 
            var le = legend.selectAll("text")
                            .data(dataByAge);
            le.exit().remove();
            
            le.enter().append("text")
                  .merge(le)
                  .attr("x", margin.left/2)             
                  .attr("y",  function(d,i) {return margin.top +i*15;})    
                  .attr("id", function(d){return "Legend-"+d.key.replace(/\s+|\+/g, '-')})
                  .attr("fill",function(d,i) {return color(d.key);})
                  .style("fill-opacity", function(d, i) {
                    if(d.values[0].show) {
                          return 1;
                      }
                    else {
                      return 0.3;
                    }
                  })
                  .on("click", function(d,i){
                  		// Determine if to shade off current legend
                  		console.log("this");
                  		console.log(this);
                  		  var legendActive=this.active? false : true;
                  		  var newOpacity = legendActive ? 1 : 0.3;
                  			// Change the opacity of legend
                  	  //d3.select("#Legend-"+d.key.replace(/\s+|\+/g, '-')).style("fill-opacity", newOpacity);          
                  	  // Update whether or not the legend are active
                  	  this.active=legendActive;
                  	  
                  	  
                  	  
                  	  // Determine if to show elements: line and dots
                  		var newactive   = d.values[0].show ? false : true;
                		  var newfilterData = filterData.map(function(d2){
                                                  return{
                                                    state:d2.state,
                                                    year:d2.year,
                                                    week:d2.week,
                                                    ageCategory:d2.ageCategory,
                                                    rate:d2.rate,
                                                    show: (d2.ageCategory == d.key) ? newactive : d2.show
                                                  };
                                      });
                        filterData = newfilterData;
                  		  drawLine( filterData);
                  	})
                  	.text(function(d,i) {return d.key;});
               
        // adding data point tool tip          
       var point_tip=d3.tip()
                  .attr('class','data-point-tip')
                  .direction('e')
                  .offset([-25,0])
                  .html(function(d){
                  return "Age: "+d.ageCategory+ "</br>"+  
                         "Week: "+d.week + "</br>"+            
                         "Rate: "+d.rate });
          
              
             g.call(point_tip); 
                 
      var points=g.selectAll('circle')
                      //.data(function(d){ return d.values})
                        .data(filterData.filter(function(d2){return d2.show===true}));
          
          points.enter()
                .append("circle")
                .merge(points)
                .attr('id',function(d){return "Dot-"+d.ageCategory.replace(/\s+|\+/g, '-')})
                .attr('class','dots')
                .on('mouseover', point_tip.show)
                .on('mouseout', point_tip.hide)
                .attr('cx',function(d){
                  return xLineScale(+d.week)})
                 .attr('cy',function(d){return yLineScale(+d.rate)})
                 .attr('r',3)
                 .style('fill',function(d){ 
                    return color(d.ageCategory) });
                 
               points.exit()
         	      .remove();  
         	      
        
} 

/// add  event listener  
 $("#mmwr-year-select").change(function() {
    var e1 = document.getElementById("state-name-select").value;
    var e2 = document.getElementById("mmwr-year-select").value;
    filterData=data.filter(function(d){return d.state== e1 & d.year== e2});
    drawLine(filterData);
  });
  
  $("#state-name-select").change(function() {
    var e1 = document.getElementById("state-name-select").value;
    var e2 = document.getElementById("mmwr-year-select").value;
   
    filterData=data.filter(function(d){return d.state== e1 & d.year== e2});
    drawLine(filterData);
  });
  

  });

  
});//