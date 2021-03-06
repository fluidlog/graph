/**
 * FluidGraph.prototype.d3DataToJsonD3 - Convert the current
 * graph d3Data into a JSON stringified format
 * @memberof FluidGraph.prototype
 * @return {string}  the D3 data in JSON format
 */
FluidGraph.prototype.d3DataToJsonD3 = function() {
  thisGraph = this;

  if (thisGraph.config.debug) console.log("d3DataToJsonD3 start");

  //We copy d3Data object, cause we don't want to modify it... serializing and deserializing...
  var localD3Data = JSON.parse(JSON.stringify(thisGraph.d3Data));

  localD3Data.edges.forEach(function(edge){
    edge.source = typeof edge.source.index != "undefined" ? edge.source.index : edge.source.id;
    edge.target = typeof edge.target.index != "undefined" ? edge.target.index : edge.target.id;
  });

  localD3Data.name = thisGraph.graphName;

  var jsonD3 = window.JSON.stringify(localD3Data);

  if (thisGraph.config.debug) console.log("d3DataToJsonD3 end");

  return jsonD3;
}

/**
 * FluidGraph.prototype.d3DataToJsonLd - Convert the current
 * graph d3Data into a JSON Linked Data object
 * @return {object}  the D3 data in JSON-LD
 */
FluidGraph.prototype.d3DataToJsonLd = function() {
  thisGraph = this;

  if (thisGraph.config.debug) console.log("d3DataToJsonLd start");

  //We copy d3Data object, cause we don't want to modify it... serializing and deserializing...
  var localD3Data = JSON.parse(JSON.stringify(thisGraph.d3Data));

  localD3Data.nodes.forEach(function(node){
    node.index = node.index.toString();
    node.x = node.x.toString();
    node.y = node.y.toString();
  });

  if (localD3Data.edges.length)
  {
    localD3Data.edges.forEach(function(edge){
      edge.index = edge.index.toString();
      edge.source = edge.source["@id"];
      edge.target = edge.target["@id"];
    });
  }
  else localD3Data.edges = [];

  var jsonLd = {
                  "nodes": localD3Data.nodes,
                  "edges": localD3Data.edges,
                  "foaf:name": thisGraph.graphName
                };

  if (thisGraph.config.debug) console.log("d3DataToJsonLd end");

  return jsonLd;
}

/**
 * FluidGraph.prototype.jsonD3ToD3Data - Convert a JSON object
 * containing the graph information to a d3 formatted object
 * 
 * @param  {object} jsonInput The json structure of the graph used as input data
 * @return {object}           Data that d3 will be able to process
 */
FluidGraph.prototype.jsonD3ToD3Data = function(jsonInput) {
  thisGraph = this;
  if (thisGraph.config.debug) console.log("jsonGraphToData start");

  var d3data = {};
  var newNodes = [];
  var newEdges = [];
  var jsonObj = JSON.parse(jsonInput);
  thisGraph.graphName = jsonObj["foaf:name"];

  newNodes = jsonObj.nodes;
  newNodes.forEach(function(node){
    if (typeof node["@type"] == "undefined") return false;

    node.index = typeof node.index != "undefined" ? node.index : node.id ;
  });

  newEdges = jsonObj.edges;
  newEdges.forEach(function(edge){
    edge.source = newNodes.filter(function(node){
                            return node.index == edge.source || node.id == edge.source;
                          })[0];
    edge.target = newNodes.filter(function(node){
                            return node.index == edge.target || node.id == edge.target;
                          })[0];
  });

  if (thisGraph.config.debug) console.log("jsonGraphToData end");

  return {"nodes" : newNodes, "edges" : newEdges};
}

FluidGraph.prototype.jsonLdToD3Data = function(jsonObj) {
  thisGraph = this;
  if (thisGraph.config.debug) console.log("jsonLdToD3Data start");

  var d3Data = {};
  var newEdges = [];
  var newNodes = [];

  thisGraph.graphName = jsonObj["foaf:name"];

  //Get the type of the object of nodes in case theres's only one node, it's an [object object]
  var typeObjNodes = Object.prototype.toString.call( jsonObj.nodes );
  if (typeObjNodes === '[object Array]')
    newNodes = jsonObj.nodes;
  else {
    newNodes.push(jsonObj.nodes);
  }

  newNodes.forEach(function(node){
    node.index = parseInt(node.index, 10);
    node.x = parseInt(node.x, 10);
    node.y = parseInt(node.y, 10);
  });

  if (jsonObj.edges)
  {
    //Get the type of the object of edges in case theres's only one edge, it's an [object object]
    var typeObjEdges = Object.prototype.toString.call( jsonObj.edges );
    if (typeObjEdges === '[object Array]')
      newEdges = jsonObj.edges;
    else {
      newEdges.push(jsonObj.edges);
    }

    newEdges.forEach(function(edge){
      edge.source = newNodes.filter(function(node){
                              return node.index == edge.source || node["@id"] == edge.source;
                            })[0];

      edge.target = newNodes.filter(function(node){
                              return node.index == edge.target || node["@id"] == edge.target;
                            })[0];

      edge.index = parseInt(edge.index, 10);
    });
  }

  d3Data = {nodes : newNodes, edges : newEdges};

  if (thisGraph.config.debug) console.log("jsonLdToD3Data end");

  return d3Data;
}
