// msw.polyfills.js
import 'fast-text-encoding'
import 'react-native-url-polyfill/auto'

// MessageEvent polyfill
function defineMockGlobal(name) {
  if (typeof global[name] === "undefined") {
    global[name] = class {
      constructor(type, eventInitDict = {}) {
        this.type = type;
        this.data = eventInitDict.data;
        this.origin = eventInitDict.origin || '';
        this.lastEventId = eventInitDict.lastEventId || '';
        this.source = eventInitDict.source || null;
        this.ports = eventInitDict.ports || [];
        Object.assign(this, eventInitDict);
      }
    };
  }
}

// Web API classes that MSW requires
const webApis = [
  "MessageEvent", 
  "Event", 
  "EventTarget", 
  "BroadcastChannel",
  "CloseEvent",
  "ErrorEvent"
];

webApis.forEach(defineMockGlobal);

// Headers polyfill (중요!)
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map();
      
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    append(name, value) {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }
    
    delete(name) {
      this._headers.delete(name.toLowerCase());
    }
    
    entries() {
      return this._headers.entries();
    }
    
    forEach(callback, thisArg) {
      this._headers.forEach((value, key) => {
        callback.call(thisArg, value, key, this);
      });
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    has(name) {
      return this._headers.has(name.toLowerCase());
    }
    
    keys() {
      return this._headers.keys();
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value));
    }
    
    values() {
      return this._headers.values();
    }
    
    [Symbol.iterator]() {
      return this._headers[Symbol.iterator]();
    }
  };
}

// Request polyfill
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body || null;
      this.mode = init.mode || 'cors';
      this.credentials = init.credentials || 'same-origin';
      this.cache = init.cache || 'default';
      this.redirect = init.redirect || 'follow';
      this.referrer = init.referrer || '';
      this.integrity = init.integrity || '';
    }
    
    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        mode: this.mode,
        credentials: this.credentials,
        cache: this.cache,
        redirect: this.redirect,
        referrer: this.referrer,
        integrity: this.integrity
      });
    }
  };
}

// Response polyfill enhancement
if (typeof global.Response === 'undefined' || !global.Response.prototype.json) {
  const OriginalResponse = global.Response;
  
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
      this.url = init.url || '';
      this.type = init.type || 'default';
      this.redirected = init.redirected || false;
    }
    
    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      return this.body;
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
    
    async arrayBuffer() {
      const text = await this.text();
      const buffer = new ArrayBuffer(text.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < text.length; i++) {
        view[i] = text.charCodeAt(i);
      }
      return buffer;
    }
    
    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
        url: this.url,
        type: this.type,
        redirected: this.redirected
      });
    }
    
    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        }
      });
    }
    
    static error() {
      const response = new Response(null, { status: 0, statusText: '' });
      response.ok = false;
      response.type = 'error';
      return response;
    }
  };
}

// AbortController polyfill
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
        onabort: null
      };
    }
    
    abort() {
      this.signal.aborted = true;
      if (this.signal.onabort) {
        this.signal.onabort();
      }
    }
  };
}

// Crypto polyfill (MSW가 ID 생성에 사용)
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}

// ReadableStream polyfill (기본적인 구현)
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource = {}) {
      this._underlyingSource = underlyingSource;
      this._controller = null;
    }
  };
}

console.log('MSW polyfills loaded successfully');

// msw.polyfills.js 맨 아래에 추가
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
  };
}