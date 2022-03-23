import json
from logging import exception
import re
import copy
import os
import sys

os.chdir(sys.path[0])


#data got from API
with open("../data_preprocessing/full_places_preprocessed.json", "r", encoding="utf-8") as data_file:
    original_data = json.load(data_file)

print(f"Number of places in original data : {len(original_data)}")

#Ontology in json format
with open("../ontology/ontology_json_ld.owl", "r", encoding="utf-8") as ontology_file:
    ontology = json.load(ontology_file)



prefix = "http://www.semanticweb.org/paulm/ontologies/2022/2/Final_project_restaurants#"
prefix_onki = "http://schema.onki.fi/poi#"

# Templates
with open("template_place_individual.json", "r", encoding="utf-8") as f:
    place_individual_template = json.load(f)

with open("template_address_individual.json", "r", encoding="utf-8") as f:
    address_individual_template = json.load(f)

with open("template_opening_hours_individual.json", "r", encoding="utf-8") as f:
    opening_hours_individual_template = json.load(f)

count_exceptions = 0
#Converting all POI into individuals in rdf json-ld format, adding them in the ontology (json-ld format), and finally save it back to disk:
for i in range(len(original_data)):
    try:
        #POI individual
        place_individual = copy.deepcopy(place_individual_template)

        id = original_data[i]["name"].replace(" ", "_")
        place_individual["@id"] = prefix + id
        if("restaurant" in original_data[i]["types"]):
            place_individual["@type"].append(prefix + "Restaurant")
        if("bar" in original_data[i]["types"]):
            place_individual["@type"].append(prefix + "Bar")
        if("cafe" in original_data[i]["types"]):
            place_individual["@type"].append(prefix + "Cafe")
        if("bakery" in original_data[i]["types"]):
            place_individual["@type"].append(prefix + "Bakery")
        place_individual[prefix_onki + "address"][0]["@id"] = prefix + id + "_address"
        place_individual[prefix + "hasOpeningHours"][0]["@id"] = prefix + id + "_opening_hours"
        place_individual[prefix + "name"][0]["@value"] = original_data[i]["name"]
        place_individual[prefix + "place_id"][0]["@value"] = original_data[i]["place_id"]
        if("price_level" in original_data[i]):
            place_individual[prefix + "price_level"][0]["@value"] = str(original_data[i]["price_level"])
        if("rating" in original_data[i]):
            place_individual[prefix + "rating_score"][0]["@value"] = str(original_data[i]["rating"])
        if("user_ratings_total" in original_data[i]):
            place_individual[prefix + "user_ratings_total"][0]["@value"] = str(original_data[i]["user_ratings_total"])
        place_individual["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["@value"] = str(original_data[i]["geometry"]["location"]["lat"])
        place_individual["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["@value"] = str(original_data[i]["geometry"]["location"]["lng"])


        #Address individual
        address_individual = copy.deepcopy(address_individual_template)

        formatted_address = original_data[i]["formatted_address"]

        address_individual["@id"] = prefix + id + "_address"
        address_individual[prefix + "formatted_address"][0]["@value"] = formatted_address

        match = re.search("\d{5}\s(.*)", formatted_address)
        if(match):
            address_individual[prefix + "city"][0]["@value"] = match.group(1)
            
        match = re.search("\d{5}", formatted_address)
        if(match):
            address_individual[prefix + "postal_code"][0]["@value"] = match.group(0)
        
        match = re.search("(\d*\s?)((([^\s^-]+)\s?)+),", formatted_address)
        if(match):
            address_individual[prefix_onki + "streetName"][0]["@value"] = match.group(1)

        match = re.search("(\d*).*,", formatted_address)
        if(match):
            address_individual[prefix_onki + "houseNumber"][0]["@value"] = match.group(1)
        
        address_individual[prefix + "isAddressOf"][0]["@id"] = prefix + id


        #Opening_hours individual
        opening_hours_individual = copy.deepcopy(opening_hours_individual_template)

        opening_hours_individual["@id"] = prefix + id + "_opening_hours"
        opening_hours_individual[prefix + "isOpeningHoursOf"][0]["@id"] = prefix + id
        opening_hours_individual[prefix + "monday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][0]
        opening_hours_individual[prefix + "tuesday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][1]
        opening_hours_individual[prefix + "wednesday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][2]
        opening_hours_individual[prefix + "thursday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][3]
        opening_hours_individual[prefix + "friday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][4]
        opening_hours_individual[prefix + "saturday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][5]
        opening_hours_individual[prefix + "sunday"][0]["@value"] = original_data[i]["opening_hours"]["weekday_text"][6]


        #Insertion in the ontology:
        ontology.append(place_individual)
        ontology.append(address_individual)
        ontology.append(opening_hours_individual)
    except Exception as e:
        count_exceptions += 1
        print(f"Error on individual {i} (exception nb {count_exceptions}):")
        print(e)

print("Added all data in the ontology json")

#After all individuals are added, we save to disk
with open("../ontology/populated_ontology_json_ld.jsonld", "w", encoding="utf-8") as f:
    json.dump(ontology, f)
print("Saved to disk")