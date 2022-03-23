const d3  = require('d3-sparql')

const endpoint = 'http://localhost:3030/poiparis/sparql'

function getPlaces(type="All", sorting="", page, nbByPage) {
    let query = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
  
      SELECT ?place_id ?name ?rating ?adresse ?lat ?lng
  `;
    if(type === "All"){
      query += `
        WHERE {
        ?x rdf:type ?type .
        ?type rdfs:subClassOf* ns:Food_related .
        ?x ns:place_id ?place_id .
        ?x ns:name ?name .
        ?x ns:rating_score ?rating .
        ?x ns:hasAddress ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?adresseClass ns:lat ?lat .
        ?adresseClass ns:lng ?lng .
        }
      `;
    } else {
      query +=`
        WHERE {
        ?x rdf:type ns:${type} .
        ?x ns:place_id ?place_id .
        ?x ns:name ?name .
        ?x ns:rating_score ?rating .
        ?x ns:hasAddress ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?adresseClass ns:lat ?lat .
        ?adresseClass ns:lng ?lng .
        }
      `;
    }
    switch(sorting){
      case "rating desc":
        query += `
        ORDER BY DESC(?rating)
        `;
        break;
      case "rating asc":
        query += `
        ORDER BY ASC(?rating)
        `;
        break;
      case "name desc":
        query += `
        ORDER BY DESC(?name)
        `;
        break;
      case "name asc":
        query += `
        ORDER BY ASC(?name)
        `;
        break;
      default:
        break;
    }
    return d3.sparql(endpoint, query).then(function(data) {
      console.log(data)
        if (nbByPage && page) {
          return data.splice(page*nbByPage, nbByPage);
        } else {
          // delete duplicates in the data using the place_id
          let unique = data.filter((v, i, a) => a.findIndex(t => (t["place_id"] === v["place_id"])) === i);
          return unique;
        }
      })
  }

module.exports = {
    getPlaces
}