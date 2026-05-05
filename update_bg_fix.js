const fs = require('fs');

// ExploreScreen.js
let explorePath = 'src/screens/candidate/ExploreScreen.js';
let exploreContent = fs.readFileSync(explorePath, 'utf8');

// The script from before replaced ALL occurrences of COLORS.background with "#F0F2F5"
// Let's manually restore the hero back to COLORS.background
const heroTarget = `  hero: {
    backgroundColor: "#F0F2F5",`;
const heroReplacement = `  hero: {
    backgroundColor: COLORS.background,`;
exploreContent = exploreContent.replace(heroTarget, heroReplacement);

fs.writeFileSync(explorePath, exploreContent, 'utf8');

// AppNavigator.js
let navPath = 'src/navigation/AppNavigator.js';
let navContent = fs.readFileSync(navPath, 'utf8');

const tabBarTarget = `  tabBar: {
    alignItems: "stretch",
    backgroundColor: "#F0F2F5",`;
const tabBarReplacement = `  tabBar: {
    alignItems: "stretch",
    backgroundColor: COLORS.background,`;
navContent = navContent.replace(tabBarTarget, tabBarReplacement);

fs.writeFileSync(navPath, navContent, 'utf8');
console.log('Restored header and menu colors');
