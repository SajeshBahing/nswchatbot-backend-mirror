const monk = require('monk');

const url = 'localhost:27017/launchpad';

const db = monk(url);