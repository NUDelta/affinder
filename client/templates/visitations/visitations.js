import { compiledBlocklyDep, ConceptExpressionDefinition } from '../blockly';

export const yelp2foursquare = require('../../../public/yelp2foursquare.json');
const checkin_by_category_losangeles = require('../../../public/checkins_losangeles_by_category.json');
const checkin_by_category_chicago = require('../../../public/checkins_chicago_by_category.json');
const checkin_by_category_phoenix = require('../../../public/checkins_phoenix_by_category.json');
const checkin_by_category_memphis = require('../../../public/checkins_memphis_by_category.json');
const checkin_by_category_elpaso = require('../../../public/checkins_elpaso_by_category.json');
const checkin_by_category_portland = require('../../../public/checkins_portland_by_category.json');
export const checkin_by_category_city = {
  'Chicago': checkin_by_category_chicago,
  'Los Angeles': checkin_by_category_losangeles,
  'Phoenix': checkin_by_category_phoenix,
  'Memphis': checkin_by_category_memphis,
  'El Paso': checkin_by_category_elpaso,
  'Portland': checkin_by_category_portland,
};

export const numFSQUsersPerCity = {
  'Los Angeles': 9136,
  'Phoenix': 3120,
  'Chicago': 6885,
  'Memphis': 1163,
  'El Paso': 575,
  'Portland': 1825,
};
/**
 *
 * @param {*} city
 * @returns total checkins, by summing up all checkin stats for each of the categories in the concept expression
 */
export const totalCheckins = (city) => {
  compiledBlocklyDep.depend();
  let conceptExpressionDefinition = new ConceptExpressionDefinition();
  const placeFeatureNames = conceptExpressionDefinition.allFeatures();

  const checkin_by_category = checkin_by_category_city[city]
  let totalCheckinCount = 0;
  // Get corresponding Foursquare checkin data for each place category
  placeFeatureNames.forEach(category => {
    const fsq_feature = yelp2foursquare[category];
    // get the foursquare data, or set it to default 0 checkins
    totalCheckinCount += checkin_by_category[fsq_feature] || 0;
  });
  return totalCheckinCount;
};
