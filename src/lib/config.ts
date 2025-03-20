import { Config } from './types.js';
import * as config from '../config.json' with { type: "json" };

export function read(): Config {
    return config["default"];
}