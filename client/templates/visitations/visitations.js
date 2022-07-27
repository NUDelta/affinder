import {splitVarDeclarationAndRules, setOfContextFeaturesInBlockly} from '../../../lib/detectors/detectors'

export const yelp2foursquare = require('../../../public/yelp2foursquare.json');
const checkin_by_category_losangeles = require('../../../public/checkins_losangeles_by_category.json');
const checkin_by_category_chicago = require('../../../public/checkins_chicago_by_category.json');
const checkin_by_category_phoenix = require('../../../public/checkins_phoenix_by_category.json');
export const checkin_by_category_city = {
  'Chicago': checkin_by_category_chicago,
  'Los Angeles': checkin_by_category_losangeles,
  'Phoenix': checkin_by_category_phoenix,
};

/**
 *
 * @param {*} city
 * @returns total checkins, by summing up all checkin stats for each of the categories in the concept expression
 */
export const totalCheckins = (city) => {
  // FIXME(rlouie): This is all the categories, not neccessarily the top-level concept expression of interest.
  const [varDecl, rules] = splitVarDeclarationAndRules(document.getElementById('compiledBlockly').value);
  const placeTags = setOfContextFeaturesInBlockly(varDecl, rules);
  const checkin_by_category = checkin_by_category_city[city]
  let totalCheckinCount = 0;
  // Get corresponding Foursquare checkin data for each place category
  placeTags.forEach(category => {
    const fsq_feature = yelp2foursquare[category];
    // get the foursquare data, or set it to default 0 checkins
    totalCheckinCount += checkin_by_category[fsq_feature] || 0;
  });
  return totalCheckinCount;
};
