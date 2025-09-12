import { decode as _atob, encode as _btoa } from 'base-64';
const g: any = global as any;
if (!g.window) g.window = g;
if (!g.atob) g.atob = _atob;
if (!g.btoa) g.btoa = _btoa;

import { Base64 } from 'js-base64';
if (!g.Base64) g.Base64 = Base64;
if (!g.window.Base64) g.window.Base64 = Base64;

import 'fast-text-encoding';
import 'react-native-url-polyfill/auto';
