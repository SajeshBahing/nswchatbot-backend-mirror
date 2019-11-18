'use strict'
// Read .env file.
import "@babel/polyfill";
// import "core-js/stable";
// import "regenerator-runtime/runtime";
import {config} from "dotenv";
config();

process.env.NODE_ENV = process.env.NODE_ENV || 'DEVELOPMENT'
/**
 * This is required in all environments since this is what mongoose uses to establish connection to a MongoDB instance.
 */
require('./server');
