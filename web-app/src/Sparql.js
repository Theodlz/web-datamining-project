const d3  = require('d3-sparql')
const Axios = require('axios');
const jsonld = require('jsonld');

const endpoint = 'http://localhost:3030/poiparis/sparql'

function getPlaces(type="All", sorting="", page, nbByPage) {
    let query = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
      PREFIX fi: <http://schema.onki.fi/poi#>
      PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

      SELECT ?place_id ?name ?adresse ?lat ?lng ?rating
  `;
    if(type === "All"){
      query += `
      WHERE {
        ?x rdf:type ?type .
        ?type rdfs:subClassOf* fi:PointOfInterest .
        ?x ns:name ?name .
        ?x ns:place_id ?place_id .
        ?x ns:rating_score ?rating .
        ?x fi:address ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?x geo:lat ?lat .
        ?x geo:long ?lng .
      }
      `;
    } else {
      query +=`
      WHERE {
        ?x rdf:type ns:${type} .
        ?x ns:name ?name .
        ?x ns:place_id ?place_id .
        ?x ns:rating_score ?rating .
        ?x fi:address ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?x geo:lat ?lat .
        ?x geo:long ?lng .
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
      // parse lat and lng as float
      data = data.map(function(d) {
        d.lat = parseFloat(d.lat);
        d.lng = parseFloat(d.lng);
        return d;
      });
      console.log(data);
        if (nbByPage && page) {
          return data.splice(page*nbByPage, nbByPage);
        } else {
          // delete duplicates in the data using the place_id
          let unique = data.filter((v, i, a) => a.findIndex(t => (t["place_id"] === v["place_id"])) === i);
          return unique;
        }
      })
  }

function getPlacesJsonLD(type="All", sorting="", page, nbByPage) {
  // get jsonld from sparql endpoint using axios
  let query = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
      PREFIX fi: <http://schema.onki.fi/poi#>
      PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

      DESCRIBE ?x ?adresseClass
  `;
    if(type === "All"){
      query += `
      WHERE {
        ?x rdf:type ?type .
        ?type rdfs:subClassOf* fi:PointOfInterest .
        ?x ns:name ?name .
        ?x ns:place_id ?place_id .
        ?x ns:rating_score ?rating .
        ?x fi:address ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?x geo:lat ?lat .
        ?x geo:long ?lng .
      }
      `;
    } else {
      query +=`
      WHERE {
        ?x rdf:type ns:${type} .
        ?x ns:name ?name .
        ?x ns:place_id ?place_id .
        ?x ns:rating_score ?rating .
        ?x fi:address ?adresseClass .
        ?adresseClass ns:formatted_address ?adresse .
        ?x geo:lat ?lat .
        ?x geo:long ?lng .
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
    const config = {
      headers: {
        'Accept': 'application/ld+json'

      }
    }

    return Axios.get(endpoint + "?query=" + encodeURIComponent(query), config).then(function(response) {
      console.log(response.data);
      return jsonld.expand(response.data).then(function(expanded) {
        return JSON.stringify(expanded, '', 2);
      });
    }).catch(function(error) {
      console.log(error);
    });
}

function getTravelers(type="All", sorting="", page, nbByPage) {
  let query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
    PREFIX fi: <http://schema.onki.fi/poi#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

    SELECT ?name
    WHERE {
      ?x rdf:type ns:Traveler .
      ?x ns:name ?name .
    }
`;
  
  return d3.sparql(endpoint, query).then(function(data) {
    // parse lat and lng as float
    console.log(data)
    return data;
    })
}

function getTravelerRoutes(name="") {
  let query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
    PREFIX fi: <http://schema.onki.fi/poi#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

    SELECT ?origin_name ?origin_address ?destination_name ?destination_address ?departure_time ?arrival_time
    WHERE {
      ?a rdf:type ns:Traveler .
      ?a ns:name "${name}" .
      ?a ns:traveled ?x .
      ?x rdf:type ns:Travel .
      ?x ns:departed_from ?origin .
      ?origin ns:name ?origin_name .
      ?origin fi:address ?origin_address_class .
      ?origin_address_class ns:formatted_address ?origin_address .
      ?x ns:arrived_at ?destination .
      ?destination ns:name ?destination_name .
      ?destination fi:address ?destination_address_class .
      ?destination_address_class ns:formatted_address ?destination_address .
      ?x ns:departure_time ?departure_time .
      ?x ns:arrival_time ?arrival_time .
    }
`;
  
  return d3.sparql(endpoint, query).then(function(data) {
    // parse lat and lng as float
    console.log(data)
    return data;
    })
}

function getTravelersAndRoutesJsonLD() {
  // get jsonld from sparql endpoint using axios
  let query = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ns: <http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#>
      PREFIX fi: <http://schema.onki.fi/poi#>
      PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

      DESCRIBE ?a ?x ?origin ?destination
      WHERE {
        ?a rdf:type ns:Traveler .
        ?a ns:name ?traveler_name .
        ?a ns:traveled ?x .
        ?x rdf:type ns:Travel .
        ?x ns:departed_from ?origin .
        ?x ns:arrived_at ?destination .
      }
  `;
    
    const config = {
      headers: {
        'Accept': 'application/ld+json'

      }
    }
    return Axios.get(endpoint + "?query=" + encodeURIComponent(query), config).then(function(response) {
      console.log(response.data);
      return jsonld.expand(response.data).then(function(expanded) {
        return JSON.stringify(expanded, '', 2);
      });
    }).catch(function(error) {
      console.log(error);
    });
}

module.exports = {
    getPlaces,
    getPlacesJsonLD,
    getTravelers,
    getTravelerRoutes,
    getTravelersAndRoutesJsonLD
}