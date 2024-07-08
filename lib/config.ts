import { Config } from './types';
import * as config from '../config.json';

export function read(): Config {
    return config;
}