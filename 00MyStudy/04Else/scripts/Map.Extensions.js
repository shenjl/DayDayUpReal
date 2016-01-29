
/*json2*/
if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', { '': value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({ '': j }, '')
                    : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
} ());

/*内部引入jQuery,不对外公开*/
/*! jQuery v1.8.3 jquery.com | jquery.org/license */
(function(e,t){function _(e){var t=M[e]={};return v.each(e.split(y),function(e,n){t[n]=!0}),t}function H(e,n,r){if(r===t&&e.nodeType===1){var i="data-"+n.replace(P,"-$1").toLowerCase();r=e.getAttribute(i);if(typeof r=="string"){try{r=r==="true"?!0:r==="false"?!1:r==="null"?null:+r+""===r?+r:D.test(r)?v.parseJSON(r):r}catch(s){}v.data(e,n,r)}else r=t}return r}function B(e){var t;for(t in e){if(t==="data"&&v.isEmptyObject(e[t]))continue;if(t!=="toJSON")return!1}return!0}function et(){return!1}function tt(){return!0}function ut(e){return!e||!e.parentNode||e.parentNode.nodeType===11}function at(e,t){do e=e[t];while(e&&e.nodeType!==1);return e}function ft(e,t,n){t=t||0;if(v.isFunction(t))return v.grep(e,function(e,r){var i=!!t.call(e,r,e);return i===n});if(t.nodeType)return v.grep(e,function(e,r){return e===t===n});if(typeof t=="string"){var r=v.grep(e,function(e){return e.nodeType===1});if(it.test(t))return v.filter(t,r,!n);t=v.filter(t,r)}return v.grep(e,function(e,r){return v.inArray(e,t)>=0===n})}function lt(e){var t=ct.split("|"),n=e.createDocumentFragment();if(n.createElement)while(t.length)n.createElement(t.pop());return n}function Lt(e,t){return e.getElementsByTagName(t)[0]||e.appendChild(e.ownerDocument.createElement(t))}function At(e,t){if(t.nodeType!==1||!v.hasData(e))return;var n,r,i,s=v._data(e),o=v._data(t,s),u=s.events;if(u){delete o.handle,o.events={};for(n in u)for(r=0,i=u[n].length;r<i;r++)v.event.add(t,n,u[n][r])}o.data&&(o.data=v.extend({},o.data))}function Ot(e,t){var n;if(t.nodeType!==1)return;t.clearAttributes&&t.clearAttributes(),t.mergeAttributes&&t.mergeAttributes(e),n=t.nodeName.toLowerCase(),n==="object"?(t.parentNode&&(t.outerHTML=e.outerHTML),v.support.html5Clone&&e.innerHTML&&!v.trim(t.innerHTML)&&(t.innerHTML=e.innerHTML)):n==="input"&&Et.test(e.type)?(t.defaultChecked=t.checked=e.checked,t.value!==e.value&&(t.value=e.value)):n==="option"?t.selected=e.defaultSelected:n==="input"||n==="textarea"?t.defaultValue=e.defaultValue:n==="script"&&t.text!==e.text&&(t.text=e.text),t.removeAttribute(v.expando)}function Mt(e){return typeof e.getElementsByTagName!="undefined"?e.getElementsByTagName("*"):typeof e.querySelectorAll!="undefined"?e.querySelectorAll("*"):[]}function _t(e){Et.test(e.type)&&(e.defaultChecked=e.checked)}function Qt(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=Jt.length;while(i--){t=Jt[i]+n;if(t in e)return t}return r}function Gt(e,t){return e=t||e,v.css(e,"display")==="none"||!v.contains(e.ownerDocument,e)}function Yt(e,t){var n,r,i=[],s=0,o=e.length;for(;s<o;s++){n=e[s];if(!n.style)continue;i[s]=v._data(n,"olddisplay"),t?(!i[s]&&n.style.display==="none"&&(n.style.display=""),n.style.display===""&&Gt(n)&&(i[s]=v._data(n,"olddisplay",nn(n.nodeName)))):(r=Dt(n,"display"),!i[s]&&r!=="none"&&v._data(n,"olddisplay",r))}for(s=0;s<o;s++){n=e[s];if(!n.style)continue;if(!t||n.style.display==="none"||n.style.display==="")n.style.display=t?i[s]||"":"none"}return e}function Zt(e,t,n){var r=Rt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function en(e,t,n,r){var i=n===(r?"border":"content")?4:t==="width"?1:0,s=0;for(;i<4;i+=2)n==="margin"&&(s+=v.css(e,n+$t[i],!0)),r?(n==="content"&&(s-=parseFloat(Dt(e,"padding"+$t[i]))||0),n!=="margin"&&(s-=parseFloat(Dt(e,"border"+$t[i]+"Width"))||0)):(s+=parseFloat(Dt(e,"padding"+$t[i]))||0,n!=="padding"&&(s+=parseFloat(Dt(e,"border"+$t[i]+"Width"))||0));return s}function tn(e,t,n){var r=t==="width"?e.offsetWidth:e.offsetHeight,i=!0,s=v.support.boxSizing&&v.css(e,"boxSizing")==="border-box";if(r<=0||r==null){r=Dt(e,t);if(r<0||r==null)r=e.style[t];if(Ut.test(r))return r;i=s&&(v.support.boxSizingReliable||r===e.style[t]),r=parseFloat(r)||0}return r+en(e,t,n||(s?"border":"content"),i)+"px"}function nn(e){if(Wt[e])return Wt[e];var t=v("<"+e+">").appendTo(i.body),n=t.css("display");t.remove();if(n==="none"||n===""){Pt=i.body.appendChild(Pt||v.extend(i.createElement("iframe"),{frameBorder:0,width:0,height:0}));if(!Ht||!Pt.createElement)Ht=(Pt.contentWindow||Pt.contentDocument).document,Ht.write("<!doctype html><html><body>"),Ht.close();t=Ht.body.appendChild(Ht.createElement(e)),n=Dt(t,"display"),i.body.removeChild(Pt)}return Wt[e]=n,n}function fn(e,t,n,r){var i;if(v.isArray(t))v.each(t,function(t,i){n||sn.test(e)?r(e,i):fn(e+"["+(typeof i=="object"?t:"")+"]",i,n,r)});else if(!n&&v.type(t)==="object")for(i in t)fn(e+"["+i+"]",t[i],n,r);else r(e,t)}function Cn(e){return function(t,n){typeof t!="string"&&(n=t,t="*");var r,i,s,o=t.toLowerCase().split(y),u=0,a=o.length;if(v.isFunction(n))for(;u<a;u++)r=o[u],s=/^\+/.test(r),s&&(r=r.substr(1)||"*"),i=e[r]=e[r]||[],i[s?"unshift":"push"](n)}}function kn(e,n,r,i,s,o){s=s||n.dataTypes[0],o=o||{},o[s]=!0;var u,a=e[s],f=0,l=a?a.length:0,c=e===Sn;for(;f<l&&(c||!u);f++)u=a[f](n,r,i),typeof u=="string"&&(!c||o[u]?u=t:(n.dataTypes.unshift(u),u=kn(e,n,r,i,u,o)));return(c||!u)&&!o["*"]&&(u=kn(e,n,r,i,"*",o)),u}function Ln(e,n){var r,i,s=v.ajaxSettings.flatOptions||{};for(r in n)n[r]!==t&&((s[r]?e:i||(i={}))[r]=n[r]);i&&v.extend(!0,e,i)}function An(e,n,r){var i,s,o,u,a=e.contents,f=e.dataTypes,l=e.responseFields;for(s in l)s in r&&(n[l[s]]=r[s]);while(f[0]==="*")f.shift(),i===t&&(i=e.mimeType||n.getResponseHeader("content-type"));if(i)for(s in a)if(a[s]&&a[s].test(i)){f.unshift(s);break}if(f[0]in r)o=f[0];else{for(s in r){if(!f[0]||e.converters[s+" "+f[0]]){o=s;break}u||(u=s)}o=o||u}if(o)return o!==f[0]&&f.unshift(o),r[o]}function On(e,t){var n,r,i,s,o=e.dataTypes.slice(),u=o[0],a={},f=0;e.dataFilter&&(t=e.dataFilter(t,e.dataType));if(o[1])for(n in e.converters)a[n.toLowerCase()]=e.converters[n];for(;i=o[++f];)if(i!=="*"){if(u!=="*"&&u!==i){n=a[u+" "+i]||a["* "+i];if(!n)for(r in a){s=r.split(" ");if(s[1]===i){n=a[u+" "+s[0]]||a["* "+s[0]];if(n){n===!0?n=a[r]:a[r]!==!0&&(i=s[0],o.splice(f--,0,i));break}}}if(n!==!0)if(n&&e["throws"])t=n(t);else try{t=n(t)}catch(l){return{state:"parsererror",error:n?l:"No conversion from "+u+" to "+i}}}u=i}return{state:"success",data:t}}function Fn(){try{return new e.XMLHttpRequest}catch(t){}}function In(){try{return new e.ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}function $n(){return setTimeout(function(){qn=t},0),qn=v.now()}function Jn(e,t){v.each(t,function(t,n){var r=(Vn[t]||[]).concat(Vn["*"]),i=0,s=r.length;for(;i<s;i++)if(r[i].call(e,t,n))return})}function Kn(e,t,n){var r,i=0,s=0,o=Xn.length,u=v.Deferred().always(function(){delete a.elem}),a=function(){var t=qn||$n(),n=Math.max(0,f.startTime+f.duration-t),r=n/f.duration||0,i=1-r,s=0,o=f.tweens.length;for(;s<o;s++)f.tweens[s].run(i);return u.notifyWith(e,[f,i,n]),i<1&&o?n:(u.resolveWith(e,[f]),!1)},f=u.promise({elem:e,props:v.extend({},t),opts:v.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:qn||$n(),duration:n.duration,tweens:[],createTween:function(t,n,r){var i=v.Tween(e,f.opts,t,n,f.opts.specialEasing[t]||f.opts.easing);return f.tweens.push(i),i},stop:function(t){var n=0,r=t?f.tweens.length:0;for(;n<r;n++)f.tweens[n].run(1);return t?u.resolveWith(e,[f,t]):u.rejectWith(e,[f,t]),this}}),l=f.props;Qn(l,f.opts.specialEasing);for(;i<o;i++){r=Xn[i].call(f,e,l,f.opts);if(r)return r}return Jn(f,l),v.isFunction(f.opts.start)&&f.opts.start.call(e,f),v.fx.timer(v.extend(a,{anim:f,queue:f.opts.queue,elem:e})),f.progress(f.opts.progress).done(f.opts.done,f.opts.complete).fail(f.opts.fail).always(f.opts.always)}function Qn(e,t){var n,r,i,s,o;for(n in e){r=v.camelCase(n),i=t[r],s=e[n],v.isArray(s)&&(i=s[1],s=e[n]=s[0]),n!==r&&(e[r]=s,delete e[n]),o=v.cssHooks[r];if(o&&"expand"in o){s=o.expand(s),delete e[r];for(n in s)n in e||(e[n]=s[n],t[n]=i)}else t[r]=i}}function Gn(e,t,n){var r,i,s,o,u,a,f,l,c,h=this,p=e.style,d={},m=[],g=e.nodeType&&Gt(e);n.queue||(l=v._queueHooks(e,"fx"),l.unqueued==null&&(l.unqueued=0,c=l.empty.fire,l.empty.fire=function(){l.unqueued||c()}),l.unqueued++,h.always(function(){h.always(function(){l.unqueued--,v.queue(e,"fx").length||l.empty.fire()})})),e.nodeType===1&&("height"in t||"width"in t)&&(n.overflow=[p.overflow,p.overflowX,p.overflowY],v.css(e,"display")==="inline"&&v.css(e,"float")==="none"&&(!v.support.inlineBlockNeedsLayout||nn(e.nodeName)==="inline"?p.display="inline-block":p.zoom=1)),n.overflow&&(p.overflow="hidden",v.support.shrinkWrapBlocks||h.done(function(){p.overflow=n.overflow[0],p.overflowX=n.overflow[1],p.overflowY=n.overflow[2]}));for(r in t){s=t[r];if(Un.exec(s)){delete t[r],a=a||s==="toggle";if(s===(g?"hide":"show"))continue;m.push(r)}}o=m.length;if(o){u=v._data(e,"fxshow")||v._data(e,"fxshow",{}),"hidden"in u&&(g=u.hidden),a&&(u.hidden=!g),g?v(e).show():h.done(function(){v(e).hide()}),h.done(function(){var t;v.removeData(e,"fxshow",!0);for(t in d)v.style(e,t,d[t])});for(r=0;r<o;r++)i=m[r],f=h.createTween(i,g?u[i]:0),d[i]=u[i]||v.style(e,i),i in u||(u[i]=f.start,g&&(f.end=f.start,f.start=i==="width"||i==="height"?1:0))}}function Yn(e,t,n,r,i){return new Yn.prototype.init(e,t,n,r,i)}function Zn(e,t){var n,r={height:e},i=0;t=t?1:0;for(;i<4;i+=2-t)n=$t[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}function tr(e){return v.isWindow(e)?e:e.nodeType===9?e.defaultView||e.parentWindow:!1}var n,r,i=e.document,s=e.location,o=e.navigator,u=e.jQuery,a=e.$,f=Array.prototype.push,l=Array.prototype.slice,c=Array.prototype.indexOf,h=Object.prototype.toString,p=Object.prototype.hasOwnProperty,d=String.prototype.trim,v=function(e,t){return new v.fn.init(e,t,n)},m=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,g=/\S/,y=/\s+/,b=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,w=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,E=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,S=/^[\],:{}\s]*$/,x=/(?:^|:|,)(?:\s*\[)+/g,T=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,N=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,C=/^-ms-/,k=/-([\da-z])/gi,L=function(e,t){return(t+"").toUpperCase()},A=function(){i.addEventListener?(i.removeEventListener("DOMContentLoaded",A,!1),v.ready()):i.readyState==="complete"&&(i.detachEvent("onreadystatechange",A),v.ready())},O={};v.fn=v.prototype={constructor:v,init:function(e,n,r){var s,o,u,a;if(!e)return this;if(e.nodeType)return this.context=this[0]=e,this.length=1,this;if(typeof e=="string"){e.charAt(0)==="<"&&e.charAt(e.length-1)===">"&&e.length>=3?s=[null,e,null]:s=w.exec(e);if(s&&(s[1]||!n)){if(s[1])return n=n instanceof v?n[0]:n,a=n&&n.nodeType?n.ownerDocument||n:i,e=v.parseHTML(s[1],a,!0),E.test(s[1])&&v.isPlainObject(n)&&this.attr.call(e,n,!0),v.merge(this,e);o=i.getElementById(s[2]);if(o&&o.parentNode){if(o.id!==s[2])return r.find(e);this.length=1,this[0]=o}return this.context=i,this.selector=e,this}return!n||n.jquery?(n||r).find(e):this.constructor(n).find(e)}return v.isFunction(e)?r.ready(e):(e.selector!==t&&(this.selector=e.selector,this.context=e.context),v.makeArray(e,this))},selector:"",jquery:"1.8.3",length:0,size:function(){return this.length},toArray:function(){return l.call(this)},get:function(e){return e==null?this.toArray():e<0?this[this.length+e]:this[e]},pushStack:function(e,t,n){var r=v.merge(this.constructor(),e);return r.prevObject=this,r.context=this.context,t==="find"?r.selector=this.selector+(this.selector?" ":"")+n:t&&(r.selector=this.selector+"."+t+"("+n+")"),r},each:function(e,t){return v.each(this,e,t)},ready:function(e){return v.ready.promise().done(e),this},eq:function(e){return e=+e,e===-1?this.slice(e):this.slice(e,e+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(l.apply(this,arguments),"slice",l.call(arguments).join(","))},map:function(e){return this.pushStack(v.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:[].sort,splice:[].splice},v.fn.init.prototype=v.fn,v.extend=v.fn.extend=function(){var e,n,r,i,s,o,u=arguments[0]||{},a=1,f=arguments.length,l=!1;typeof u=="boolean"&&(l=u,u=arguments[1]||{},a=2),typeof u!="object"&&!v.isFunction(u)&&(u={}),f===a&&(u=this,--a);for(;a<f;a++)if((e=arguments[a])!=null)for(n in e){r=u[n],i=e[n];if(u===i)continue;l&&i&&(v.isPlainObject(i)||(s=v.isArray(i)))?(s?(s=!1,o=r&&v.isArray(r)?r:[]):o=r&&v.isPlainObject(r)?r:{},u[n]=v.extend(l,o,i)):i!==t&&(u[n]=i)}return u},v.extend({noConflict:function(t){return e.$===v&&(e.$=a),t&&e.jQuery===v&&(e.jQuery=u),v},isReady:!1,readyWait:1,holdReady:function(e){e?v.readyWait++:v.ready(!0)},ready:function(e){if(e===!0?--v.readyWait:v.isReady)return;if(!i.body)return setTimeout(v.ready,1);v.isReady=!0;if(e!==!0&&--v.readyWait>0)return;r.resolveWith(i,[v]),v.fn.trigger&&v(i).trigger("ready").off("ready")},isFunction:function(e){return v.type(e)==="function"},isArray:Array.isArray||function(e){return v.type(e)==="array"},isWindow:function(e){return e!=null&&e==e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return e==null?String(e):O[h.call(e)]||"object"},isPlainObject:function(e){if(!e||v.type(e)!=="object"||e.nodeType||v.isWindow(e))return!1;try{if(e.constructor&&!p.call(e,"constructor")&&!p.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(n){return!1}var r;for(r in e);return r===t||p.call(e,r)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw new Error(e)},parseHTML:function(e,t,n){var r;return!e||typeof e!="string"?null:(typeof t=="boolean"&&(n=t,t=0),t=t||i,(r=E.exec(e))?[t.createElement(r[1])]:(r=v.buildFragment([e],t,n?null:[]),v.merge([],(r.cacheable?v.clone(r.fragment):r.fragment).childNodes)))},parseJSON:function(t){if(!t||typeof t!="string")return null;t=v.trim(t);if(e.JSON&&e.JSON.parse)return e.JSON.parse(t);if(S.test(t.replace(T,"@").replace(N,"]").replace(x,"")))return(new Function("return "+t))();v.error("Invalid JSON: "+t)},parseXML:function(n){var r,i;if(!n||typeof n!="string")return null;try{e.DOMParser?(i=new DOMParser,r=i.parseFromString(n,"text/xml")):(r=new ActiveXObject("Microsoft.XMLDOM"),r.async="false",r.loadXML(n))}catch(s){r=t}return(!r||!r.documentElement||r.getElementsByTagName("parsererror").length)&&v.error("Invalid XML: "+n),r},noop:function(){},globalEval:function(t){t&&g.test(t)&&(e.execScript||function(t){e.eval.call(e,t)})(t)},camelCase:function(e){return e.replace(C,"ms-").replace(k,L)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,n,r){var i,s=0,o=e.length,u=o===t||v.isFunction(e);if(r){if(u){for(i in e)if(n.apply(e[i],r)===!1)break}else for(;s<o;)if(n.apply(e[s++],r)===!1)break}else if(u){for(i in e)if(n.call(e[i],i,e[i])===!1)break}else for(;s<o;)if(n.call(e[s],s,e[s++])===!1)break;return e},trim:d&&!d.call("\ufeff\u00a0")?function(e){return e==null?"":d.call(e)}:function(e){return e==null?"":(e+"").replace(b,"")},makeArray:function(e,t){var n,r=t||[];return e!=null&&(n=v.type(e),e.length==null||n==="string"||n==="function"||n==="regexp"||v.isWindow(e)?f.call(r,e):v.merge(r,e)),r},inArray:function(e,t,n){var r;if(t){if(c)return c.call(t,e,n);r=t.length,n=n?n<0?Math.max(0,r+n):n:0;for(;n<r;n++)if(n in t&&t[n]===e)return n}return-1},merge:function(e,n){var r=n.length,i=e.length,s=0;if(typeof r=="number")for(;s<r;s++)e[i++]=n[s];else while(n[s]!==t)e[i++]=n[s++];return e.length=i,e},grep:function(e,t,n){var r,i=[],s=0,o=e.length;n=!!n;for(;s<o;s++)r=!!t(e[s],s),n!==r&&i.push(e[s]);return i},map:function(e,n,r){var i,s,o=[],u=0,a=e.length,f=e instanceof v||a!==t&&typeof a=="number"&&(a>0&&e[0]&&e[a-1]||a===0||v.isArray(e));if(f)for(;u<a;u++)i=n(e[u],u,r),i!=null&&(o[o.length]=i);else for(s in e)i=n(e[s],s,r),i!=null&&(o[o.length]=i);return o.concat.apply([],o)},guid:1,proxy:function(e,n){var r,i,s;return typeof n=="string"&&(r=e[n],n=e,e=r),v.isFunction(e)?(i=l.call(arguments,2),s=function(){return e.apply(n,i.concat(l.call(arguments)))},s.guid=e.guid=e.guid||v.guid++,s):t},access:function(e,n,r,i,s,o,u){var a,f=r==null,l=0,c=e.length;if(r&&typeof r=="object"){for(l in r)v.access(e,n,l,r[l],1,o,i);s=1}else if(i!==t){a=u===t&&v.isFunction(i),f&&(a?(a=n,n=function(e,t,n){return a.call(v(e),n)}):(n.call(e,i),n=null));if(n)for(;l<c;l++)n(e[l],r,a?i.call(e[l],l,n(e[l],r)):i,u);s=1}return s?e:f?n.call(e):c?n(e[0],r):o},now:function(){return(new Date).getTime()}}),v.ready.promise=function(t){if(!r){r=v.Deferred();if(i.readyState==="complete")setTimeout(v.ready,1);else if(i.addEventListener)i.addEventListener("DOMContentLoaded",A,!1),e.addEventListener("load",v.ready,!1);else{i.attachEvent("onreadystatechange",A),e.attachEvent("onload",v.ready);var n=!1;try{n=e.frameElement==null&&i.documentElement}catch(s){}n&&n.doScroll&&function o(){if(!v.isReady){try{n.doScroll("left")}catch(e){return setTimeout(o,50)}v.ready()}}()}}return r.promise(t)},v.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(e,t){O["[object "+t+"]"]=t.toLowerCase()}),n=v(i);var M={};v.Callbacks=function(e){e=typeof e=="string"?M[e]||_(e):v.extend({},e);var n,r,i,s,o,u,a=[],f=!e.once&&[],l=function(t){n=e.memory&&t,r=!0,u=s||0,s=0,o=a.length,i=!0;for(;a&&u<o;u++)if(a[u].apply(t[0],t[1])===!1&&e.stopOnFalse){n=!1;break}i=!1,a&&(f?f.length&&l(f.shift()):n?a=[]:c.disable())},c={add:function(){if(a){var t=a.length;(function r(t){v.each(t,function(t,n){var i=v.type(n);i==="function"?(!e.unique||!c.has(n))&&a.push(n):n&&n.length&&i!=="string"&&r(n)})})(arguments),i?o=a.length:n&&(s=t,l(n))}return this},remove:function(){return a&&v.each(arguments,function(e,t){var n;while((n=v.inArray(t,a,n))>-1)a.splice(n,1),i&&(n<=o&&o--,n<=u&&u--)}),this},has:function(e){return v.inArray(e,a)>-1},empty:function(){return a=[],this},disable:function(){return a=f=n=t,this},disabled:function(){return!a},lock:function(){return f=t,n||c.disable(),this},locked:function(){return!f},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],a&&(!r||f)&&(i?f.push(t):l(t)),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!r}};return c},v.extend({Deferred:function(e){var t=[["resolve","done",v.Callbacks("once memory"),"resolved"],["reject","fail",v.Callbacks("once memory"),"rejected"],["notify","progress",v.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return v.Deferred(function(n){v.each(t,function(t,r){var s=r[0],o=e[t];i[r[1]](v.isFunction(o)?function(){var e=o.apply(this,arguments);e&&v.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===i?n:this,[e])}:n[s])}),e=null}).promise()},promise:function(e){return e!=null?v.extend(e,r):r}},i={};return r.pipe=r.then,v.each(t,function(e,s){var o=s[2],u=s[3];r[s[1]]=o.add,u&&o.add(function(){n=u},t[e^1][2].disable,t[2][2].lock),i[s[0]]=o.fire,i[s[0]+"With"]=o.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=l.call(arguments),r=n.length,i=r!==1||e&&v.isFunction(e.promise)?r:0,s=i===1?e:v.Deferred(),o=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?l.call(arguments):r,n===u?s.notifyWith(t,n):--i||s.resolveWith(t,n)}},u,a,f;if(r>1){u=new Array(r),a=new Array(r),f=new Array(r);for(;t<r;t++)n[t]&&v.isFunction(n[t].promise)?n[t].promise().done(o(t,f,n)).fail(s.reject).progress(o(t,a,u)):--i}return i||s.resolveWith(f,n),s.promise()}}),v.support=function(){var t,n,r,s,o,u,a,f,l,c,h,p=i.createElement("div");p.setAttribute("className","t"),p.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",n=p.getElementsByTagName("*"),r=p.getElementsByTagName("a")[0];if(!n||!r||!n.length)return{};s=i.createElement("select"),o=s.appendChild(i.createElement("option")),u=p.getElementsByTagName("input")[0],r.style.cssText="top:1px;float:left;opacity:.5",t={leadingWhitespace:p.firstChild.nodeType===3,tbody:!p.getElementsByTagName("tbody").length,htmlSerialize:!!p.getElementsByTagName("link").length,style:/top/.test(r.getAttribute("style")),hrefNormalized:r.getAttribute("href")==="/a",opacity:/^0.5/.test(r.style.opacity),cssFloat:!!r.style.cssFloat,checkOn:u.value==="on",optSelected:o.selected,getSetAttribute:p.className!=="t",enctype:!!i.createElement("form").enctype,html5Clone:i.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",boxModel:i.compatMode==="CSS1Compat",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},u.checked=!0,t.noCloneChecked=u.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!o.disabled;try{delete p.test}catch(d){t.deleteExpando=!1}!p.addEventListener&&p.attachEvent&&p.fireEvent&&(p.attachEvent("onclick",h=function(){t.noCloneEvent=!1}),p.cloneNode(!0).fireEvent("onclick"),p.detachEvent("onclick",h)),u=i.createElement("input"),u.value="t",u.setAttribute("type","radio"),t.radioValue=u.value==="t",u.setAttribute("checked","checked"),u.setAttribute("name","t"),p.appendChild(u),a=i.createDocumentFragment(),a.appendChild(p.lastChild),t.checkClone=a.cloneNode(!0).cloneNode(!0).lastChild.checked,t.appendChecked=u.checked,a.removeChild(u),a.appendChild(p);if(p.attachEvent)for(l in{submit:!0,change:!0,focusin:!0})f="on"+l,c=f in p,c||(p.setAttribute(f,"return;"),c=typeof p[f]=="function"),t[l+"Bubbles"]=c;return v(function(){var n,r,s,o,u="padding:0;margin:0;border:0;display:block;overflow:hidden;",a=i.getElementsByTagName("body")[0];if(!a)return;n=i.createElement("div"),n.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",a.insertBefore(n,a.firstChild),r=i.createElement("div"),n.appendChild(r),r.innerHTML="<table><tr><td></td><td>t</td></tr></table>",s=r.getElementsByTagName("td"),s[0].style.cssText="padding:0;margin:0;border:0;display:none",c=s[0].offsetHeight===0,s[0].style.display="",s[1].style.display="none",t.reliableHiddenOffsets=c&&s[0].offsetHeight===0,r.innerHTML="",r.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",t.boxSizing=r.offsetWidth===4,t.doesNotIncludeMarginInBodyOffset=a.offsetTop!==1,e.getComputedStyle&&(t.pixelPosition=(e.getComputedStyle(r,null)||{}).top!=="1%",t.boxSizingReliable=(e.getComputedStyle(r,null)||{width:"4px"}).width==="4px",o=i.createElement("div"),o.style.cssText=r.style.cssText=u,o.style.marginRight=o.style.width="0",r.style.width="1px",r.appendChild(o),t.reliableMarginRight=!parseFloat((e.getComputedStyle(o,null)||{}).marginRight)),typeof r.style.zoom!="undefined"&&(r.innerHTML="",r.style.cssText=u+"width:1px;padding:1px;display:inline;zoom:1",t.inlineBlockNeedsLayout=r.offsetWidth===3,r.style.display="block",r.style.overflow="visible",r.innerHTML="<div></div>",r.firstChild.style.width="5px",t.shrinkWrapBlocks=r.offsetWidth!==3,n.style.zoom=1),a.removeChild(n),n=r=s=o=null}),a.removeChild(p),n=r=s=o=u=a=p=null,t}();var D=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,P=/([A-Z])/g;v.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+(v.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(e){return e=e.nodeType?v.cache[e[v.expando]]:e[v.expando],!!e&&!B(e)},data:function(e,n,r,i){if(!v.acceptData(e))return;var s,o,u=v.expando,a=typeof n=="string",f=e.nodeType,l=f?v.cache:e,c=f?e[u]:e[u]&&u;if((!c||!l[c]||!i&&!l[c].data)&&a&&r===t)return;c||(f?e[u]=c=v.deletedIds.pop()||v.guid++:c=u),l[c]||(l[c]={},f||(l[c].toJSON=v.noop));if(typeof n=="object"||typeof n=="function")i?l[c]=v.extend(l[c],n):l[c].data=v.extend(l[c].data,n);return s=l[c],i||(s.data||(s.data={}),s=s.data),r!==t&&(s[v.camelCase(n)]=r),a?(o=s[n],o==null&&(o=s[v.camelCase(n)])):o=s,o},removeData:function(e,t,n){if(!v.acceptData(e))return;var r,i,s,o=e.nodeType,u=o?v.cache:e,a=o?e[v.expando]:v.expando;if(!u[a])return;if(t){r=n?u[a]:u[a].data;if(r){v.isArray(t)||(t in r?t=[t]:(t=v.camelCase(t),t in r?t=[t]:t=t.split(" ")));for(i=0,s=t.length;i<s;i++)delete r[t[i]];if(!(n?B:v.isEmptyObject)(r))return}}if(!n){delete u[a].data;if(!B(u[a]))return}o?v.cleanData([e],!0):v.support.deleteExpando||u!=u.window?delete u[a]:u[a]=null},_data:function(e,t,n){return v.data(e,t,n,!0)},acceptData:function(e){var t=e.nodeName&&v.noData[e.nodeName.toLowerCase()];return!t||t!==!0&&e.getAttribute("classid")===t}}),v.fn.extend({data:function(e,n){var r,i,s,o,u,a=this[0],f=0,l=null;if(e===t){if(this.length){l=v.data(a);if(a.nodeType===1&&!v._data(a,"parsedAttrs")){s=a.attributes;for(u=s.length;f<u;f++)o=s[f].name,o.indexOf("data-")||(o=v.camelCase(o.substring(5)),H(a,o,l[o]));v._data(a,"parsedAttrs",!0)}}return l}return typeof e=="object"?this.each(function(){v.data(this,e)}):(r=e.split(".",2),r[1]=r[1]?"."+r[1]:"",i=r[1]+"!",v.access(this,function(n){if(n===t)return l=this.triggerHandler("getData"+i,[r[0]]),l===t&&a&&(l=v.data(a,e),l=H(a,e,l)),l===t&&r[1]?this.data(r[0]):l;r[1]=n,this.each(function(){var t=v(this);t.triggerHandler("setData"+i,r),v.data(this,e,n),t.triggerHandler("changeData"+i,r)})},null,n,arguments.length>1,null,!1))},removeData:function(e){return this.each(function(){v.removeData(this,e)})}}),v.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=v._data(e,t),n&&(!r||v.isArray(n)?r=v._data(e,t,v.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=v.queue(e,t),r=n.length,i=n.shift(),s=v._queueHooks(e,t),o=function(){v.dequeue(e,t)};i==="inprogress"&&(i=n.shift(),r--),i&&(t==="fx"&&n.unshift("inprogress"),delete s.stop,i.call(e,o,s)),!r&&s&&s.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return v._data(e,n)||v._data(e,n,{empty:v.Callbacks("once memory").add(function(){v.removeData(e,t+"queue",!0),v.removeData(e,n,!0)})})}}),v.fn.extend({queue:function(e,n){var r=2;return typeof e!="string"&&(n=e,e="fx",r--),arguments.length<r?v.queue(this[0],e):n===t?this:this.each(function(){var t=v.queue(this,e,n);v._queueHooks(this,e),e==="fx"&&t[0]!=="inprogress"&&v.dequeue(this,e)})},dequeue:function(e){return this.each(function(){v.dequeue(this,e)})},delay:function(e,t){return e=v.fx?v.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,n){var r,i=1,s=v.Deferred(),o=this,u=this.length,a=function(){--i||s.resolveWith(o,[o])};typeof e!="string"&&(n=e,e=t),e=e||"fx";while(u--)r=v._data(o[u],e+"queueHooks"),r&&r.empty&&(i++,r.empty.add(a));return a(),s.promise(n)}});var j,F,I,q=/[\t\r\n]/g,R=/\r/g,U=/^(?:button|input)$/i,z=/^(?:button|input|object|select|textarea)$/i,W=/^a(?:rea|)$/i,X=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,V=v.support.getSetAttribute;v.fn.extend({attr:function(e,t){return v.access(this,v.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){v.removeAttr(this,e)})},prop:function(e,t){return v.access(this,v.prop,e,t,arguments.length>1)},removeProp:function(e){return e=v.propFix[e]||e,this.each(function(){try{this[e]=t,delete this[e]}catch(n){}})},addClass:function(e){var t,n,r,i,s,o,u;if(v.isFunction(e))return this.each(function(t){v(this).addClass(e.call(this,t,this.className))});if(e&&typeof e=="string"){t=e.split(y);for(n=0,r=this.length;n<r;n++){i=this[n];if(i.nodeType===1)if(!i.className&&t.length===1)i.className=e;else{s=" "+i.className+" ";for(o=0,u=t.length;o<u;o++)s.indexOf(" "+t[o]+" ")<0&&(s+=t[o]+" ");i.className=v.trim(s)}}}return this},removeClass:function(e){var n,r,i,s,o,u,a;if(v.isFunction(e))return this.each(function(t){v(this).removeClass(e.call(this,t,this.className))});if(e&&typeof e=="string"||e===t){n=(e||"").split(y);for(u=0,a=this.length;u<a;u++){i=this[u];if(i.nodeType===1&&i.className){r=(" "+i.className+" ").replace(q," ");for(s=0,o=n.length;s<o;s++)while(r.indexOf(" "+n[s]+" ")>=0)r=r.replace(" "+n[s]+" "," ");i.className=e?v.trim(r):""}}}return this},toggleClass:function(e,t){var n=typeof e,r=typeof t=="boolean";return v.isFunction(e)?this.each(function(n){v(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if(n==="string"){var i,s=0,o=v(this),u=t,a=e.split(y);while(i=a[s++])u=r?u:!o.hasClass(i),o[u?"addClass":"removeClass"](i)}else if(n==="undefined"||n==="boolean")this.className&&v._data(this,"__className__",this.className),this.className=this.className||e===!1?"":v._data(this,"__className__")||""})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;n<r;n++)if(this[n].nodeType===1&&(" "+this[n].className+" ").replace(q," ").indexOf(t)>=0)return!0;return!1},val:function(e){var n,r,i,s=this[0];if(!arguments.length){if(s)return n=v.valHooks[s.type]||v.valHooks[s.nodeName.toLowerCase()],n&&"get"in n&&(r=n.get(s,"value"))!==t?r:(r=s.value,typeof r=="string"?r.replace(R,""):r==null?"":r);return}return i=v.isFunction(e),this.each(function(r){var s,o=v(this);if(this.nodeType!==1)return;i?s=e.call(this,r,o.val()):s=e,s==null?s="":typeof s=="number"?s+="":v.isArray(s)&&(s=v.map(s,function(e){return e==null?"":e+""})),n=v.valHooks[this.type]||v.valHooks[this.nodeName.toLowerCase()];if(!n||!("set"in n)||n.set(this,s,"value")===t)this.value=s})}}),v.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,s=e.type==="select-one"||i<0,o=s?null:[],u=s?i+1:r.length,a=i<0?u:s?i:0;for(;a<u;a++){n=r[a];if((n.selected||a===i)&&(v.support.optDisabled?!n.disabled:n.getAttribute("disabled")===null)&&(!n.parentNode.disabled||!v.nodeName(n.parentNode,"optgroup"))){t=v(n).val();if(s)return t;o.push(t)}}return o},set:function(e,t){var n=v.makeArray(t);return v(e).find("option").each(function(){this.selected=v.inArray(v(this).val(),n)>=0}),n.length||(e.selectedIndex=-1),n}}},attrFn:{},attr:function(e,n,r,i){var s,o,u,a=e.nodeType;if(!e||a===3||a===8||a===2)return;if(i&&v.isFunction(v.fn[n]))return v(e)[n](r);if(typeof e.getAttribute=="undefined")return v.prop(e,n,r);u=a!==1||!v.isXMLDoc(e),u&&(n=n.toLowerCase(),o=v.attrHooks[n]||(X.test(n)?F:j));if(r!==t){if(r===null){v.removeAttr(e,n);return}return o&&"set"in o&&u&&(s=o.set(e,r,n))!==t?s:(e.setAttribute(n,r+""),r)}return o&&"get"in o&&u&&(s=o.get(e,n))!==null?s:(s=e.getAttribute(n),s===null?t:s)},removeAttr:function(e,t){var n,r,i,s,o=0;if(t&&e.nodeType===1){r=t.split(y);for(;o<r.length;o++)i=r[o],i&&(n=v.propFix[i]||i,s=X.test(i),s||v.attr(e,i,""),e.removeAttribute(V?i:n),s&&n in e&&(e[n]=!1))}},attrHooks:{type:{set:function(e,t){if(U.test(e.nodeName)&&e.parentNode)v.error("type property can't be changed");else if(!v.support.radioValue&&t==="radio"&&v.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}},value:{get:function(e,t){return j&&v.nodeName(e,"button")?j.get(e,t):t in e?e.value:null},set:function(e,t,n){if(j&&v.nodeName(e,"button"))return j.set(e,t,n);e.value=t}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(e,n,r){var i,s,o,u=e.nodeType;if(!e||u===3||u===8||u===2)return;return o=u!==1||!v.isXMLDoc(e),o&&(n=v.propFix[n]||n,s=v.propHooks[n]),r!==t?s&&"set"in s&&(i=s.set(e,r,n))!==t?i:e[n]=r:s&&"get"in s&&(i=s.get(e,n))!==null?i:e[n]},propHooks:{tabIndex:{get:function(e){var n=e.getAttributeNode("tabindex");return n&&n.specified?parseInt(n.value,10):z.test(e.nodeName)||W.test(e.nodeName)&&e.href?0:t}}}}),F={get:function(e,n){var r,i=v.prop(e,n);return i===!0||typeof i!="boolean"&&(r=e.getAttributeNode(n))&&r.nodeValue!==!1?n.toLowerCase():t},set:function(e,t,n){var r;return t===!1?v.removeAttr(e,n):(r=v.propFix[n]||n,r in e&&(e[r]=!0),e.setAttribute(n,n.toLowerCase())),n}},V||(I={name:!0,id:!0,coords:!0},j=v.valHooks.button={get:function(e,n){var r;return r=e.getAttributeNode(n),r&&(I[n]?r.value!=="":r.specified)?r.value:t},set:function(e,t,n){var r=e.getAttributeNode(n);return r||(r=i.createAttribute(n),e.setAttributeNode(r)),r.value=t+""}},v.each(["width","height"],function(e,t){v.attrHooks[t]=v.extend(v.attrHooks[t],{set:function(e,n){if(n==="")return e.setAttribute(t,"auto"),n}})}),v.attrHooks.contenteditable={get:j.get,set:function(e,t,n){t===""&&(t="false"),j.set(e,t,n)}}),v.support.hrefNormalized||v.each(["href","src","width","height"],function(e,n){v.attrHooks[n]=v.extend(v.attrHooks[n],{get:function(e){var r=e.getAttribute(n,2);return r===null?t:r}})}),v.support.style||(v.attrHooks.style={get:function(e){return e.style.cssText.toLowerCase()||t},set:function(e,t){return e.style.cssText=t+""}}),v.support.optSelected||(v.propHooks.selected=v.extend(v.propHooks.selected,{get:function(e){var t=e.parentNode;return t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex),null}})),v.support.enctype||(v.propFix.enctype="encoding"),v.support.checkOn||v.each(["radio","checkbox"],function(){v.valHooks[this]={get:function(e){return e.getAttribute("value")===null?"on":e.value}}}),v.each(["radio","checkbox"],function(){v.valHooks[this]=v.extend(v.valHooks[this],{set:function(e,t){if(v.isArray(t))return e.checked=v.inArray(v(e).val(),t)>=0}})});var $=/^(?:textarea|input|select)$/i,J=/^([^\.]*|)(?:\.(.+)|)$/,K=/(?:^|\s)hover(\.\S+|)\b/,Q=/^key/,G=/^(?:mouse|contextmenu)|click/,Y=/^(?:focusinfocus|focusoutblur)$/,Z=function(e){return v.event.special.hover?e:e.replace(K,"mouseenter$1 mouseleave$1")};v.event={add:function(e,n,r,i,s){var o,u,a,f,l,c,h,p,d,m,g;if(e.nodeType===3||e.nodeType===8||!n||!r||!(o=v._data(e)))return;r.handler&&(d=r,r=d.handler,s=d.selector),r.guid||(r.guid=v.guid++),a=o.events,a||(o.events=a={}),u=o.handle,u||(o.handle=u=function(e){return typeof v=="undefined"||!!e&&v.event.triggered===e.type?t:v.event.dispatch.apply(u.elem,arguments)},u.elem=e),n=v.trim(Z(n)).split(" ");for(f=0;f<n.length;f++){l=J.exec(n[f])||[],c=l[1],h=(l[2]||"").split(".").sort(),g=v.event.special[c]||{},c=(s?g.delegateType:g.bindType)||c,g=v.event.special[c]||{},p=v.extend({type:c,origType:l[1],data:i,handler:r,guid:r.guid,selector:s,needsContext:s&&v.expr.match.needsContext.test(s),namespace:h.join(".")},d),m=a[c];if(!m){m=a[c]=[],m.delegateCount=0;if(!g.setup||g.setup.call(e,i,h,u)===!1)e.addEventListener?e.addEventListener(c,u,!1):e.attachEvent&&e.attachEvent("on"+c,u)}g.add&&(g.add.call(e,p),p.handler.guid||(p.handler.guid=r.guid)),s?m.splice(m.delegateCount++,0,p):m.push(p),v.event.global[c]=!0}e=null},global:{},remove:function(e,t,n,r,i){var s,o,u,a,f,l,c,h,p,d,m,g=v.hasData(e)&&v._data(e);if(!g||!(h=g.events))return;t=v.trim(Z(t||"")).split(" ");for(s=0;s<t.length;s++){o=J.exec(t[s])||[],u=a=o[1],f=o[2];if(!u){for(u in h)v.event.remove(e,u+t[s],n,r,!0);continue}p=v.event.special[u]||{},u=(r?p.delegateType:p.bindType)||u,d=h[u]||[],l=d.length,f=f?new RegExp("(^|\\.)"+f.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null;for(c=0;c<d.length;c++)m=d[c],(i||a===m.origType)&&(!n||n.guid===m.guid)&&(!f||f.test(m.namespace))&&(!r||r===m.selector||r==="**"&&m.selector)&&(d.splice(c--,1),m.selector&&d.delegateCount--,p.remove&&p.remove.call(e,m));d.length===0&&l!==d.length&&((!p.teardown||p.teardown.call(e,f,g.handle)===!1)&&v.removeEvent(e,u,g.handle),delete h[u])}v.isEmptyObject(h)&&(delete g.handle,v.removeData(e,"events",!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(n,r,s,o){if(!s||s.nodeType!==3&&s.nodeType!==8){var u,a,f,l,c,h,p,d,m,g,y=n.type||n,b=[];if(Y.test(y+v.event.triggered))return;y.indexOf("!")>=0&&(y=y.slice(0,-1),a=!0),y.indexOf(".")>=0&&(b=y.split("."),y=b.shift(),b.sort());if((!s||v.event.customEvent[y])&&!v.event.global[y])return;n=typeof n=="object"?n[v.expando]?n:new v.Event(y,n):new v.Event(y),n.type=y,n.isTrigger=!0,n.exclusive=a,n.namespace=b.join("."),n.namespace_re=n.namespace?new RegExp("(^|\\.)"+b.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,h=y.indexOf(":")<0?"on"+y:"";if(!s){u=v.cache;for(f in u)u[f].events&&u[f].events[y]&&v.event.trigger(n,r,u[f].handle.elem,!0);return}n.result=t,n.target||(n.target=s),r=r!=null?v.makeArray(r):[],r.unshift(n),p=v.event.special[y]||{};if(p.trigger&&p.trigger.apply(s,r)===!1)return;m=[[s,p.bindType||y]];if(!o&&!p.noBubble&&!v.isWindow(s)){g=p.delegateType||y,l=Y.test(g+y)?s:s.parentNode;for(c=s;l;l=l.parentNode)m.push([l,g]),c=l;c===(s.ownerDocument||i)&&m.push([c.defaultView||c.parentWindow||e,g])}for(f=0;f<m.length&&!n.isPropagationStopped();f++)l=m[f][0],n.type=m[f][1],d=(v._data(l,"events")||{})[n.type]&&v._data(l,"handle"),d&&d.apply(l,r),d=h&&l[h],d&&v.acceptData(l)&&d.apply&&d.apply(l,r)===!1&&n.preventDefault();return n.type=y,!o&&!n.isDefaultPrevented()&&(!p._default||p._default.apply(s.ownerDocument,r)===!1)&&(y!=="click"||!v.nodeName(s,"a"))&&v.acceptData(s)&&h&&s[y]&&(y!=="focus"&&y!=="blur"||n.target.offsetWidth!==0)&&!v.isWindow(s)&&(c=s[h],c&&(s[h]=null),v.event.triggered=y,s[y](),v.event.triggered=t,c&&(s[h]=c)),n.result}return},dispatch:function(n){n=v.event.fix(n||e.event);var r,i,s,o,u,a,f,c,h,p,d=(v._data(this,"events")||{})[n.type]||[],m=d.delegateCount,g=l.call(arguments),y=!n.exclusive&&!n.namespace,b=v.event.special[n.type]||{},w=[];g[0]=n,n.delegateTarget=this;if(b.preDispatch&&b.preDispatch.call(this,n)===!1)return;if(m&&(!n.button||n.type!=="click"))for(s=n.target;s!=this;s=s.parentNode||this)if(s.disabled!==!0||n.type!=="click"){u={},f=[];for(r=0;r<m;r++)c=d[r],h=c.selector,u[h]===t&&(u[h]=c.needsContext?v(h,this).index(s)>=0:v.find(h,this,null,[s]).length),u[h]&&f.push(c);f.length&&w.push({elem:s,matches:f})}d.length>m&&w.push({elem:this,matches:d.slice(m)});for(r=0;r<w.length&&!n.isPropagationStopped();r++){a=w[r],n.currentTarget=a.elem;for(i=0;i<a.matches.length&&!n.isImmediatePropagationStopped();i++){c=a.matches[i];if(y||!n.namespace&&!c.namespace||n.namespace_re&&n.namespace_re.test(c.namespace))n.data=c.data,n.handleObj=c,o=((v.event.special[c.origType]||{}).handle||c.handler).apply(a.elem,g),o!==t&&(n.result=o,o===!1&&(n.preventDefault(),n.stopPropagation()))}}return b.postDispatch&&b.postDispatch.call(this,n),n.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return e.which==null&&(e.which=t.charCode!=null?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,n){var r,s,o,u=n.button,a=n.fromElement;return e.pageX==null&&n.clientX!=null&&(r=e.target.ownerDocument||i,s=r.documentElement,o=r.body,e.pageX=n.clientX+(s&&s.scrollLeft||o&&o.scrollLeft||0)-(s&&s.clientLeft||o&&o.clientLeft||0),e.pageY=n.clientY+(s&&s.scrollTop||o&&o.scrollTop||0)-(s&&s.clientTop||o&&o.clientTop||0)),!e.relatedTarget&&a&&(e.relatedTarget=a===e.target?n.toElement:a),!e.which&&u!==t&&(e.which=u&1?1:u&2?3:u&4?2:0),e}},fix:function(e){if(e[v.expando])return e;var t,n,r=e,s=v.event.fixHooks[e.type]||{},o=s.props?this.props.concat(s.props):this.props;e=v.Event(r);for(t=o.length;t;)n=o[--t],e[n]=r[n];return e.target||(e.target=r.srcElement||i),e.target.nodeType===3&&(e.target=e.target.parentNode),e.metaKey=!!e.metaKey,s.filter?s.filter(e,r):e},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(e,t,n){v.isWindow(this)&&(this.onbeforeunload=n)},teardown:function(e,t){this.onbeforeunload===t&&(this.onbeforeunload=null)}}},simulate:function(e,t,n,r){var i=v.extend(new v.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?v.event.trigger(i,null,t):v.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},v.event.handle=v.event.dispatch,v.removeEvent=i.removeEventListener?function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)}:function(e,t,n){var r="on"+t;e.detachEvent&&(typeof e[r]=="undefined"&&(e[r]=null),e.detachEvent(r,n))},v.Event=function(e,t){if(!(this instanceof v.Event))return new v.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault()?tt:et):this.type=e,t&&v.extend(this,t),this.timeStamp=e&&e.timeStamp||v.now(),this[v.expando]=!0},v.Event.prototype={preventDefault:function(){this.isDefaultPrevented=tt;var e=this.originalEvent;if(!e)return;e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=tt;var e=this.originalEvent;if(!e)return;e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=tt,this.stopPropagation()},isDefaultPrevented:et,isPropagationStopped:et,isImmediatePropagationStopped:et},v.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){v.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,s=e.handleObj,o=s.selector;if(!i||i!==r&&!v.contains(r,i))e.type=s.origType,n=s.handler.apply(this,arguments),e.type=t;return n}}}),v.support.submitBubbles||(v.event.special.submit={setup:function(){if(v.nodeName(this,"form"))return!1;v.event.add(this,"click._submit keypress._submit",function(e){var n=e.target,r=v.nodeName(n,"input")||v.nodeName(n,"button")?n.form:t;r&&!v._data(r,"_submit_attached")&&(v.event.add(r,"submit._submit",function(e){e._submit_bubble=!0}),v._data(r,"_submit_attached",!0))})},postDispatch:function(e){e._submit_bubble&&(delete e._submit_bubble,this.parentNode&&!e.isTrigger&&v.event.simulate("submit",this.parentNode,e,!0))},teardown:function(){if(v.nodeName(this,"form"))return!1;v.event.remove(this,"._submit")}}),v.support.changeBubbles||(v.event.special.change={setup:function(){if($.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")v.event.add(this,"propertychange._change",function(e){e.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),v.event.add(this,"click._change",function(e){this._just_changed&&!e.isTrigger&&(this._just_changed=!1),v.event.simulate("change",this,e,!0)});return!1}v.event.add(this,"beforeactivate._change",function(e){var t=e.target;$.test(t.nodeName)&&!v._data(t,"_change_attached")&&(v.event.add(t,"change._change",function(e){this.parentNode&&!e.isSimulated&&!e.isTrigger&&v.event.simulate("change",this.parentNode,e,!0)}),v._data(t,"_change_attached",!0))})},handle:function(e){var t=e.target;if(this!==t||e.isSimulated||e.isTrigger||t.type!=="radio"&&t.type!=="checkbox")return e.handleObj.handler.apply(this,arguments)},teardown:function(){return v.event.remove(this,"._change"),!$.test(this.nodeName)}}),v.support.focusinBubbles||v.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){v.event.simulate(t,e.target,v.event.fix(e),!0)};v.event.special[t]={setup:function(){n++===0&&i.addEventListener(e,r,!0)},teardown:function(){--n===0&&i.removeEventListener(e,r,!0)}}}),v.fn.extend({on:function(e,n,r,i,s){var o,u;if(typeof e=="object"){typeof n!="string"&&(r=r||n,n=t);for(u in e)this.on(u,n,r,e[u],s);return this}r==null&&i==null?(i=n,r=n=t):i==null&&(typeof n=="string"?(i=r,r=t):(i=r,r=n,n=t));if(i===!1)i=et;else if(!i)return this;return s===1&&(o=i,i=function(e){return v().off(e),o.apply(this,arguments)},i.guid=o.guid||(o.guid=v.guid++)),this.each(function(){v.event.add(this,e,i,r,n)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,n,r){var i,s;if(e&&e.preventDefault&&e.handleObj)return i=e.handleObj,v(e.delegateTarget).off(i.namespace?i.origType+"."+i.namespace:i.origType,i.selector,i.handler),this;if(typeof e=="object"){for(s in e)this.off(s,n,e[s]);return this}if(n===!1||typeof n=="function")r=n,n=t;return r===!1&&(r=et),this.each(function(){v.event.remove(this,e,r,n)})},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},live:function(e,t,n){return v(this.context).on(e,this.selector,t,n),this},die:function(e,t){return v(this.context).off(e,this.selector||"**",t),this},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return arguments.length===1?this.off(e,"**"):this.off(t,e||"**",n)},trigger:function(e,t){return this.each(function(){v.event.trigger(e,t,this)})},triggerHandler:function(e,t){if(this[0])return v.event.trigger(e,t,this[0],!0)},toggle:function(e){var t=arguments,n=e.guid||v.guid++,r=0,i=function(n){var i=(v._data(this,"lastToggle"+e.guid)||0)%r;return v._data(this,"lastToggle"+e.guid,i+1),n.preventDefault(),t[i].apply(this,arguments)||!1};i.guid=n;while(r<t.length)t[r++].guid=n;return this.click(i)},hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),v.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){v.fn[t]=function(e,n){return n==null&&(n=e,e=null),arguments.length>0?this.on(t,null,e,n):this.trigger(t)},Q.test(t)&&(v.event.fixHooks[t]=v.event.keyHooks),G.test(t)&&(v.event.fixHooks[t]=v.event.mouseHooks)}),function(e,t){function nt(e,t,n,r){n=n||[],t=t||g;var i,s,a,f,l=t.nodeType;if(!e||typeof e!="string")return n;if(l!==1&&l!==9)return[];a=o(t);if(!a&&!r)if(i=R.exec(e))if(f=i[1]){if(l===9){s=t.getElementById(f);if(!s||!s.parentNode)return n;if(s.id===f)return n.push(s),n}else if(t.ownerDocument&&(s=t.ownerDocument.getElementById(f))&&u(t,s)&&s.id===f)return n.push(s),n}else{if(i[2])return S.apply(n,x.call(t.getElementsByTagName(e),0)),n;if((f=i[3])&&Z&&t.getElementsByClassName)return S.apply(n,x.call(t.getElementsByClassName(f),0)),n}return vt(e.replace(j,"$1"),t,n,r,a)}function rt(e){return function(t){var n=t.nodeName.toLowerCase();return n==="input"&&t.type===e}}function it(e){return function(t){var n=t.nodeName.toLowerCase();return(n==="input"||n==="button")&&t.type===e}}function st(e){return N(function(t){return t=+t,N(function(n,r){var i,s=e([],n.length,t),o=s.length;while(o--)n[i=s[o]]&&(n[i]=!(r[i]=n[i]))})})}function ot(e,t,n){if(e===t)return n;var r=e.nextSibling;while(r){if(r===t)return-1;r=r.nextSibling}return 1}function ut(e,t){var n,r,s,o,u,a,f,l=L[d][e+" "];if(l)return t?0:l.slice(0);u=e,a=[],f=i.preFilter;while(u){if(!n||(r=F.exec(u)))r&&(u=u.slice(r[0].length)||u),a.push(s=[]);n=!1;if(r=I.exec(u))s.push(n=new m(r.shift())),u=u.slice(n.length),n.type=r[0].replace(j," ");for(o in i.filter)(r=J[o].exec(u))&&(!f[o]||(r=f[o](r)))&&(s.push(n=new m(r.shift())),u=u.slice(n.length),n.type=o,n.matches=r);if(!n)break}return t?u.length:u?nt.error(e):L(e,a).slice(0)}function at(e,t,r){var i=t.dir,s=r&&t.dir==="parentNode",o=w++;return t.first?function(t,n,r){while(t=t[i])if(s||t.nodeType===1)return e(t,n,r)}:function(t,r,u){if(!u){var a,f=b+" "+o+" ",l=f+n;while(t=t[i])if(s||t.nodeType===1){if((a=t[d])===l)return t.sizset;if(typeof a=="string"&&a.indexOf(f)===0){if(t.sizset)return t}else{t[d]=l;if(e(t,r,u))return t.sizset=!0,t;t.sizset=!1}}}else while(t=t[i])if(s||t.nodeType===1)if(e(t,r,u))return t}}function ft(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function lt(e,t,n,r,i){var s,o=[],u=0,a=e.length,f=t!=null;for(;u<a;u++)if(s=e[u])if(!n||n(s,r,i))o.push(s),f&&t.push(u);return o}function ct(e,t,n,r,i,s){return r&&!r[d]&&(r=ct(r)),i&&!i[d]&&(i=ct(i,s)),N(function(s,o,u,a){var f,l,c,h=[],p=[],d=o.length,v=s||dt(t||"*",u.nodeType?[u]:u,[]),m=e&&(s||!t)?lt(v,h,e,u,a):v,g=n?i||(s?e:d||r)?[]:o:m;n&&n(m,g,u,a);if(r){f=lt(g,p),r(f,[],u,a),l=f.length;while(l--)if(c=f[l])g[p[l]]=!(m[p[l]]=c)}if(s){if(i||e){if(i){f=[],l=g.length;while(l--)(c=g[l])&&f.push(m[l]=c);i(null,g=[],f,a)}l=g.length;while(l--)(c=g[l])&&(f=i?T.call(s,c):h[l])>-1&&(s[f]=!(o[f]=c))}}else g=lt(g===o?g.splice(d,g.length):g),i?i(null,o,g,a):S.apply(o,g)})}function ht(e){var t,n,r,s=e.length,o=i.relative[e[0].type],u=o||i.relative[" "],a=o?1:0,f=at(function(e){return e===t},u,!0),l=at(function(e){return T.call(t,e)>-1},u,!0),h=[function(e,n,r){return!o&&(r||n!==c)||((t=n).nodeType?f(e,n,r):l(e,n,r))}];for(;a<s;a++)if(n=i.relative[e[a].type])h=[at(ft(h),n)];else{n=i.filter[e[a].type].apply(null,e[a].matches);if(n[d]){r=++a;for(;r<s;r++)if(i.relative[e[r].type])break;return ct(a>1&&ft(h),a>1&&e.slice(0,a-1).join("").replace(j,"$1"),n,a<r&&ht(e.slice(a,r)),r<s&&ht(e=e.slice(r)),r<s&&e.join(""))}h.push(n)}return ft(h)}function pt(e,t){var r=t.length>0,s=e.length>0,o=function(u,a,f,l,h){var p,d,v,m=[],y=0,w="0",x=u&&[],T=h!=null,N=c,C=u||s&&i.find.TAG("*",h&&a.parentNode||a),k=b+=N==null?1:Math.E;T&&(c=a!==g&&a,n=o.el);for(;(p=C[w])!=null;w++){if(s&&p){for(d=0;v=e[d];d++)if(v(p,a,f)){l.push(p);break}T&&(b=k,n=++o.el)}r&&((p=!v&&p)&&y--,u&&x.push(p))}y+=w;if(r&&w!==y){for(d=0;v=t[d];d++)v(x,m,a,f);if(u){if(y>0)while(w--)!x[w]&&!m[w]&&(m[w]=E.call(l));m=lt(m)}S.apply(l,m),T&&!u&&m.length>0&&y+t.length>1&&nt.uniqueSort(l)}return T&&(b=k,c=N),x};return o.el=0,r?N(o):o}function dt(e,t,n){var r=0,i=t.length;for(;r<i;r++)nt(e,t[r],n);return n}function vt(e,t,n,r,s){var o,u,f,l,c,h=ut(e),p=h.length;if(!r&&h.length===1){u=h[0]=h[0].slice(0);if(u.length>2&&(f=u[0]).type==="ID"&&t.nodeType===9&&!s&&i.relative[u[1].type]){t=i.find.ID(f.matches[0].replace($,""),t,s)[0];if(!t)return n;e=e.slice(u.shift().length)}for(o=J.POS.test(e)?-1:u.length-1;o>=0;o--){f=u[o];if(i.relative[l=f.type])break;if(c=i.find[l])if(r=c(f.matches[0].replace($,""),z.test(u[0].type)&&t.parentNode||t,s)){u.splice(o,1),e=r.length&&u.join("");if(!e)return S.apply(n,x.call(r,0)),n;break}}}return a(e,h)(r,t,s,n,z.test(e)),n}function mt(){}var n,r,i,s,o,u,a,f,l,c,h=!0,p="undefined",d=("sizcache"+Math.random()).replace(".",""),m=String,g=e.document,y=g.documentElement,b=0,w=0,E=[].pop,S=[].push,x=[].slice,T=[].indexOf||function(e){var t=0,n=this.length;for(;t<n;t++)if(this[t]===e)return t;return-1},N=function(e,t){return e[d]=t==null||t,e},C=function(){var e={},t=[];return N(function(n,r){return t.push(n)>i.cacheLength&&delete e[t.shift()],e[n+" "]=r},e)},k=C(),L=C(),A=C(),O="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",_=M.replace("w","w#"),D="([*^$|!~]?=)",P="\\["+O+"*("+M+")"+O+"*(?:"+D+O+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+_+")|)|)"+O+"*\\]",H=":("+M+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+P+")|[^:]|\\\\.)*|.*))\\)|)",B=":(even|odd|eq|gt|lt|nth|first|last)(?:\\("+O+"*((?:-\\d)?\\d*)"+O+"*\\)|)(?=[^-]|$)",j=new RegExp("^"+O+"+|((?:^|[^\\\\])(?:\\\\.)*)"+O+"+$","g"),F=new RegExp("^"+O+"*,"+O+"*"),I=new RegExp("^"+O+"*([\\x20\\t\\r\\n\\f>+~])"+O+"*"),q=new RegExp(H),R=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,U=/^:not/,z=/[\x20\t\r\n\f]*[+~]/,W=/:not\($/,X=/h\d/i,V=/input|select|textarea|button/i,$=/\\(?!\\)/g,J={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),NAME:new RegExp("^\\[name=['\"]?("+M+")['\"]?\\]"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+H),POS:new RegExp(B,"i"),CHILD:new RegExp("^:(only|nth|first|last)-child(?:\\("+O+"*(even|odd|(([+-]|)(\\d*)n|)"+O+"*(?:([+-]|)"+O+"*(\\d+)|))"+O+"*\\)|)","i"),needsContext:new RegExp("^"+O+"*[>+~]|"+B,"i")},K=function(e){var t=g.createElement("div");try{return e(t)}catch(n){return!1}finally{t=null}},Q=K(function(e){return e.appendChild(g.createComment("")),!e.getElementsByTagName("*").length}),G=K(function(e){return e.innerHTML="<a href='#'></a>",e.firstChild&&typeof e.firstChild.getAttribute!==p&&e.firstChild.getAttribute("href")==="#"}),Y=K(function(e){e.innerHTML="<select></select>";var t=typeof e.lastChild.getAttribute("multiple");return t!=="boolean"&&t!=="string"}),Z=K(function(e){return e.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!e.getElementsByClassName||!e.getElementsByClassName("e").length?!1:(e.lastChild.className="e",e.getElementsByClassName("e").length===2)}),et=K(function(e){e.id=d+0,e.innerHTML="<a name='"+d+"'></a><div name='"+d+"'></div>",y.insertBefore(e,y.firstChild);var t=g.getElementsByName&&g.getElementsByName(d).length===2+g.getElementsByName(d+0).length;return r=!g.getElementById(d),y.removeChild(e),t});try{x.call(y.childNodes,0)[0].nodeType}catch(tt){x=function(e){var t,n=[];for(;t=this[e];e++)n.push(t);return n}}nt.matches=function(e,t){return nt(e,null,null,t)},nt.matchesSelector=function(e,t){return nt(t,null,null,[e]).length>0},s=nt.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(i===1||i===9||i===11){if(typeof e.textContent=="string")return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=s(e)}else if(i===3||i===4)return e.nodeValue}else for(;t=e[r];r++)n+=s(t);return n},o=nt.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?t.nodeName!=="HTML":!1},u=nt.contains=y.contains?function(e,t){var n=e.nodeType===9?e.documentElement:e,r=t&&t.parentNode;return e===r||!!(r&&r.nodeType===1&&n.contains&&n.contains(r))}:y.compareDocumentPosition?function(e,t){return t&&!!(e.compareDocumentPosition(t)&16)}:function(e,t){while(t=t.parentNode)if(t===e)return!0;return!1},nt.attr=function(e,t){var n,r=o(e);return r||(t=t.toLowerCase()),(n=i.attrHandle[t])?n(e):r||Y?e.getAttribute(t):(n=e.getAttributeNode(t),n?typeof e[t]=="boolean"?e[t]?t:null:n.specified?n.value:null:null)},i=nt.selectors={cacheLength:50,createPseudo:N,match:J,attrHandle:G?{}:{href:function(e){return e.getAttribute("href",2)},type:function(e){return e.getAttribute("type")}},find:{ID:r?function(e,t,n){if(typeof t.getElementById!==p&&!n){var r=t.getElementById(e);return r&&r.parentNode?[r]:[]}}:function(e,n,r){if(typeof n.getElementById!==p&&!r){var i=n.getElementById(e);return i?i.id===e||typeof i.getAttributeNode!==p&&i.getAttributeNode("id").value===e?[i]:t:[]}},TAG:Q?function(e,t){if(typeof t.getElementsByTagName!==p)return t.getElementsByTagName(e)}:function(e,t){var n=t.getElementsByTagName(e);if(e==="*"){var r,i=[],s=0;for(;r=n[s];s++)r.nodeType===1&&i.push(r);return i}return n},NAME:et&&function(e,t){if(typeof t.getElementsByName!==p)return t.getElementsByName(name)},CLASS:Z&&function(e,t,n){if(typeof t.getElementsByClassName!==p&&!n)return t.getElementsByClassName(e)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace($,""),e[3]=(e[4]||e[5]||"").replace($,""),e[2]==="~="&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),e[1]==="nth"?(e[2]||nt.error(e[0]),e[3]=+(e[3]?e[4]+(e[5]||1):2*(e[2]==="even"||e[2]==="odd")),e[4]=+(e[6]+e[7]||e[2]==="odd")):e[2]&&nt.error(e[0]),e},PSEUDO:function(e){var t,n;if(J.CHILD.test(e[0]))return null;if(e[3])e[2]=e[3];else if(t=e[4])q.test(t)&&(n=ut(t,!0))&&(n=t.indexOf(")",t.length-n)-t.length)&&(t=t.slice(0,n),e[0]=e[0].slice(0,n)),e[2]=t;return e.slice(0,3)}},filter:{ID:r?function(e){return e=e.replace($,""),function(t){return t.getAttribute("id")===e}}:function(e){return e=e.replace($,""),function(t){var n=typeof t.getAttributeNode!==p&&t.getAttributeNode("id");return n&&n.value===e}},TAG:function(e){return e==="*"?function(){return!0}:(e=e.replace($,"").toLowerCase(),function(t){return t.nodeName&&t.nodeName.toLowerCase()===e})},CLASS:function(e){var t=k[d][e+" "];return t||(t=new RegExp("(^|"+O+")"+e+"("+O+"|$)"))&&k(e,function(e){return t.test(e.className||typeof e.getAttribute!==p&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r,i){var s=nt.attr(r,e);return s==null?t==="!=":t?(s+="",t==="="?s===n:t==="!="?s!==n:t==="^="?n&&s.indexOf(n)===0:t==="*="?n&&s.indexOf(n)>-1:t==="$="?n&&s.substr(s.length-n.length)===n:t==="~="?(" "+s+" ").indexOf(n)>-1:t==="|="?s===n||s.substr(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r){return e==="nth"?function(e){var t,i,s=e.parentNode;if(n===1&&r===0)return!0;if(s){i=0;for(t=s.firstChild;t;t=t.nextSibling)if(t.nodeType===1){i++;if(e===t)break}}return i-=r,i===n||i%n===0&&i/n>=0}:function(t){var n=t;switch(e){case"only":case"first":while(n=n.previousSibling)if(n.nodeType===1)return!1;if(e==="first")return!0;n=t;case"last":while(n=n.nextSibling)if(n.nodeType===1)return!1;return!0}}},PSEUDO:function(e,t){var n,r=i.pseudos[e]||i.setFilters[e.toLowerCase()]||nt.error("unsupported pseudo: "+e);return r[d]?r(t):r.length>1?(n=[e,e,"",t],i.setFilters.hasOwnProperty(e.toLowerCase())?N(function(e,n){var i,s=r(e,t),o=s.length;while(o--)i=T.call(e,s[o]),e[i]=!(n[i]=s[o])}):function(e){return r(e,0,n)}):r}},pseudos:{not:N(function(e){var t=[],n=[],r=a(e.replace(j,"$1"));return r[d]?N(function(e,t,n,i){var s,o=r(e,null,i,[]),u=e.length;while(u--)if(s=o[u])e[u]=!(t[u]=s)}):function(e,i,s){return t[0]=e,r(t,null,s,n),!n.pop()}}),has:N(function(e){return function(t){return nt(e,t).length>0}}),contains:N(function(e){return function(t){return(t.textContent||t.innerText||s(t)).indexOf(e)>-1}}),enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&!!e.checked||t==="option"&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},parent:function(e){return!i.pseudos.empty(e)},empty:function(e){var t;e=e.firstChild;while(e){if(e.nodeName>"@"||(t=e.nodeType)===3||t===4)return!1;e=e.nextSibling}return!0},header:function(e){return X.test(e.nodeName)},text:function(e){var t,n;return e.nodeName.toLowerCase()==="input"&&(t=e.type)==="text"&&((n=e.getAttribute("type"))==null||n.toLowerCase()===t)},radio:rt("radio"),checkbox:rt("checkbox"),file:rt("file"),password:rt("password"),image:rt("image"),submit:it("submit"),reset:it("reset"),button:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&e.type==="button"||t==="button"},input:function(e){return V.test(e.nodeName)},focus:function(e){var t=e.ownerDocument;return e===t.activeElement&&(!t.hasFocus||t.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},active:function(e){return e===e.ownerDocument.activeElement},first:st(function(){return[0]}),last:st(function(e,t){return[t-1]}),eq:st(function(e,t,n){return[n<0?n+t:n]}),even:st(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:st(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:st(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:st(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}},f=y.compareDocumentPosition?function(e,t){return e===t?(l=!0,0):(!e.compareDocumentPosition||!t.compareDocumentPosition?e.compareDocumentPosition:e.compareDocumentPosition(t)&4)?-1:1}:function(e,t){if(e===t)return l=!0,0;if(e.sourceIndex&&t.sourceIndex)return e.sourceIndex-t.sourceIndex;var n,r,i=[],s=[],o=e.parentNode,u=t.parentNode,a=o;if(o===u)return ot(e,t);if(!o)return-1;if(!u)return 1;while(a)i.unshift(a),a=a.parentNode;a=u;while(a)s.unshift(a),a=a.parentNode;n=i.length,r=s.length;for(var f=0;f<n&&f<r;f++)if(i[f]!==s[f])return ot(i[f],s[f]);return f===n?ot(e,s[f],-1):ot(i[f],t,1)},[0,0].sort(f),h=!l,nt.uniqueSort=function(e){var t,n=[],r=1,i=0;l=h,e.sort(f);if(l){for(;t=e[r];r++)t===e[r-1]&&(i=n.push(r));while(i--)e.splice(n[i],1)}return e},nt.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},a=nt.compile=function(e,t){var n,r=[],i=[],s=A[d][e+" "];if(!s){t||(t=ut(e)),n=t.length;while(n--)s=ht(t[n]),s[d]?r.push(s):i.push(s);s=A(e,pt(i,r))}return s},g.querySelectorAll&&function(){var e,t=vt,n=/'|\\/g,r=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,i=[":focus"],s=[":active"],u=y.matchesSelector||y.mozMatchesSelector||y.webkitMatchesSelector||y.oMatchesSelector||y.msMatchesSelector;K(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||i.push("\\["+O+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),e.querySelectorAll(":checked").length||i.push(":checked")}),K(function(e){e.innerHTML="<p test=''></p>",e.querySelectorAll("[test^='']").length&&i.push("[*^$]="+O+"*(?:\"\"|'')"),e.innerHTML="<input type='hidden'/>",e.querySelectorAll(":enabled").length||i.push(":enabled",":disabled")}),i=new RegExp(i.join("|")),vt=function(e,r,s,o,u){if(!o&&!u&&!i.test(e)){var a,f,l=!0,c=d,h=r,p=r.nodeType===9&&e;if(r.nodeType===1&&r.nodeName.toLowerCase()!=="object"){a=ut(e),(l=r.getAttribute("id"))?c=l.replace(n,"\\$&"):r.setAttribute("id",c),c="[id='"+c+"'] ",f=a.length;while(f--)a[f]=c+a[f].join("");h=z.test(e)&&r.parentNode||r,p=a.join(",")}if(p)try{return S.apply(s,x.call(h.querySelectorAll(p),0)),s}catch(v){}finally{l||r.removeAttribute("id")}}return t(e,r,s,o,u)},u&&(K(function(t){e=u.call(t,"div");try{u.call(t,"[test!='']:sizzle"),s.push("!=",H)}catch(n){}}),s=new RegExp(s.join("|")),nt.matchesSelector=function(t,n){n=n.replace(r,"='$1']");if(!o(t)&&!s.test(n)&&!i.test(n))try{var a=u.call(t,n);if(a||e||t.document&&t.document.nodeType!==11)return a}catch(f){}return nt(n,null,null,[t]).length>0})}(),i.pseudos.nth=i.pseudos.eq,i.filters=mt.prototype=i.pseudos,i.setFilters=new mt,nt.attr=v.attr,v.find=nt,v.expr=nt.selectors,v.expr[":"]=v.expr.pseudos,v.unique=nt.uniqueSort,v.text=nt.getText,v.isXMLDoc=nt.isXML,v.contains=nt.contains}(e);var nt=/Until$/,rt=/^(?:parents|prev(?:Until|All))/,it=/^.[^:#\[\.,]*$/,st=v.expr.match.needsContext,ot={children:!0,contents:!0,next:!0,prev:!0};v.fn.extend({find:function(e){var t,n,r,i,s,o,u=this;if(typeof e!="string")return v(e).filter(function(){for(t=0,n=u.length;t<n;t++)if(v.contains(u[t],this))return!0});o=this.pushStack("","find",e);for(t=0,n=this.length;t<n;t++){r=o.length,v.find(e,this[t],o);if(t>0)for(i=r;i<o.length;i++)for(s=0;s<r;s++)if(o[s]===o[i]){o.splice(i--,1);break}}return o},has:function(e){var t,n=v(e,this),r=n.length;return this.filter(function(){for(t=0;t<r;t++)if(v.contains(this,n[t]))return!0})},not:function(e){return this.pushStack(ft(this,e,!1),"not",e)},filter:function(e){return this.pushStack(ft(this,e,!0),"filter",e)},is:function(e){return!!e&&(typeof e=="string"?st.test(e)?v(e,this.context).index(this[0])>=0:v.filter(e,this).length>0:this.filter(e).length>0)},closest:function(e,t){var n,r=0,i=this.length,s=[],o=st.test(e)||typeof e!="string"?v(e,t||this.context):0;for(;r<i;r++){n=this[r];while(n&&n.ownerDocument&&n!==t&&n.nodeType!==11){if(o?o.index(n)>-1:v.find.matchesSelector(n,e)){s.push(n);break}n=n.parentNode}}return s=s.length>1?v.unique(s):s,this.pushStack(s,"closest",e)},index:function(e){return e?typeof e=="string"?v.inArray(this[0],v(e)):v.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(e,t){var n=typeof e=="string"?v(e,t):v.makeArray(e&&e.nodeType?[e]:e),r=v.merge(this.get(),n);return this.pushStack(ut(n[0])||ut(r[0])?r:v.unique(r))},addBack:function(e){return this.add(e==null?this.prevObject:this.prevObject.filter(e))}}),v.fn.andSelf=v.fn.addBack,v.each({parent:function(e){var t=e.parentNode;return t&&t.nodeType!==11?t:null},parents:function(e){return v.dir(e,"parentNode")},parentsUntil:function(e,t,n){return v.dir(e,"parentNode",n)},next:function(e){return at(e,"nextSibling")},prev:function(e){return at(e,"previousSibling")},nextAll:function(e){return v.dir(e,"nextSibling")},prevAll:function(e){return v.dir(e,"previousSibling")},nextUntil:function(e,t,n){return v.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return v.dir(e,"previousSibling",n)},siblings:function(e){return v.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return v.sibling(e.firstChild)},contents:function(e){return v.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:v.merge([],e.childNodes)}},function(e,t){v.fn[e]=function(n,r){var i=v.map(this,t,n);return nt.test(e)||(r=n),r&&typeof r=="string"&&(i=v.filter(r,i)),i=this.length>1&&!ot[e]?v.unique(i):i,this.length>1&&rt.test(e)&&(i=i.reverse()),this.pushStack(i,e,l.call(arguments).join(","))}}),v.extend({filter:function(e,t,n){return n&&(e=":not("+e+")"),t.length===1?v.find.matchesSelector(t[0],e)?[t[0]]:[]:v.find.matches(e,t)},dir:function(e,n,r){var i=[],s=e[n];while(s&&s.nodeType!==9&&(r===t||s.nodeType!==1||!v(s).is(r)))s.nodeType===1&&i.push(s),s=s[n];return i},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)e.nodeType===1&&e!==t&&n.push(e);return n}});var ct="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",ht=/ jQuery\d+="(?:null|\d+)"/g,pt=/^\s+/,dt=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,vt=/<([\w:]+)/,mt=/<tbody/i,gt=/<|&#?\w+;/,yt=/<(?:script|style|link)/i,bt=/<(?:script|object|embed|option|style)/i,wt=new RegExp("<(?:"+ct+")[\\s/>]","i"),Et=/^(?:checkbox|radio)$/,St=/checked\s*(?:[^=]|=\s*.checked.)/i,xt=/\/(java|ecma)script/i,Tt=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,Nt={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},Ct=lt(i),kt=Ct.appendChild(i.createElement("div"));Nt.optgroup=Nt.option,Nt.tbody=Nt.tfoot=Nt.colgroup=Nt.caption=Nt.thead,Nt.th=Nt.td,v.support.htmlSerialize||(Nt._default=[1,"X<div>","</div>"]),v.fn.extend({text:function(e){return v.access(this,function(e){return e===t?v.text(this):this.empty().append((this[0]&&this[0].ownerDocument||i).createTextNode(e))},null,e,arguments.length)},wrapAll:function(e){if(v.isFunction(e))return this.each(function(t){v(this).wrapAll(e.call(this,t))});if(this[0]){var t=v(e,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstChild&&e.firstChild.nodeType===1)e=e.firstChild;return e}).append(this)}return this},wrapInner:function(e){return v.isFunction(e)?this.each(function(t){v(this).wrapInner(e.call(this,t))}):this.each(function(){var t=v(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=v.isFunction(e);return this.each(function(n){v(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){v.nodeName(this,"body")||v(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(e){(this.nodeType===1||this.nodeType===11)&&this.appendChild(e)})},prepend:function(){return this.domManip(arguments,!0,function(e){(this.nodeType===1||this.nodeType===11)&&this.insertBefore(e,this.firstChild)})},before:function(){if(!ut(this[0]))return this.domManip(arguments,!1,function(e){this.parentNode.insertBefore(e,this)});if(arguments.length){var e=v.clean(arguments);return this.pushStack(v.merge(e,this),"before",this.selector)}},after:function(){if(!ut(this[0]))return this.domManip(arguments,!1,function(e){this.parentNode.insertBefore(e,this.nextSibling)});if(arguments.length){var e=v.clean(arguments);return this.pushStack(v.merge(this,e),"after",this.selector)}},remove:function(e,t){var n,r=0;for(;(n=this[r])!=null;r++)if(!e||v.filter(e,[n]).length)!t&&n.nodeType===1&&(v.cleanData(n.getElementsByTagName("*")),v.cleanData([n])),n.parentNode&&n.parentNode.removeChild(n);return this},empty:function(){var e,t=0;for(;(e=this[t])!=null;t++){e.nodeType===1&&v.cleanData(e.getElementsByTagName("*"));while(e.firstChild)e.removeChild(e.firstChild)}return this},clone:function(e,t){return e=e==null?!1:e,t=t==null?e:t,this.map(function(){return v.clone(this,e,t)})},html:function(e){return v.access(this,function(e){var n=this[0]||{},r=0,i=this.length;if(e===t)return n.nodeType===1?n.innerHTML.replace(ht,""):t;if(typeof e=="string"&&!yt.test(e)&&(v.support.htmlSerialize||!wt.test(e))&&(v.support.leadingWhitespace||!pt.test(e))&&!Nt[(vt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(dt,"<$1></$2>");try{for(;r<i;r++)n=this[r]||{},n.nodeType===1&&(v.cleanData(n.getElementsByTagName("*")),n.innerHTML=e);n=0}catch(s){}}n&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(e){return ut(this[0])?this.length?this.pushStack(v(v.isFunction(e)?e():e),"replaceWith",e):this:v.isFunction(e)?this.each(function(t){var n=v(this),r=n.html();n.replaceWith(e.call(this,t,r))}):(typeof e!="string"&&(e=v(e).detach()),this.each(function(){var t=this.nextSibling,n=this.parentNode;v(this).remove(),t?v(t).before(e):v(n).append(e)}))},detach:function(e){return this.remove(e,!0)},domManip:function(e,n,r){e=[].concat.apply([],e);var i,s,o,u,a=0,f=e[0],l=[],c=this.length;if(!v.support.checkClone&&c>1&&typeof f=="string"&&St.test(f))return this.each(function(){v(this).domManip(e,n,r)});if(v.isFunction(f))return this.each(function(i){var s=v(this);e[0]=f.call(this,i,n?s.html():t),s.domManip(e,n,r)});if(this[0]){i=v.buildFragment(e,this,l),o=i.fragment,s=o.firstChild,o.childNodes.length===1&&(o=s);if(s){n=n&&v.nodeName(s,"tr");for(u=i.cacheable||c-1;a<c;a++)r.call(n&&v.nodeName(this[a],"table")?Lt(this[a],"tbody"):this[a],a===u?o:v.clone(o,!0,!0))}o=s=null,l.length&&v.each(l,function(e,t){t.src?v.ajax?v.ajax({url:t.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):v.error("no ajax"):v.globalEval((t.text||t.textContent||t.innerHTML||"").replace(Tt,"")),t.parentNode&&t.parentNode.removeChild(t)})}return this}}),v.buildFragment=function(e,n,r){var s,o,u,a=e[0];return n=n||i,n=!n.nodeType&&n[0]||n,n=n.ownerDocument||n,e.length===1&&typeof a=="string"&&a.length<512&&n===i&&a.charAt(0)==="<"&&!bt.test(a)&&(v.support.checkClone||!St.test(a))&&(v.support.html5Clone||!wt.test(a))&&(o=!0,s=v.fragments[a],u=s!==t),s||(s=n.createDocumentFragment(),v.clean(e,n,s,r),o&&(v.fragments[a]=u&&s)),{fragment:s,cacheable:o}},v.fragments={},v.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){v.fn[e]=function(n){var r,i=0,s=[],o=v(n),u=o.length,a=this.length===1&&this[0].parentNode;if((a==null||a&&a.nodeType===11&&a.childNodes.length===1)&&u===1)return o[t](this[0]),this;for(;i<u;i++)r=(i>0?this.clone(!0):this).get(),v(o[i])[t](r),s=s.concat(r);return this.pushStack(s,e,o.selector)}}),v.extend({clone:function(e,t,n){var r,i,s,o;v.support.html5Clone||v.isXMLDoc(e)||!wt.test("<"+e.nodeName+">")?o=e.cloneNode(!0):(kt.innerHTML=e.outerHTML,kt.removeChild(o=kt.firstChild));if((!v.support.noCloneEvent||!v.support.noCloneChecked)&&(e.nodeType===1||e.nodeType===11)&&!v.isXMLDoc(e)){Ot(e,o),r=Mt(e),i=Mt(o);for(s=0;r[s];++s)i[s]&&Ot(r[s],i[s])}if(t){At(e,o);if(n){r=Mt(e),i=Mt(o);for(s=0;r[s];++s)At(r[s],i[s])}}return r=i=null,o},clean:function(e,t,n,r){var s,o,u,a,f,l,c,h,p,d,m,g,y=t===i&&Ct,b=[];if(!t||typeof t.createDocumentFragment=="undefined")t=i;for(s=0;(u=e[s])!=null;s++){typeof u=="number"&&(u+="");if(!u)continue;if(typeof u=="string")if(!gt.test(u))u=t.createTextNode(u);else{y=y||lt(t),c=t.createElement("div"),y.appendChild(c),u=u.replace(dt,"<$1></$2>"),a=(vt.exec(u)||["",""])[1].toLowerCase(),f=Nt[a]||Nt._default,l=f[0],c.innerHTML=f[1]+u+f[2];while(l--)c=c.lastChild;if(!v.support.tbody){h=mt.test(u),p=a==="table"&&!h?c.firstChild&&c.firstChild.childNodes:f[1]==="<table>"&&!h?c.childNodes:[];for(o=p.length-1;o>=0;--o)v.nodeName(p[o],"tbody")&&!p[o].childNodes.length&&p[o].parentNode.removeChild(p[o])}!v.support.leadingWhitespace&&pt.test(u)&&c.insertBefore(t.createTextNode(pt.exec(u)[0]),c.firstChild),u=c.childNodes,c.parentNode.removeChild(c)}u.nodeType?b.push(u):v.merge(b,u)}c&&(u=c=y=null);if(!v.support.appendChecked)for(s=0;(u=b[s])!=null;s++)v.nodeName(u,"input")?_t(u):typeof u.getElementsByTagName!="undefined"&&v.grep(u.getElementsByTagName("input"),_t);if(n){m=function(e){if(!e.type||xt.test(e.type))return r?r.push(e.parentNode?e.parentNode.removeChild(e):e):n.appendChild(e)};for(s=0;(u=b[s])!=null;s++)if(!v.nodeName(u,"script")||!m(u))n.appendChild(u),typeof u.getElementsByTagName!="undefined"&&(g=v.grep(v.merge([],u.getElementsByTagName("script")),m),b.splice.apply(b,[s+1,0].concat(g)),s+=g.length)}return b},cleanData:function(e,t){var n,r,i,s,o=0,u=v.expando,a=v.cache,f=v.support.deleteExpando,l=v.event.special;for(;(i=e[o])!=null;o++)if(t||v.acceptData(i)){r=i[u],n=r&&a[r];if(n){if(n.events)for(s in n.events)l[s]?v.event.remove(i,s):v.removeEvent(i,s,n.handle);a[r]&&(delete a[r],f?delete i[u]:i.removeAttribute?i.removeAttribute(u):i[u]=null,v.deletedIds.push(r))}}}}),function(){var e,t;v.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||e.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e=v.uaMatch(o.userAgent),t={},e.browser&&(t[e.browser]=!0,t.version=e.version),t.chrome?t.webkit=!0:t.webkit&&(t.safari=!0),v.browser=t,v.sub=function(){function e(t,n){return new e.fn.init(t,n)}v.extend(!0,e,this),e.superclass=this,e.fn=e.prototype=this(),e.fn.constructor=e,e.sub=this.sub,e.fn.init=function(r,i){return i&&i instanceof v&&!(i instanceof e)&&(i=e(i)),v.fn.init.call(this,r,i,t)},e.fn.init.prototype=e.fn;var t=e(i);return e}}();var Dt,Pt,Ht,Bt=/alpha\([^)]*\)/i,jt=/opacity=([^)]*)/,Ft=/^(top|right|bottom|left)$/,It=/^(none|table(?!-c[ea]).+)/,qt=/^margin/,Rt=new RegExp("^("+m+")(.*)$","i"),Ut=new RegExp("^("+m+")(?!px)[a-z%]+$","i"),zt=new RegExp("^([-+])=("+m+")","i"),Wt={BODY:"block"},Xt={position:"absolute",visibility:"hidden",display:"block"},Vt={letterSpacing:0,fontWeight:400},$t=["Top","Right","Bottom","Left"],Jt=["Webkit","O","Moz","ms"],Kt=v.fn.toggle;v.fn.extend({css:function(e,n){return v.access(this,function(e,n,r){return r!==t?v.style(e,n,r):v.css(e,n)},e,n,arguments.length>1)},show:function(){return Yt(this,!0)},hide:function(){return Yt(this)},toggle:function(e,t){var n=typeof e=="boolean";return v.isFunction(e)&&v.isFunction(t)?Kt.apply(this,arguments):this.each(function(){(n?e:Gt(this))?v(this).show():v(this).hide()})}}),v.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Dt(e,"opacity");return n===""?"1":n}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":v.support.cssFloat?"cssFloat":"styleFloat"},style:function(e,n,r,i){if(!e||e.nodeType===3||e.nodeType===8||!e.style)return;var s,o,u,a=v.camelCase(n),f=e.style;n=v.cssProps[a]||(v.cssProps[a]=Qt(f,a)),u=v.cssHooks[n]||v.cssHooks[a];if(r===t)return u&&"get"in u&&(s=u.get(e,!1,i))!==t?s:f[n];o=typeof r,o==="string"&&(s=zt.exec(r))&&(r=(s[1]+1)*s[2]+parseFloat(v.css(e,n)),o="number");if(r==null||o==="number"&&isNaN(r))return;o==="number"&&!v.cssNumber[a]&&(r+="px");if(!u||!("set"in u)||(r=u.set(e,r,i))!==t)try{f[n]=r}catch(l){}},css:function(e,n,r,i){var s,o,u,a=v.camelCase(n);return n=v.cssProps[a]||(v.cssProps[a]=Qt(e.style,a)),u=v.cssHooks[n]||v.cssHooks[a],u&&"get"in u&&(s=u.get(e,!0,i)),s===t&&(s=Dt(e,n)),s==="normal"&&n in Vt&&(s=Vt[n]),r||i!==t?(o=parseFloat(s),r||v.isNumeric(o)?o||0:s):s},swap:function(e,t,n){var r,i,s={};for(i in t)s[i]=e.style[i],e.style[i]=t[i];r=n.call(e);for(i in t)e.style[i]=s[i];return r}}),e.getComputedStyle?Dt=function(t,n){var r,i,s,o,u=e.getComputedStyle(t,null),a=t.style;return u&&(r=u.getPropertyValue(n)||u[n],r===""&&!v.contains(t.ownerDocument,t)&&(r=v.style(t,n)),Ut.test(r)&&qt.test(n)&&(i=a.width,s=a.minWidth,o=a.maxWidth,a.minWidth=a.maxWidth=a.width=r,r=u.width,a.width=i,a.minWidth=s,a.maxWidth=o)),r}:i.documentElement.currentStyle&&(Dt=function(e,t){var n,r,i=e.currentStyle&&e.currentStyle[t],s=e.style;return i==null&&s&&s[t]&&(i=s[t]),Ut.test(i)&&!Ft.test(t)&&(n=s.left,r=e.runtimeStyle&&e.runtimeStyle.left,r&&(e.runtimeStyle.left=e.currentStyle.left),s.left=t==="fontSize"?"1em":i,i=s.pixelLeft+"px",s.left=n,r&&(e.runtimeStyle.left=r)),i===""?"auto":i}),v.each(["height","width"],function(e,t){v.cssHooks[t]={get:function(e,n,r){if(n)return e.offsetWidth===0&&It.test(Dt(e,"display"))?v.swap(e,Xt,function(){return tn(e,t,r)}):tn(e,t,r)},set:function(e,n,r){return Zt(e,n,r?en(e,t,r,v.support.boxSizing&&v.css(e,"boxSizing")==="border-box"):0)}}}),v.support.opacity||(v.cssHooks.opacity={get:function(e,t){return jt.test((t&&e.currentStyle?e.currentStyle.filter:e.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":t?"1":""},set:function(e,t){var n=e.style,r=e.currentStyle,i=v.isNumeric(t)?"alpha(opacity="+t*100+")":"",s=r&&r.filter||n.filter||"";n.zoom=1;if(t>=1&&v.trim(s.replace(Bt,""))===""&&n.removeAttribute){n.removeAttribute("filter");if(r&&!r.filter)return}n.filter=Bt.test(s)?s.replace(Bt,i):s+" "+i}}),v(function(){v.support.reliableMarginRight||(v.cssHooks.marginRight={get:function(e,t){return v.swap(e,{display:"inline-block"},function(){if(t)return Dt(e,"marginRight")})}}),!v.support.pixelPosition&&v.fn.position&&v.each(["top","left"],function(e,t){v.cssHooks[t]={get:function(e,n){if(n){var r=Dt(e,t);return Ut.test(r)?v(e).position()[t]+"px":r}}}})}),v.expr&&v.expr.filters&&(v.expr.filters.hidden=function(e){return e.offsetWidth===0&&e.offsetHeight===0||!v.support.reliableHiddenOffsets&&(e.style&&e.style.display||Dt(e,"display"))==="none"},v.expr.filters.visible=function(e){return!v.expr.filters.hidden(e)}),v.each({margin:"",padding:"",border:"Width"},function(e,t){v.cssHooks[e+t]={expand:function(n){var r,i=typeof n=="string"?n.split(" "):[n],s={};for(r=0;r<4;r++)s[e+$t[r]+t]=i[r]||i[r-2]||i[0];return s}},qt.test(e)||(v.cssHooks[e+t].set=Zt)});var rn=/%20/g,sn=/\[\]$/,on=/\r?\n/g,un=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,an=/^(?:select|textarea)/i;v.fn.extend({serialize:function(){return v.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?v.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||an.test(this.nodeName)||un.test(this.type))}).map(function(e,t){var n=v(this).val();return n==null?null:v.isArray(n)?v.map(n,function(e,n){return{name:t.name,value:e.replace(on,"\r\n")}}):{name:t.name,value:n.replace(on,"\r\n")}}).get()}}),v.param=function(e,n){var r,i=[],s=function(e,t){t=v.isFunction(t)?t():t==null?"":t,i[i.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};n===t&&(n=v.ajaxSettings&&v.ajaxSettings.traditional);if(v.isArray(e)||e.jquery&&!v.isPlainObject(e))v.each(e,function(){s(this.name,this.value)});else for(r in e)fn(r,e[r],n,s);return i.join("&").replace(rn,"+")};var ln,cn,hn=/#.*$/,pn=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,dn=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,vn=/^(?:GET|HEAD)$/,mn=/^\/\//,gn=/\?/,yn=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bn=/([?&])_=[^&]*/,wn=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,En=v.fn.load,Sn={},xn={},Tn=["*/"]+["*"];try{cn=s.href}catch(Nn){cn=i.createElement("a"),cn.href="",cn=cn.href}ln=wn.exec(cn.toLowerCase())||[],v.fn.load=function(e,n,r){if(typeof e!="string"&&En)return En.apply(this,arguments);if(!this.length)return this;var i,s,o,u=this,a=e.indexOf(" ");return a>=0&&(i=e.slice(a,e.length),e=e.slice(0,a)),v.isFunction(n)?(r=n,n=t):n&&typeof n=="object"&&(s="POST"),v.ajax({url:e,type:s,dataType:"html",data:n,complete:function(e,t){r&&u.each(r,o||[e.responseText,t,e])}}).done(function(e){o=arguments,u.html(i?v("<div>").append(e.replace(yn,"")).find(i):e)}),this},v.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(e,t){v.fn[t]=function(e){return this.on(t,e)}}),v.each(["get","post"],function(e,n){v[n]=function(e,r,i,s){return v.isFunction(r)&&(s=s||i,i=r,r=t),v.ajax({type:n,url:e,data:r,success:i,dataType:s})}}),v.extend({getScript:function(e,n){return v.get(e,t,n,"script")},getJSON:function(e,t,n){return v.get(e,t,n,"json")},ajaxSetup:function(e,t){return t?Ln(e,v.ajaxSettings):(t=e,e=v.ajaxSettings),Ln(e,t),e},ajaxSettings:{url:cn,isLocal:dn.test(ln[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":Tn},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":e.String,"text html":!0,"text json":v.parseJSON,"text xml":v.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:Cn(Sn),ajaxTransport:Cn(xn),ajax:function(e,n){function T(e,n,s,a){var l,y,b,w,S,T=n;if(E===2)return;E=2,u&&clearTimeout(u),o=t,i=a||"",x.readyState=e>0?4:0,s&&(w=An(c,x,s));if(e>=200&&e<300||e===304)c.ifModified&&(S=x.getResponseHeader("Last-Modified"),S&&(v.lastModified[r]=S),S=x.getResponseHeader("Etag"),S&&(v.etag[r]=S)),e===304?(T="notmodified",l=!0):(l=On(c,w),T=l.state,y=l.data,b=l.error,l=!b);else{b=T;if(!T||e)T="error",e<0&&(e=0)}x.status=e,x.statusText=(n||T)+"",l?d.resolveWith(h,[y,T,x]):d.rejectWith(h,[x,T,b]),x.statusCode(g),g=t,f&&p.trigger("ajax"+(l?"Success":"Error"),[x,c,l?y:b]),m.fireWith(h,[x,T]),f&&(p.trigger("ajaxComplete",[x,c]),--v.active||v.event.trigger("ajaxStop"))}typeof e=="object"&&(n=e,e=t),n=n||{};var r,i,s,o,u,a,f,l,c=v.ajaxSetup({},n),h=c.context||c,p=h!==c&&(h.nodeType||h instanceof v)?v(h):v.event,d=v.Deferred(),m=v.Callbacks("once memory"),g=c.statusCode||{},b={},w={},E=0,S="canceled",x={readyState:0,setRequestHeader:function(e,t){if(!E){var n=e.toLowerCase();e=w[n]=w[n]||e,b[e]=t}return this},getAllResponseHeaders:function(){return E===2?i:null},getResponseHeader:function(e){var n;if(E===2){if(!s){s={};while(n=pn.exec(i))s[n[1].toLowerCase()]=n[2]}n=s[e.toLowerCase()]}return n===t?null:n},overrideMimeType:function(e){return E||(c.mimeType=e),this},abort:function(e){return e=e||S,o&&o.abort(e),T(0,e),this}};d.promise(x),x.success=x.done,x.error=x.fail,x.complete=m.add,x.statusCode=function(e){if(e){var t;if(E<2)for(t in e)g[t]=[g[t],e[t]];else t=e[x.status],x.always(t)}return this},c.url=((e||c.url)+"").replace(hn,"").replace(mn,ln[1]+"//"),c.dataTypes=v.trim(c.dataType||"*").toLowerCase().split(y),c.crossDomain==null&&(a=wn.exec(c.url.toLowerCase()),c.crossDomain=!(!a||a[1]===ln[1]&&a[2]===ln[2]&&(a[3]||(a[1]==="http:"?80:443))==(ln[3]||(ln[1]==="http:"?80:443)))),c.data&&c.processData&&typeof c.data!="string"&&(c.data=v.param(c.data,c.traditional)),kn(Sn,c,n,x);if(E===2)return x;f=c.global,c.type=c.type.toUpperCase(),c.hasContent=!vn.test(c.type),f&&v.active++===0&&v.event.trigger("ajaxStart");if(!c.hasContent){c.data&&(c.url+=(gn.test(c.url)?"&":"?")+c.data,delete c.data),r=c.url;if(c.cache===!1){var N=v.now(),C=c.url.replace(bn,"$1_="+N);c.url=C+(C===c.url?(gn.test(c.url)?"&":"?")+"_="+N:"")}}(c.data&&c.hasContent&&c.contentType!==!1||n.contentType)&&x.setRequestHeader("Content-Type",c.contentType),c.ifModified&&(r=r||c.url,v.lastModified[r]&&x.setRequestHeader("If-Modified-Since",v.lastModified[r]),v.etag[r]&&x.setRequestHeader("If-None-Match",v.etag[r])),x.setRequestHeader("Accept",c.dataTypes[0]&&c.accepts[c.dataTypes[0]]?c.accepts[c.dataTypes[0]]+(c.dataTypes[0]!=="*"?", "+Tn+"; q=0.01":""):c.accepts["*"]);for(l in c.headers)x.setRequestHeader(l,c.headers[l]);if(!c.beforeSend||c.beforeSend.call(h,x,c)!==!1&&E!==2){S="abort";for(l in{success:1,error:1,complete:1})x[l](c[l]);o=kn(xn,c,n,x);if(!o)T(-1,"No Transport");else{x.readyState=1,f&&p.trigger("ajaxSend",[x,c]),c.async&&c.timeout>0&&(u=setTimeout(function(){x.abort("timeout")},c.timeout));try{E=1,o.send(b,T)}catch(k){if(!(E<2))throw k;T(-1,k)}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var Mn=[],_n=/\?/,Dn=/(=)\?(?=&|$)|\?\?/,Pn=v.now();v.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Mn.pop()||v.expando+"_"+Pn++;return this[e]=!0,e}}),v.ajaxPrefilter("json jsonp",function(n,r,i){var s,o,u,a=n.data,f=n.url,l=n.jsonp!==!1,c=l&&Dn.test(f),h=l&&!c&&typeof a=="string"&&!(n.contentType||"").indexOf("application/x-www-form-urlencoded")&&Dn.test(a);if(n.dataTypes[0]==="jsonp"||c||h)return s=n.jsonpCallback=v.isFunction(n.jsonpCallback)?n.jsonpCallback():n.jsonpCallback,o=e[s],c?n.url=f.replace(Dn,"$1"+s):h?n.data=a.replace(Dn,"$1"+s):l&&(n.url+=(_n.test(f)?"&":"?")+n.jsonp+"="+s),n.converters["script json"]=function(){return u||v.error(s+" was not called"),u[0]},n.dataTypes[0]="json",e[s]=function(){u=arguments},i.always(function(){e[s]=o,n[s]&&(n.jsonpCallback=r.jsonpCallback,Mn.push(s)),u&&v.isFunction(o)&&o(u[0]),u=o=t}),"script"}),v.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(e){return v.globalEval(e),e}}}),v.ajaxPrefilter("script",function(e){e.cache===t&&(e.cache=!1),e.crossDomain&&(e.type="GET",e.global=!1)}),v.ajaxTransport("script",function(e){if(e.crossDomain){var n,r=i.head||i.getElementsByTagName("head")[0]||i.documentElement;return{send:function(s,o){n=i.createElement("script"),n.async="async",e.scriptCharset&&(n.charset=e.scriptCharset),n.src=e.url,n.onload=n.onreadystatechange=function(e,i){if(i||!n.readyState||/loaded|complete/.test(n.readyState))n.onload=n.onreadystatechange=null,r&&n.parentNode&&r.removeChild(n),n=t,i||o(200,"success")},r.insertBefore(n,r.firstChild)},abort:function(){n&&n.onload(0,1)}}}});var Hn,Bn=e.ActiveXObject?function(){for(var e in Hn)Hn[e](0,1)}:!1,jn=0;v.ajaxSettings.xhr=e.ActiveXObject?function(){return!this.isLocal&&Fn()||In()}:Fn,function(e){v.extend(v.support,{ajax:!!e,cors:!!e&&"withCredentials"in e})}(v.ajaxSettings.xhr()),v.support.ajax&&v.ajaxTransport(function(n){if(!n.crossDomain||v.support.cors){var r;return{send:function(i,s){var o,u,a=n.xhr();n.username?a.open(n.type,n.url,n.async,n.username,n.password):a.open(n.type,n.url,n.async);if(n.xhrFields)for(u in n.xhrFields)a[u]=n.xhrFields[u];n.mimeType&&a.overrideMimeType&&a.overrideMimeType(n.mimeType),!n.crossDomain&&!i["X-Requested-With"]&&(i["X-Requested-With"]="XMLHttpRequest");try{for(u in i)a.setRequestHeader(u,i[u])}catch(f){}a.send(n.hasContent&&n.data||null),r=function(e,i){var u,f,l,c,h;try{if(r&&(i||a.readyState===4)){r=t,o&&(a.onreadystatechange=v.noop,Bn&&delete Hn[o]);if(i)a.readyState!==4&&a.abort();else{u=a.status,l=a.getAllResponseHeaders(),c={},h=a.responseXML,h&&h.documentElement&&(c.xml=h);try{c.text=a.responseText}catch(p){}try{f=a.statusText}catch(p){f=""}!u&&n.isLocal&&!n.crossDomain?u=c.text?200:404:u===1223&&(u=204)}}}catch(d){i||s(-1,d)}c&&s(u,f,c,l)},n.async?a.readyState===4?setTimeout(r,0):(o=++jn,Bn&&(Hn||(Hn={},v(e).unload(Bn)),Hn[o]=r),a.onreadystatechange=r):r()},abort:function(){r&&r(0,1)}}}});var qn,Rn,Un=/^(?:toggle|show|hide)$/,zn=new RegExp("^(?:([-+])=|)("+m+")([a-z%]*)$","i"),Wn=/queueHooks$/,Xn=[Gn],Vn={"*":[function(e,t){var n,r,i=this.createTween(e,t),s=zn.exec(t),o=i.cur(),u=+o||0,a=1,f=20;if(s){n=+s[2],r=s[3]||(v.cssNumber[e]?"":"px");if(r!=="px"&&u){u=v.css(i.elem,e,!0)||n||1;do a=a||".5",u/=a,v.style(i.elem,e,u+r);while(a!==(a=i.cur()/o)&&a!==1&&--f)}i.unit=r,i.start=u,i.end=s[1]?u+(s[1]+1)*n:n}return i}]};v.Animation=v.extend(Kn,{tweener:function(e,t){v.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;r<i;r++)n=e[r],Vn[n]=Vn[n]||[],Vn[n].unshift(t)},prefilter:function(e,t){t?Xn.unshift(e):Xn.push(e)}}),v.Tween=Yn,Yn.prototype={constructor:Yn,init:function(e,t,n,r,i,s){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=s||(v.cssNumber[n]?"":"px")},cur:function(){var e=Yn.propHooks[this.prop];return e&&e.get?e.get(this):Yn.propHooks._default.get(this)},run:function(e){var t,n=Yn.propHooks[this.prop];return this.options.duration?this.pos=t=v.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Yn.propHooks._default.set(this),this}},Yn.prototype.init.prototype=Yn.prototype,Yn.propHooks={_default:{get:function(e){var t;return e.elem[e.prop]==null||!!e.elem.style&&e.elem.style[e.prop]!=null?(t=v.css(e.elem,e.prop,!1,""),!t||t==="auto"?0:t):e.elem[e.prop]},set:function(e){v.fx.step[e.prop]?v.fx.step[e.prop](e):e.elem.style&&(e.elem.style[v.cssProps[e.prop]]!=null||v.cssHooks[e.prop])?v.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},Yn.propHooks.scrollTop=Yn.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},v.each(["toggle","show","hide"],function(e,t){var n=v.fn[t];v.fn[t]=function(r,i,s){return r==null||typeof r=="boolean"||!e&&v.isFunction(r)&&v.isFunction(i)?n.apply(this,arguments):this.animate(Zn(t,!0),r,i,s)}}),v.fn.extend({fadeTo:function(e,t,n,r){return this.filter(Gt).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=v.isEmptyObject(e),s=v.speed(t,n,r),o=function(){var t=Kn(this,v.extend({},e),s);i&&t.stop(!0)};return i||s.queue===!1?this.each(o):this.queue(s.queue,o)},stop:function(e,n,r){var i=function(e){var t=e.stop;delete e.stop,t(r)};return typeof e!="string"&&(r=n,n=e,e=t),n&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,n=e!=null&&e+"queueHooks",s=v.timers,o=v._data(this);if(n)o[n]&&o[n].stop&&i(o[n]);else for(n in o)o[n]&&o[n].stop&&Wn.test(n)&&i(o[n]);for(n=s.length;n--;)s[n].elem===this&&(e==null||s[n].queue===e)&&(s[n].anim.stop(r),t=!1,s.splice(n,1));(t||!r)&&v.dequeue(this,e)})}}),v.each({slideDown:Zn("show"),slideUp:Zn("hide"),slideToggle:Zn("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){v.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),v.speed=function(e,t,n){var r=e&&typeof e=="object"?v.extend({},e):{complete:n||!n&&t||v.isFunction(e)&&e,duration:e,easing:n&&t||t&&!v.isFunction(t)&&t};r.duration=v.fx.off?0:typeof r.duration=="number"?r.duration:r.duration in v.fx.speeds?v.fx.speeds[r.duration]:v.fx.speeds._default;if(r.queue==null||r.queue===!0)r.queue="fx";return r.old=r.complete,r.complete=function(){v.isFunction(r.old)&&r.old.call(this),r.queue&&v.dequeue(this,r.queue)},r},v.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},v.timers=[],v.fx=Yn.prototype.init,v.fx.tick=function(){var e,n=v.timers,r=0;qn=v.now();for(;r<n.length;r++)e=n[r],!e()&&n[r]===e&&n.splice(r--,1);n.length||v.fx.stop(),qn=t},v.fx.timer=function(e){e()&&v.timers.push(e)&&!Rn&&(Rn=setInterval(v.fx.tick,v.fx.interval))},v.fx.interval=13,v.fx.stop=function(){clearInterval(Rn),Rn=null},v.fx.speeds={slow:600,fast:200,_default:400},v.fx.step={},v.expr&&v.expr.filters&&(v.expr.filters.animated=function(e){return v.grep(v.timers,function(t){return e===t.elem}).length});var er=/^(?:body|html)$/i;v.fn.offset=function(e){if(arguments.length)return e===t?this:this.each(function(t){v.offset.setOffset(this,e,t)});var n,r,i,s,o,u,a,f={top:0,left:0},l=this[0],c=l&&l.ownerDocument;if(!c)return;return(r=c.body)===l?v.offset.bodyOffset(l):(n=c.documentElement,v.contains(n,l)?(typeof l.getBoundingClientRect!="undefined"&&(f=l.getBoundingClientRect()),i=tr(c),s=n.clientTop||r.clientTop||0,o=n.clientLeft||r.clientLeft||0,u=i.pageYOffset||n.scrollTop,a=i.pageXOffset||n.scrollLeft,{top:f.top+u-s,left:f.left+a-o}):f)},v.offset={bodyOffset:function(e){var t=e.offsetTop,n=e.offsetLeft;return v.support.doesNotIncludeMarginInBodyOffset&&(t+=parseFloat(v.css(e,"marginTop"))||0,n+=parseFloat(v.css(e,"marginLeft"))||0),{top:t,left:n}},setOffset:function(e,t,n){var r=v.css(e,"position");r==="static"&&(e.style.position="relative");var i=v(e),s=i.offset(),o=v.css(e,"top"),u=v.css(e,"left"),a=(r==="absolute"||r==="fixed")&&v.inArray("auto",[o,u])>-1,f={},l={},c,h;a?(l=i.position(),c=l.top,h=l.left):(c=parseFloat(o)||0,h=parseFloat(u)||0),v.isFunction(t)&&(t=t.call(e,n,s)),t.top!=null&&(f.top=t.top-s.top+c),t.left!=null&&(f.left=t.left-s.left+h),"using"in t?t.using.call(e,f):i.css(f)}},v.fn.extend({position:function(){if(!this[0])return;var e=this[0],t=this.offsetParent(),n=this.offset(),r=er.test(t[0].nodeName)?{top:0,left:0}:t.offset();return n.top-=parseFloat(v.css(e,"marginTop"))||0,n.left-=parseFloat(v.css(e,"marginLeft"))||0,r.top+=parseFloat(v.css(t[0],"borderTopWidth"))||0,r.left+=parseFloat(v.css(t[0],"borderLeftWidth"))||0,{top:n.top-r.top,left:n.left-r.left}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||i.body;while(e&&!er.test(e.nodeName)&&v.css(e,"position")==="static")e=e.offsetParent;return e||i.body})}}),v.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,n){var r=/Y/.test(n);v.fn[e]=function(i){return v.access(this,function(e,i,s){var o=tr(e);if(s===t)return o?n in o?o[n]:o.document.documentElement[i]:e[i];o?o.scrollTo(r?v(o).scrollLeft():s,r?s:v(o).scrollTop()):e[i]=s},e,i,arguments.length,null)}}),v.each({Height:"height",Width:"width"},function(e,n){v.each({padding:"inner"+e,content:n,"":"outer"+e},function(r,i){v.fn[i]=function(i,s){var o=arguments.length&&(r||typeof i!="boolean"),u=r||(i===!0||s===!0?"margin":"border");return v.access(this,function(n,r,i){var s;return v.isWindow(n)?n.document.documentElement["client"+e]:n.nodeType===9?(s=n.documentElement,Math.max(n.body["scroll"+e],s["scroll"+e],n.body["offset"+e],s["offset"+e],s["client"+e])):i===t?v.css(n,r,i,u):v.style(n,r,i,u)},n,o?i:t,o,null)}})}),e.MJQ=v,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return v})})(window);

/*jquery.cookie*/
(function(factory){factory(MJQ);}(function($){var pluses=/\+/g;function encode(s){return config.raw?s:encodeURIComponent(s);}
function decode(s){return config.raw?s:decodeURIComponent(s);}
function stringifyCookieValue(value){return encode(config.json?JSON.stringify(value):String(value));}
function parseCookieValue(s){if(s.indexOf('"')===0){s=s.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,'\\');}
try{s=decodeURIComponent(s.replace(pluses,' '));}catch(e){return;}
try{return config.json?JSON.parse(s):s;}catch(e){}}
function read(s,converter){var value=config.raw?s:parseCookieValue(s);return $.isFunction(converter)?converter(value):value;}
var config=$.cookie=function(key,value,options){if(value!==undefined&&!$.isFunction(value)){options=$.extend({},config.defaults,options);if(typeof options.expires==='number'){var days=options.expires,t=options.expires=new Date();t.setDate(t.getDate()+days);}
return(document.cookie=[encode(key),'=',stringifyCookieValue(value),options.expires?'; expires='+options.expires.toUTCString():'',options.path?'; path='+options.path:'',options.domain?'; domain='+options.domain:'',options.secure?'; secure':''].join(''));}
var result=key?undefined:{};var cookies=document.cookie?document.cookie.split('; '):[];for(var i=0,l=cookies.length;i<l;i++){var parts=cookies[i].split('=');var name=decode(parts.shift());var cookie=parts.join('=');if(key&&key===name){result=read(cookie,value);break;}
if(!key&&(cookie=read(cookie))!==undefined){result[name]=cookie;}}
return result;};config.defaults={};$.removeCookie=function(key,options){if($.cookie(key)!==undefined){$.cookie(key,'',$.extend({},options,{expires:-1}));return true;}
return false;};}));

/*BigNumber*/
;(function (global) {
    'use strict'; var MAX = 1E20, MAX_POWER = 1E6, DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -32, TO_EXP_POS = 32, MIN_EXP = -MAX, MAX_EXP = MAX, ERRORS = true, parse = parseInt, P = BigNumber.prototype, DIGITS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_', outOfRange, id = 0, isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, trim = String.prototype.trim || function () { return this.replace(/^\s+|\s+$/g, '') }, ONE = BigNumber(1); function BigNumber(n, b) {
        var e, i, isNum, digits, valid, orig, x = this; if (!(x instanceof BigNumber)) { return new BigNumber(n, b) }
        if (n instanceof BigNumber) { id = 0; if (b !== e) { n += '' } else { x['s'] = n['s']; x['e'] = n['e']; x['c'] = (n = n['c']) ? n.slice() : n; return; } }
        if (typeof n != 'string') { n = (isNum = typeof n == 'number' || Object.prototype.toString.call(n) == '[object Number]') && n === 0 && 1 / n < 0 ? '-0' : n + ''; }
        orig = n; if (b === e && isValid.test(n)) { x['s'] = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1; } else {
            if (b == 10) { return setMode(n, DECIMAL_PLACES, ROUNDING_MODE); }
            n = trim.call(n).replace(/^\+(?!-)/, ''); x['s'] = n.charAt(0) == '-' ? (n = n.replace(/^-(?!-)/, ''), -1) : 1; if (b != null) {
                if ((b == (b | 0) || !ERRORS) && !(outOfRange = !(b >= 2 && b < 65))) {
                    digits = '[' + DIGITS.slice(0, b = b | 0) + ']+'; n = n.replace(/\.$/, '').replace(/^\./, '0.'); if (valid = new RegExp('^' + digits + '(?:\\.' + digits + ')?$', b < 37 ? 'i' : '').test(n)) {
                        if (isNum) {
                            if (n.replace(/^0\.0*|\./, '').length > 15) { ifExceptionsThrow(orig, 0); }
                            isNum = !isNum;
                        }
                        n = convert(n, 10, b, x['s']);
                    } else if (n != 'Infinity' && n != 'NaN') { ifExceptionsThrow(orig, 1, b); n = 'NaN'; } 
                } else { ifExceptionsThrow(b, 2); valid = isValid.test(n); } 
            } else { valid = isValid.test(n); }
            if (!valid) {
                x['c'] = x['e'] = null; if (n != 'Infinity') {
                    if (n != 'NaN') { ifExceptionsThrow(orig, 3); }
                    x['s'] = null;
                }
                id = 0; return;
            } 
        }
        if ((e = n.indexOf('.')) > -1) { n = n.replace('.', ''); }
        if ((i = n.search(/e/i)) > 0) {
            if (e < 0) { e = i; }
            e += +n.slice(i + 1); n = n.substring(0, i);
        } else if (e < 0) { e = n.length; }
        for (i = 0; n.charAt(i) == '0'; i++) { }
        b = n.length; if (isNum && b > 15 && n.slice(i).length > 15) { ifExceptionsThrow(orig, 0); }
        id = 0; if ((e -= i + 1) > MAX_EXP) { x['c'] = x['e'] = null; } else if (i == b || e < MIN_EXP) { x['c'] = [x['e'] = 0]; } else {
            for (; n.charAt(--b) == '0'; ) { }
            x['e'] = e; x['c'] = []; for (e = 0; i <= b; x['c'][e++] = +n.charAt(i++)) { } 
        } 
    }
    BigNumber['ROUND_UP'] = 0; BigNumber['ROUND_DOWN'] = 1; BigNumber['ROUND_CEIL'] = 2; BigNumber['ROUND_FLOOR'] = 3; BigNumber['ROUND_HALF_UP'] = 4; BigNumber['ROUND_HALF_DOWN'] = 5; BigNumber['ROUND_HALF_EVEN'] = 6; BigNumber['ROUND_HALF_CEIL'] = 7; BigNumber['ROUND_HALF_FLOOR'] = 8; BigNumber['isValid'] = function (y) { return isValid.test(y); }; BigNumber['config'] = function () {
        var v, p, i = 0, r = {}, a = arguments, o = a[0], c = 'config', inRange = function (n, lo, hi) { return !((outOfRange = n < lo || n > hi) || parse(n) != n && n !== 0); }, has = o && typeof o == 'object' ? function () { if (o.hasOwnProperty(p)) return (v = o[p]) != null } : function () { if (a.length > i) return (v = a[i++]) != null }; if (has(p = 'DECIMAL_PLACES')) { if (inRange(v, 0, MAX)) { DECIMAL_PLACES = v | 0; } else { ifExceptionsThrow(v, p, c); } }
        r[p] = DECIMAL_PLACES; if (has(p = 'ROUNDING_MODE')) { if (inRange(v, 0, 8)) { ROUNDING_MODE = v | 0; } else { ifExceptionsThrow(v, p, c); } }
        r[p] = ROUNDING_MODE; if (has(p = 'EXPONENTIAL_AT')) { if (inRange(v, -MAX, MAX)) { TO_EXP_NEG = -(TO_EXP_POS = ~ ~(v < 0 ? -v : +v)); } else if (!outOfRange && v && inRange(v[0], -MAX, 0) && inRange(v[1], 0, MAX)) { TO_EXP_NEG = ~ ~v[0]; TO_EXP_POS = ~ ~v[1]; } else { ifExceptionsThrow(v, p, c, 1); } }
        r[p] = [TO_EXP_NEG, TO_EXP_POS]; if (has(p = 'RANGE')) { if (inRange(v, -MAX, MAX) && ~ ~v) { MIN_EXP = -(MAX_EXP = ~ ~(v < 0 ? -v : +v)); } else if (!outOfRange && v && inRange(v[0], -MAX, -1) && inRange(v[1], 1, MAX)) { MIN_EXP = ~ ~v[0], MAX_EXP = ~ ~v[1]; } else { ifExceptionsThrow(v, p, c, 1, 1); } }
        r[p] = [MIN_EXP, MAX_EXP]; if (has(p = 'ERRORS')) { if (v === !!v || v === 1 || v === 0) { parse = (outOfRange = id = 0, ERRORS = !!v) ? parseInt : parseFloat; } else { ifExceptionsThrow(v, p, c, 0, 0, 1); } }
        r[p] = ERRORS; return r;
    }; function ifExceptionsThrow(arg, i, j, isArray, isRange, isErrors) {
        if (ERRORS) {
            var error, method = ['new BigNumber', 'cmp', 'div', 'eq', 'gt', 'gte', 'lt', 'lte', 'minus', 'mod', 'plus', 'times', 'toFr'][id ? id < 0 ? -id : id : 1 / id < 0 ? 1 : 0] + '()', message = outOfRange ? ' out of range' : ' not a' +
(isRange ? ' non-zero' : 'n') + ' integer'; message = ([method + ' number type has more than 15 significant digits', method + ' not a base ' + j + ' number', method + ' base' + message, method + ' not a number'][i] || j + '() ' + i + (isErrors ? ' not a boolean or binary digit' : message + (isArray ? ' or not [' + (outOfRange ? ' negative, positive' : ' integer, integer') + ' ]' : ''))) + ': ' + arg; outOfRange = id = 0; error = new Error(message); error['name'] = 'BigNumber Error'; throw error;
        } 
    }
    function convert(nStr, baseOut, baseIn, sign) {
        var e, dvs, dvd, nArr, fracArr, fracBN; function strToArr(str, bIn) {
            var j, i = 0, strL = str.length, arrL, arr = [0]; for (bIn = bIn || baseIn; i < strL; i++) {
                for (arrL = arr.length, j = 0; j < arrL; arr[j] *= bIn, j++) { }
                for (arr[0] += DIGITS.indexOf(str.charAt(i)), j = 0; j < arr.length; j++) {
                    if (arr[j] > baseOut - 1) {
                        if (arr[j + 1] == null) { arr[j + 1] = 0; }
                        arr[j + 1] += arr[j] / baseOut ^ 0; arr[j] %= baseOut;
                    } 
                } 
            }
            return arr.reverse();
        }
        function arrToStr(arr) {
            var i = 0, arrL = arr.length, str = ''; for (; i < arrL; str += DIGITS.charAt(arr[i++])) { }
            return str;
        }
        if (baseIn < 37) { nStr = nStr.toLowerCase(); }
        if ((e = nStr.indexOf('.')) > -1) {
            e = nStr.length - e - 1; dvs = strToArr(new BigNumber(baseIn)['pow'](e)['toF'](), 10); nArr = nStr.split('.'); dvd = strToArr(nArr[1]); nArr = strToArr(nArr[0]); fracBN = divide(dvd, dvs, dvd.length - dvs.length, sign, baseOut, nArr[nArr.length - 1] & 1); fracArr = fracBN['c']; if (e = fracBN['e']) {
                for (; ++e; fracArr.unshift(0)) { }
                nStr = arrToStr(nArr) + '.' + arrToStr(fracArr);
            } else if (fracArr[0]) { if (nArr[e = nArr.length - 1] < baseOut - 1) { ++nArr[e]; nStr = arrToStr(nArr); } else { nStr = new BigNumber(arrToStr(nArr), baseOut)['plus'](ONE)['toS'](baseOut); } } else { nStr = arrToStr(nArr); } 
        } else { nStr = arrToStr(strToArr(nStr)); }
        return nStr;
    }
    function divide(dvd, dvs, exp, s, base, isOdd) {
        var dvsL, dvsT, next, cmp, remI, dvsZ = dvs.slice(), dvdI = dvsL = dvs.length, dvdL = dvd.length, rem = dvd.slice(0, dvsL), remL = rem.length, quo = new BigNumber(ONE), qc = quo['c'] = [], qi = 0, dig = DECIMAL_PLACES + (quo['e'] = exp) + 1; quo['s'] = s; s = dig < 0 ? 0 : dig; for (; remL++ < dvsL; rem.push(0)) { }
        dvsZ.unshift(0); do {
            for (next = 0; next < base; next++) {
                if (dvsL != (remL = rem.length)) { cmp = dvsL > remL ? 1 : -1; } else { for (remI = -1, cmp = 0; ++remI < dvsL; ) { if (dvs[remI] != rem[remI]) { cmp = dvs[remI] > rem[remI] ? 1 : -1; break; } } }
                if (cmp < 0) {
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL; ) {
                        if (rem[--remL] < dvsT[remL]) {
                            for (remI = remL; remI && !rem[--remI]; rem[remI] = base - 1) { }
                            --rem[remI]; rem[remL] += base;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) { } 
                } else { break; } 
            }
            qc[qi++] = cmp ? next : ++next; rem[0] && cmp ? (rem[remL] = dvd[dvdI] || 0) : (rem = [dvd[dvdI]]);
        } while ((dvdI++ < dvdL || rem[0] != null) && s--); if (!qc[0] && qi != 1) { --quo['e']; qc.shift(); }
        if (qi > dig) { rnd(quo, DECIMAL_PLACES, base, isOdd, rem[0] != null); }
        if (quo['e'] > MAX_EXP) { quo['c'] = quo['e'] = null; } else if (quo['e'] < MIN_EXP) { quo['c'] = [quo['e'] = 0]; }
        return quo;
    }
    function format(n, d, exp) {
        var i = d - (n = new BigNumber(n))['e'], c = n['c']; if (!c) { return n['toS'](); }
        if (c.length > ++d) { rnd(n, i, 10); }
        i = c[0] == 0 ? i + 1 : exp ? d : n['e'] + i + 1; for (; c.length < i; c.push(0)) { }
        i = n['e']; return exp == 1 || exp == 2 && (--d < i || i <= TO_EXP_NEG) ? (n['s'] < 0 && c[0] ? '-' : '') + (c.length > 1 ? (c.splice(1, 0, '.'), c.join('')) : c[0]) + (i < 0 ? 'e' : 'e+') + i : n['toS']();
    }
    function rnd(x, dp, base, isOdd, r) {
        var xc = x['c'], isNeg = x['s'] < 0, half = base / 2, i = x['e'] + dp + 1, next = xc[i], more = r || i < 0 || xc[i + 1] != null; r = ROUNDING_MODE < 4 ? (next != null || more) && (ROUNDING_MODE == 0 || ROUNDING_MODE == 2 && !isNeg || ROUNDING_MODE == 3 && isNeg) : next > half || next == half && (ROUNDING_MODE == 4 || more || ROUNDING_MODE == 6 && (xc[i - 1] & 1 || !dp && isOdd) || ROUNDING_MODE == 7 && !isNeg || ROUNDING_MODE == 8 && isNeg); if (i < 1 || !xc[0]) {
            xc.length = 0; xc.push(0); if (r) { xc[0] = 1; x['e'] = -dp; } else { x['e'] = 0; }
            return x;
        }
        xc.length = i--; if (r) { for (--base; ++xc[i] > base; ) { xc[i] = 0; if (!i--) { ++x['e']; xc.unshift(1); } } }
        for (i = xc.length; !xc[--i]; xc.pop()) { }
        return x;
    }
    function setMode(x, dp, rm) { var r = ROUNDING_MODE; ROUNDING_MODE = rm; x = new BigNumber(x); x['c'] && rnd(x, dp, 10); ROUNDING_MODE = r; return x; }
    P['abs'] = P['absoluteValue'] = function () {
        var x = new BigNumber(this); if (x['s'] < 0) { x['s'] = 1; }
        return x;
    }; P['ceil'] = function () { return setMode(this, 0, 2); }; P['comparedTo'] = P['cmp'] = function (y, b) {
        var a, x = this, xc = x['c'], yc = (id = -id, y = new BigNumber(y, b))['c'], i = x['s'], j = y['s'], k = x['e'], l = y['e']; if (!i || !j) { return null; }
        a = xc && !xc[0], b = yc && !yc[0]; if (a || b) { return a ? b ? 0 : -j : i; }
        if (i != j) { return i; }
        if (a = i < 0, b = k == l, !xc || !yc) { return b ? 0 : !xc ^ a ? 1 : -1; }
        if (!b) { return k > l ^ a ? 1 : -1; }
        for (i = -1, j = (k = xc.length) < (l = yc.length) ? k : l; ++i < j; ) { if (xc[i] != yc[i]) { return xc[i] > yc[i] ^ a ? 1 : -1; } }
        return k == l ? 0 : k > l ^ a ? 1 : -1;
    }; P['dividedBy'] = P['div'] = function (y, b) { var xc = this['c'], xe = this['e'], xs = this['s'], yc = (id = 2, y = new BigNumber(y, b))['c'], ye = y['e'], ys = y['s'], s = xs == ys ? 1 : -1; return !xe && (!xc || !xc[0]) || !ye && (!yc || !yc[0]) ? new BigNumber(!xs || !ys || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : xc && xc[0] == 0 || !yc ? s * 0 : s / 0) : divide(xc, yc, xe - ye, s, 10); }; P['equals'] = P['eq'] = function (n, b) { id = 3; return this['cmp'](n, b) === 0; }; P['floor'] = function () { return setMode(this, 0, 3); }; P['greaterThan'] = P['gt'] = function (n, b) { id = 4; return this['cmp'](n, b) > 0; }; P['greaterThanOrEqualTo'] = P['gte'] = function (n, b) { id = 5; return (b = this['cmp'](n, b)) == 1 || b === 0; }; P['isFinite'] = P['isF'] = function () { return !!this['c']; }; P['isNaN'] = function () { return !this['s']; }; P['isNegative'] = P['isNeg'] = function () { return this['s'] < 0; }; P['isZero'] = P['isZ'] = function () { return !!this['c'] && this['c'][0] == 0; }; P['lessThan'] = P['lt'] = function (n, b) { id = 6; return this['cmp'](n, b) < 0; }; P['lessThanOrEqualTo'] = P['lte'] = function (n, b) { id = 7; return (b = this['cmp'](n, b)) == -1 || b === 0; }; P['minus'] = function (y, b) {
        var d, i, j, xLTy, x = this, a = x['s']; b = (id = 8, y = new BigNumber(y, b))['s']; if (!a || !b) { return new BigNumber(NaN); }
        if (a != b) { return y['s'] = -b, x['plus'](y); }
        var xc = x['c'], xe = x['e'], yc = y['c'], ye = y['e']; if (!xe || !ye) {
            if (!xc || !yc) { return xc ? (y['s'] = -b, y) : new BigNumber(yc ? x : NaN); }
            if (!xc[0] || !yc[0]) { return yc[0] ? (y['s'] = -b, y) : new BigNumber(xc[0] ? x : ROUNDING_MODE == 3 ? -0 : 0); } 
        }
        if (xc = xc.slice(), a = xe - ye) {
            d = (xLTy = a < 0) ? (a = -a, xc) : (ye = xe, yc); for (d.reverse(), b = a; b--; d.push(0)) { }
            d.reverse();
        } else { j = ((xLTy = xc.length < yc.length) ? xc : yc).length; for (a = b = 0; b < j; b++) { if (xc[b] != yc[b]) { xLTy = xc[b] < yc[b]; break; } } }
        if (xLTy) { d = xc, xc = yc, yc = d; y['s'] = -y['s']; }
        if ((b = -((j = xc.length) - yc.length)) > 0) { for (; b--; xc[j++] = 0) { } }
        for (b = yc.length; b > a; ) {
            if (xc[--b] < yc[b]) {
                for (i = b; i && !xc[--i]; xc[i] = 9) { }
                --xc[i]; xc[b] += 10;
            }
            xc[b] -= yc[b];
        }
        for (; xc[--j] == 0; xc.pop()) { }
        for (; xc[0] == 0; xc.shift(), --ye) { }
        if (ye < MIN_EXP || !xc[0]) {
            if (!xc[0]) { y['s'] = ROUNDING_MODE == 3 ? -1 : 1; }
            xc = [ye = 0];
        }
        return y['c'] = xc, y['e'] = ye, y;
    }; P['modulo'] = P['mod'] = function (y, b) {
        var x = this, xc = x['c'], yc = (id = 9, y = new BigNumber(y, b))['c'], i = x['s'], j = y['s']; b = !i || !j || yc && !yc[0]; if (b || xc && !xc[0]) { return new BigNumber(b ? NaN : x); }
        x['s'] = y['s'] = 1; b = y['cmp'](x) == 1; x['s'] = i, y['s'] = j; return b ? new BigNumber(x) : (i = DECIMAL_PLACES, j = ROUNDING_MODE, DECIMAL_PLACES = 0, ROUNDING_MODE = 1, x = x['div'](y), DECIMAL_PLACES = i, ROUNDING_MODE = j, this['minus'](x['times'](y)));
    }; P['negated'] = P['neg'] = function () { var x = new BigNumber(this); return x['s'] = -x['s'] || null, x; }; P['plus'] = function (y, b) {
        var d, x = this, a = x['s']; b = (id = 10, y = new BigNumber(y, b))['s']; if (!a || !b) { return new BigNumber(NaN); }
        if (a != b) { return y['s'] = -b, x['minus'](y); }
        var xe = x['e'], xc = x['c'], ye = y['e'], yc = y['c']; if (!xe || !ye) {
            if (!xc || !yc) { return new BigNumber(a / 0); }
            if (!xc[0] || !yc[0]) { return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0); } 
        }
        if (xc = xc.slice(), a = xe - ye) {
            d = a > 0 ? (ye = xe, yc) : (a = -a, xc); for (d.reverse(); a--; d.push(0)) { }
            d.reverse();
        }
        if (xc.length - yc.length < 0) { d = yc, yc = xc, xc = d; }
        for (a = yc.length, b = 0; a; b = (xc[--a] = xc[a] + yc[a] + b) / 10 ^ 0, xc[a] %= 10) { }
        if (b) { xc.unshift(b); if (++ye > MAX_EXP) { xc = ye = null; } }
        for (a = xc.length; xc[--a] == 0; xc.pop()) { }
        return y['c'] = xc, y['e'] = ye, y;
    }; P['toPower'] = P['pow'] = function (e) {
        var i = e * 0 == 0 ? e | 0 : e, x = new BigNumber(this), y = new BigNumber(ONE); if ((((outOfRange = e < -MAX_POWER || e > MAX_POWER) && (i = e * 1 / 0)) || parse(e) != e && e !== 0 && !(i = NaN)) && !ifExceptionsThrow(e, 'exponent', 'pow') || !i) { return new BigNumber(Math.pow(x['toS'](), i)); }
        for (i = i < 0 ? -i : i; ; ) {
            if (i & 1) { y = y['times'](x); }
            i >>= 1; if (!i) { break; }
            x = x['times'](x);
        }
        return e < 0 ? ONE['div'](y) : y;
    }; P['round'] = function (dp, rm) { dp = dp == null || (((outOfRange = dp < 0 || dp > MAX) || parse(dp) != dp) && !ifExceptionsThrow(dp, 'decimal places', 'round')) ? 0 : dp | 0; rm = rm == null || (((outOfRange = rm < 0 || rm > 8) || parse(rm) != rm && rm !== 0) && !ifExceptionsThrow(rm, 'mode', 'round')) ? ROUNDING_MODE : rm | 0; return setMode(this, dp, rm); }; P['squareRoot'] = P['sqrt'] = function () {
        var n, r, re, t, x = this, c = x['c'], s = x['s'], e = x['e'], dp = DECIMAL_PLACES, rm = ROUNDING_MODE, half = new BigNumber('0.5'); if (s !== 1 || !c || !c[0]) { return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0); }
        s = Math.sqrt(x['toS']()); ROUNDING_MODE = 1; if (s == 0 || s == 1 / 0) {
            n = c.join(''); if (!(n.length + e & 1)) { n += '0'; }
            r = new BigNumber(Math.sqrt(n) + ''); if (!r['c']) { r['c'] = [1]; }
            r['e'] = (((e + 1) / 2) | 0) - (e < 0 || e & 1);
        } else { r = new BigNumber(n = s.toString()); }
        re = r['e']; s = re + (DECIMAL_PLACES += 4); if (s < 3) { s = 0; }
        e = s; for (; ; ) {
            t = r; r = half['times'](t['plus'](x['div'](t))); if (t['c'].slice(0, s).join('') === r['c'].slice(0, s).join('')) {
                c = r['c']; s = s - (n && r['e'] < re); if (c[s] == 9 && c[s - 1] == 9 && c[s - 2] == 9 && (c[s - 3] == 9 || n && c[s - 3] == 4)) {
                    if (n && c[s - 3] == 9) { t = r['round'](dp, 0); if (t['times'](t)['eq'](x)) { ROUNDING_MODE = rm; DECIMAL_PLACES = dp; return t; } }
                    DECIMAL_PLACES += 4; s += 4; n = '';
                } else {
                    if (!c[e] && !c[e - 1] && !c[e - 2] && (!c[e - 3] || c[e - 3] == 5)) {
                        if (c.length > e - 2) { c.length = e - 2; }
                        if (!r['times'](r)['eq'](x)) {
                            while (c.length < e - 3) { c.push(0); }
                            c[e - 3]++;
                        } 
                    }
                    ROUNDING_MODE = rm; rnd(r, DECIMAL_PLACES = dp, 10); return r;
                } 
            } 
        } 
    }; P['times'] = function (y, b) {
        var c, x = this, xc = x['c'], yc = (id = 11, y = new BigNumber(y, b))['c'], i = x['e'], j = y['e'], a = x['s']; y['s'] = a == (b = y['s']) ? 1 : -1; if (!i && (!xc || !xc[0]) || !j && (!yc || !yc[0])) { return new BigNumber(!a || !b || xc && !xc[0] && !yc || yc && !yc[0] && !xc ? NaN : !xc || !yc ? y['s'] / 0 : y['s'] * 0); }
        y['e'] = i + j; if ((a = xc.length) < (b = yc.length)) { c = xc, xc = yc, yc = c, j = a, a = b, b = j; }
        for (j = a + b, c = []; j--; c.push(0)) { }
        for (i = b - 1; i > -1; i--) {
            for (b = 0, j = a + i; j > i; b = c[j] + yc[i] * xc[j - i - 1] + b, c[j--] = b % 10 | 0, b = b / 10 | 0) { }
            if (b) { c[j] = (c[j] + b) % 10; } 
        }
        b && ++y['e']; !c[0] && c.shift(); for (j = c.length; !c[--j]; c.pop()) { }
        y['c'] = y['e'] > MAX_EXP ? (y['e'] = null) : y['e'] < MIN_EXP ? [y['e'] = 0] : c; return y;
    }; P['toExponential'] = P['toE'] = function (dp) { return format(this, (dp == null || ((outOfRange = dp < 0 || dp > MAX) || parse(dp) != dp && dp !== 0) && !ifExceptionsThrow(dp, 'decimal places', 'toE')) && this['c'] ? this['c'].length - 1 : dp | 0, 1); }; P['toFixed'] = P['toF'] = function (dp) {
        var n, str, d, x = this; if (!(dp == null || ((outOfRange = dp < 0 || dp > MAX) || parse(dp) != dp && dp !== 0) && !ifExceptionsThrow(dp, 'decimal places', 'toF'))) { d = x['e'] + (dp | 0); }
        n = TO_EXP_NEG, dp = TO_EXP_POS; TO_EXP_NEG = -(TO_EXP_POS = 1 / 0); if (d == str) { str = x['toS'](); } else { str = format(x, d); if (x['s'] < 0 && x['c']) { if (!x['c'][0]) { str = str.replace(/^-/, ''); } else if (str.indexOf('-') < 0) { str = '-' + str; } } }
        TO_EXP_NEG = n, TO_EXP_POS = dp; return str;
    }; P['toFraction'] = P['toFr'] = function (maxD) {
        var q, frac, n0, d0, d2, n, e, n1 = d0 = new BigNumber(ONE), d1 = n0 = new BigNumber('0'), x = this, xc = x['c'], exp = MAX_EXP, dp = DECIMAL_PLACES, rm = ROUNDING_MODE, d = new BigNumber(ONE); if (!xc) { return x['toS'](); }
        e = d['e'] = xc.length - x['e'] - 1; if (maxD == null || (!(id = 12, n = new BigNumber(maxD))['s'] || (outOfRange = n['cmp'](n1) < 0 || !n['c']) || (ERRORS && n['e'] < n['c'].length - 1)) && !ifExceptionsThrow(maxD, 'max denominator', 'toFr') || (maxD = n)['cmp'](d) > 0) { maxD = e > 0 ? d : n1; }
        MAX_EXP = 1 / 0; n = new BigNumber(xc.join('')); for (DECIMAL_PLACES = 0, ROUNDING_MODE = 1; ; ) {
            q = n['div'](d); d2 = d0['plus'](q['times'](d1)); if (d2['cmp'](maxD) == 1) { break; }
            d0 = d1, d1 = d2; n1 = n0['plus'](q['times'](d2 = n1)); n0 = d2; d = n['minus'](q['times'](d2 = d)); n = d2;
        }
        d2 = maxD['minus'](d0)['div'](d1); n0 = n0['plus'](d2['times'](n1)); d0 = d0['plus'](d2['times'](d1)); n0['s'] = n1['s'] = x['s']; DECIMAL_PLACES = e * 2; ROUNDING_MODE = rm; frac = n1['div'](d1)['minus'](x)['abs']()['cmp'](n0['div'](d0)['minus'](x)['abs']()) < 1 ? [n1['toS'](), d1['toS']()] : [n0['toS'](), d0['toS']()]; return MAX_EXP = exp, DECIMAL_PLACES = dp, frac;
    }; P['toPrecision'] = P['toP'] = function (sd) { return sd == null || (((outOfRange = sd < 1 || sd > MAX) || parse(sd) != sd) && !ifExceptionsThrow(sd, 'precision', 'toP')) ? this['toS']() : format(this, --sd | 0, 2); }; P['toString'] = P['toS'] = function (b) {
        var u, str, strL, x = this, xe = x['e']; if (xe === null) { str = x['s'] ? 'Infinity' : 'NaN'; } else if (b === u && (xe <= TO_EXP_NEG || xe >= TO_EXP_POS)) { return format(x, x['c'].length - 1, 1); } else {
            str = x['c'].join(''); if (xe < 0) {
                for (; ++xe; str = '0' + str) { }
                str = '0.' + str;
            } else if (strL = str.length, xe > 0) { if (++xe > strL) { for (xe -= strL; xe--; str += '0') { } } else if (xe < strL) { str = str.slice(0, xe) + '.' + str.slice(xe); } } else { if (u = str.charAt(0), strL > 1) { str = u + '.' + str.slice(1); } else if (u == '0') { return u; } }
            if (b != null) { if (!(outOfRange = !(b >= 2 && b < 65)) && (b == (b | 0) || !ERRORS)) { str = convert(str, b | 0, 10, x['s']); if (str == '0') { return str; } } else { ifExceptionsThrow(b, 'base', 'toS'); } } 
        }
        return x['s'] < 0 ? '-' + str : str;
    }; P['valueOf'] = function () { return this['toS'](); }; if (typeof module !== 'undefined' && module.exports) { module.exports = BigNumber; } else if (typeof define == 'function' && define.amd) { define(function () { return BigNumber; }); } else { global['BigNumber'] = BigNumber; } 
})(this);


var MapExt = MapExt || {};

MJQ(function () {
    window.$ = window.$ || MJQ;
    window.jQuery = window.$;

    MJQ.parseJSON = jQuery.parseJSON = function (data) {
        if (!data || typeof data !== "string") {
            return null;
        }
        data = jQuery.trim(data);

        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(data, function (key, value) {
                var iso, js, re;
                iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
                js = /\/Date\((\d+)\)\//gi;
                re = RegExp;
                if (typeof value === 'string') {
                    if (js.test(value)) {
                        return new Date(+re.$1);
                    }
                    else if (iso.test(value)) {
                        return new Date(Date.UTC(+re.$1, +re.$2 - 1, +re.$3, +re.$4, +re.$5, +re.$6));
                    }
                }
                return value;
            });
        }
        return null;
    }

});

(function() {
    var 
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
    space = null,
    line = "\r\n",
    depth = 0;

    MapExt.formatDate = function(dtm, fmt){
        ///	<summary>
        ///     将日期对象格式化为指定格式的字符串形式.
        ///	</summary>
    	///	<param name="dtm" type="Date">
        ///		日期对象
        ///	</param>
        ///	<param name="fmt" type="String">
        ///		格式,值包括:yyyy表示4位年,MM表示2位月份,dd表示2位天,HH表示小时(24小时制),mm表示分钟,ss表示秒,S表示毫秒
        ///     例如: yyyy-MM-dd 会被格式化成 2014-02-18
        ///	</param>
        ///	<returns type="String" />

        fmt = fmt || 'yyyy-MM-dd';
       var o = { "M+": dtm.getMonth() + 1, "d+": dtm.getDate(), "h+": dtm.getHours(), "H+": dtm.getHours(), "m+": dtm.getMinutes(), "s+": dtm.getSeconds(), "q+": Math.floor((dtm.getMonth() + 3) / 3), "S": dtm.getMilliseconds() };

        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (dtm.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return fmt;
    }

    MapExt.parseDate = function(str, fmt){
        ///	<summary>
        ///     将字符串按照指定格式,格式化为日期对象.
        ///	</summary>
    	///	<param name="str" type="String">
        ///		日期对象
        ///	</param>
        ///	<param name="fmt" type="String">
        ///		格式,值包括:yyyy表示4位年,MM表示2位月份,dd表示2位天,HH表示小时(24小时制),mm表示分钟,ss表示秒,S表示毫秒
        ///     例如: 2014-02-18 字符串可以使用 yyyy-MM-dd 格式进行格式化
        ///	</param>
        ///	<returns type="Date" />

        fmt = fmt || 'yyyy-MM-dd';
        var year = 0, month = 0, date = 0, hours = 0, minutes = 0, seconds = 0, ms = 0;
        
        var o = ["y+", "M+", "d+", "h+", "H+", "m+", "s+", "S"];

        str = MapExt.trim(str);
        fmt = MapExt.trim(fmt);

        for(var k in o){
            var regex = new RegExp("(" + o[k] + ")");
            if (regex.test(fmt)){
                var start = RegExp.index;
                var end = RegExp.lastIndex;
                if (start != -1 && end != -1){
                    if (start > str.length || end > str.length)
                        continue;

                    var part = str.substring(start, end);
                    var val = parseInt(part, 10);
                    
                    if (!val)
                        continue;

                    switch(o[k]){
                        case "y+":
                            year = val;
                            break;
                        case "M+":
                            month = val - 1;
                            break;
                        case "d+":
                            date = val;
                            break;
                        case "H+":
                        case "h+":
                            hours = val;
                            break;
                        case "m+":
                            minutes = val;
                            break;
                        case "s+":
                            seconds = val;
                            break;
                        case "S":
                            ms = val;
                            break;
                    }
                }
            }
        }

        return new Date(year, month, date, hours, minutes, seconds, ms);
    }

    MapExt.addDate = function(dtm, type, num){
        ///	<summary>
        ///     日期加减计算
        ///	</summary>
    	///	<param name="dtm" type="Date">
        ///		日期对象
        ///	</param>
        ///	<param name="type" type="String">
        ///		类型,值包括 "day" 表示增加几天, "hour" 表示增加几小时, "minute" 表示增加几分钟, "second" 表示增加几秒
        ///	</param>
        ///	<param name="num" type="Number">
        ///		加减的数值,正数表示增加相应时间,负数表示减去相应的时间
        ///	</param>
        ///	<returns type="Date" />

        var time = dtm.getTime();
        switch(type){
            case "day":
                time += num * 24 * 60 * 60 * 1000;
                break;
            case "hour":
                time += num * 60 * 60 * 1000;
                break;
            case "minute":
                time += num * 60 * 1000;
                break;
            case "second":
                time += num * 1000;
                break;
        }
        return new Date(time);
    }

    MapExt.isLeapYear = function(dtm) {
        ///	<summary>
        ///     判断日期是否为闰年
        ///	</summary>
    	///	<param name="dtm" type="Date">
        ///		日期对象
        ///	</param>
        ///	<returns type="Boolean" />
        if (!dtm) 
            return false;

        var year = dtm.getFullYear();
        return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    }
    
    function _xmlEscape(sXml) {
        if (sXml == null || sXml == undefined){
            return "";
        }
        else{
            return sXml.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
        }
    }
    
    function _toXML(rootName, jsObject) {
        var s = "";
        var textNode = false;
        if (!(jsObject instanceof Object)
            || jsObject instanceof Number
            || jsObject instanceof String
            || jsObject instanceof Boolean
            || jsObject instanceof Date) {

            s += space.join("") + "<" + rootName + ">";
            if (jsObject instanceof Date) {
                s += _xmlEscape(MapExt.formatDate(jsObject, "yyyy-MM-ddTHH:mm:ss"));
            }
            else {
                s += _xmlEscape(jsObject);
            }
            s += "</" + rootName + ">" + line;
        }
        else {
            var isArray = jsObject instanceof Array;
            if (depth != 0 || !isArray){
                s += space.join("") + "<" + rootName
                var text = "";
                for (var i in jsObject) {
                    if (jsObject[i] instanceof Function) {
                        continue;
                    }
                    if (i == "__attr") {
                        var attr = jsObject[i];
                        for (var j in attr) {
                            if (attr[j] instanceof Function) {
                                continue;
                            }
                            s += " " + j + "=\"" + _xmlEscape(attr[j]) + "\" "
                        }
                    }
                    if (i == "__text"){
                        if (jsObject[i]){
                            text = jsObject[i].toString();
                        }
                    }
                }
                if (text != ""){
                    textNode = true;
                    s += ">" + text;
                }
                else{
                    s += ">" + line;
                }
                space.push("  ");
            }
            for (var k in jsObject) {
                var instance = jsObject[k];
                if (k == "__attr" || k == "__text" || instance instanceof Function) {
                    continue;
                }
                if (instance instanceof Array){
                    for (var l in instance){
                        if (instance[l] instanceof Function) {
                            continue;
                        }
                        depth++;
                        s += _toXML(k, instance[l]);
                        depth--;
                    }
                }
                else{
                    depth++;
                    s += _toXML(isArray ? rootName : k, jsObject[k]);
                    depth--;
                }
            }
            if (depth != 0 || !isArray){
                space.pop();
                if (!textNode){
                    s += space.join("");    
                }
                s += "</" + rootName + ">" + line;
            }
        }
        return s;
    }
    
   
    MapExt.toXml = function(rootName, jsObject) {
        ///	<summary>
        ///     将一个js对象转换为XML字符串
        ///	</summary>
    	///	<param name="rootName" type="String">
        ///		根节点元素名
        ///	</param>
    	///	<param name="jsObject" type="Object">
        ///		转换为XML字符串的对象
        ///	</param>
        ///	<returns type="String" />

        if (!rootName || !jsObject) {
            return "";
        }
        if (MapExt.trim(rootName) == "") {
            return "";
        }
        space = [];
        depth = 0;
        return _toXML(rootName, jsObject);
    }

    MapExt.trim = function(str) {
        ///	<summary>
        ///     过滤字符串前后空格
        ///	</summary>
        ///	<param name="str" type="String">
        ///		表示要被过滤空格的字符串
        ///	</param>
        ///	<returns type="String" />

        if (!str) {
            return "";
        }
        return str.replace(rtrim, "");
    }

    MapExt.leftPad = function(string, size, character){
        ///	<summary>
        ///     左填充字符串
        ///	</summary>
    	///	<param name="string" type="String">
        ///		原字符串
        ///	</param>
    	///	<param name="size" type="Number">
        ///		填充到指定长度
        ///	</param>
        ///	<param name="size" type="Number">
        ///		填充的字符
        ///	</param>
        ///	<returns type="String" />

        var result = String(string);
        character = character || " ";
        while (result.length < size) {
            result = character + result;
        }
        return result;
    }

    MapExt.rightPad = function(string, size, character){
        ///	<summary>
        ///     右填充字符串
        ///	</summary>
    	///	<param name="string" type="String">
        ///		原字符串
        ///	</param>
    	///	<param name="size" type="Number">
        ///		填充到指定长度
        ///	</param>
        ///	<param name="size" type="Number">
        ///		填充的字符
        ///	</param>
        ///	<returns type="String" />
        var result = String(string);
        character = character || " ";
        while (result.length < size) {
            result =  result + character;
        }
        return result;
    }

    MapExt.parseJSON = function(strJson) {
        ///	<summary>
        ///     将JSON字符串转换为js对象
        ///     1.如果JSON字符串格式存在错误,本函数将产生异常
        ///     2.如果格式化服务端返回的HttpResult对象JSON格式.请使用parseJSONResult方法
        ///     3.如果格式化服务端返回的HttpResult对象XML格式,请使用parseXMLResult方法
        ///     4.以上两个方法不会产生异常,解析失败也会返回对象
        ///	</summary>
        ///	<param name="strJson" type="String">
        ///		表示被转换的JSON字符串
        ///	</param>
        ///	<returns type="Object" />

        if (!strJson) {
            return null;
        }
        return MJQ.parseJSON(strJson);
    }

    MapExt.parseJSONResult = function(strJSON) {
        ///	<summary>
        ///     将JSON字符串转换为HttpResult对象
        ///	</summary>
        ///	<param name="strJSON" type="String">
        ///		表示被转换的JSON字符串
        ///	</param>
        ///	<returns type="HttpResult" />

        var result = null;
        if (!strJSON) {
            result = { Result : false, ErrorMessage : "strJSON参数为null或undefined" };
            return result;
        }
        try{
            result = MJQ.parseJSON(strJSON);
        }
        catch(e){
            var error = "";
			var start = strJSON.indexOf("<title>");
			var end = strJSON.indexOf("</title>");
			if( start > 0 && end > start ){
				error += "调用服务器失败。\r\n" + strJSON.substring(start + 7, end);
            }
            else{
                error += "转换json失败。\r\n" + e.description;
            }
            result = { Result : false, ErrorMessage : error };
        }
        return result;
    }

    //在appForm的afterSave函数中,可以通过appForm.returnxml拿到服务端返回的xml.
    MapExt.parseXmlResult = function(strXML) {
        ///	<summary>
        ///     将XML字符串转换为HttpResult对象
        ///	</summary>
        ///	<param name="strXML" type="String">
        ///		表示被转换的XML字符串
        ///	</param>
        ///	<returns type="HttpResult" />

        var result = null;

        if (!strXML) {
            result = { Result : false, ErrorMessage : "strXML参数为null或undefined" };
            return result;
        }
        var doc = null;

        if(window.ActiveXObject){
            doc = MapExt.createXmlDocument();
            if (!doc.loadXML(strXML)){
                return { Result : false, ErrorMessage : "加载XML失败,请检查XML文档格式" };
            }
        }
        else{
            doc = new DOMParser().parseFromString(strXML, "text/xml");
            var errNode = doc.getElementsByTagName("parsererror");
            if (errNode.length > 0){
                return { Result : false, ErrorMessage : "加载XML失败,请检查XML文档格式" };
            }
        }

        var node = doc.documentElement;
        var resultVal = node.getAttribute("result");
        var keyVal = node.getAttribute("keyvalue");
        var errVal = node.getAttribute("errormessage");

        var result = { Result : false, KeyValue : "", ErrorMessage : "" };

        if (resultVal && MapExt.trim(resultVal) == "true"){
            result.Result = true;
        }
        if (keyVal){
            result.KeyValue = keyVal;
        }
        if (errVal){
            result.ErrorMessage = errVal;
        }
        return result;
    }

    function _ajax(option){ 

        if (option.headers){
            option.headers["x-charset"] = "utf-8";
        }
        else{
            option.headers = { "x-charset": "utf-8" };
        }

        var _data = null;

        option.success = function(data){
            _data = data;    
        }
        
        MJQ.ajax(option);

        return _data
    }

    function setUrl(option){
        if (!option.url){
            var classInfo = option.serviceInfo;
            if (classInfo){
                var idx = classInfo.lastIndexOf(".");
                if (idx != -1){
                    var assembly = classInfo.substring(0, idx);

                    var assemblyName = assembly.substring(assembly.length - 7);
                    if (assemblyName === "Service") {
                        assembly = assembly.substring(0, assembly.length - 7);
                    }
           
                    var method = classInfo.substring(idx + 1, classInfo.length);
           
                    option.url =  "/service/" + assembly + "/" + method + ".aspx";
                }
            }
        }
    }

    var utility = {
        // 将key/value对转换为query string
        _param: function (option) {
            if (option && typeof option !== "object") {
                return option.toString();
            }
            var s = [],
                value = null;
            for (var key in option) {
                // 如果是函数则执行，并将结果返回
                value = typeof option[key] === "function" ? option[key]() : option[key];
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }
            return s.join("&");
        },
        // 检查属性
        _inspectProperty: function (option, key, type, functionName) {
            if (!option || typeof option !== "object") {
                utility._error(functionName + ": option参数不是一个对象。");
            }
            if (typeof option[key] !== type) {
                utility._error(functionName + ": " + key + "属性未定义或类型不正确");
            }
        },
        // 对url进行合并参数，返回合并后的url
        _concatURI: function (url, data) {
            if (data) {
                url += (url.indexOf("?") !== -1 ? "&" : "?") + utility._param(data);
            }
            return url;
        },
        // 合并对象
        _merge: function (o, add) {
            var p;
            if (typeof o !== "object" || typeof add !== "object") return;

            for (p in add) {
                o[p] = add[p];
            }
            return o;
        },
        // 提示错误
        _error: function (msg) {
            throw new Error(msg);
        }
    }

    MapExt.postObject = function(option){
        ///	<summary>
        ///     post键值对数据到服务端
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		post数据参数
        ///	</param>
        ///	<returns type="String" />
        option.contentType = "application/x-www-form-urlencoded";
        option.async = false;
        option.type = "POST";

        setUrl(option);

        return _ajax(option);
    }

    MapExt.postXml = function(option){
        ///	<summary>
        ///     post xml数据到服务端
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		post数据参数
        ///	</param>
        ///	<returns type="String" />
        option.contentType = "application/xml";
        option.async = false;
        option.type = "POST";

        var _data = option.data;

        if (_data instanceof Object){
            if (_data.xml){
                option.data = _data.xml;
            }
            else{
                option.data = MapExt.toXml("data", _data);
            }
        }
        
        setUrl(option);

        return _ajax(option);
    }

    MapExt.postJSON = function(option){
        ///	<summary>
        ///     post JSON 数据到服务端
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		post数据参数
        ///	</param>
        ///	<returns type="String" />
        option.contentType = "application/json";
        option.async = false;
        option.type = "POST";
        option.processData = false;
        
        var _data = option.data;

        if (_data instanceof Object){
            option.data = JSON.stringify(_data);
        }

        setUrl(option);

        return _ajax(option);
    }

    MapExt.toJSON = function(option){
        ///	<summary>
        ///     将javascript对象转换为json字符串
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		要转换的javascript对象
        ///	</param>
        ///	<returns type="String" />
        if (option == null || option == undefined){
            return null;
        }
        return JSON.stringify(option);
    }

    MapExt.httpGet = function(option){
        ///	<summary>
        ///     发起 ajax get请求并返回结果
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		参数对象
        ///	</param>
        ///	<returns type="String" />

        option.type = "GET";

        option.async = false;

        option.processData = false;

        setUrl(option);

        if (option.data){
            option.url = MapExt.param(option.url, option.data);
            option.data = null;
        }

        if (option.url.indexOf("?") == -1){
            option.url += "?_t=" + Math.random();
        }
        else{
            option.url += "&_t=" + Math.random();
        }

        return _ajax(option);
    }

    MapExt.param = function(url, option){
        ///	<summary>
        ///     使用utf-8方式拼接URL
        ///	</summary>
        ///	<param name="url" type="String">
        ///		请求的页面
        ///	</param>
        ///	<param name="option" type="Object">
        ///		参数键值对
        ///	</param>
        ///	<returns type="String" />

        if (url.indexOf("?") == -1){
            url = url + "?";
        }
        url += MJQ.param(option) + "&x-charset=utf-8";
        return url;
    }

    MapExt.reload = function(win){
        ///	<summary>
        ///     刷新页面
        ///	</summary>
        ///	<param name="win" type="Window">
        ///		要刷新的窗口.如不传递则为当前窗口
        ///	</param>
        ///	<returns type="String" />

        var _win = win || window;
        if (_win){
            try{
                _win.location.href = _win.location.href;
            }catch(e){}
        }
    }

    MapExt.navigate = function(url, win){
        ///	<summary>
        ///     定位到指定页面
        ///	</summary>
        ///	<param name="url" type="String">
        ///		定位的URL地址
        ///	</param>
        ///	<param name="win" type="Window">
        ///		要刷新的窗口.如不传递则为当前窗口
        ///	</param>
        ///	<returns type="String" />

        var _win = win || window;
        if (_win){
            _win.location.href = url;
        }
    }

    MapExt.setFrameSrc = function(url, frm){
        ///	<summary>
        ///     设置iframe 的 src
        ///	</summary>
        ///	<param name="url" type="String">
        ///		URL地址
        ///	</param>
        ///	<param name="frm" type="String">
        ///		iframe的id属性值
        ///	</param>
        var _frm = typeof(frm) == "string" ? MJQ("#" + frm)[0] : frm;
        _frm.src = url;
    }

    MapExt.getDomById = function(id){
        ///	<summary>
        ///     使用JQuery获取一个dom元素
        ///	</summary>
        ///	<param name="id" type="String">
        ///		dom 元素 id
        ///	</param>
        ///	<returns type="Object" />

        var obj = MJQ("#" + id);
        if (obj.length > 0){
            return obj[0];
        }
        else{
            return null;
        }
    }

    MapExt.openWindow = function (option) {
        ///	<summary>
        ///     打开一个非模态窗口
        ///     var option = {
        ///         url: "/xxxx/abc.aspx",			// （必埴）文件路径，不带任何查询字符串参数
        ///         data: { a: 1, b: 2, c: 3 },		// （可选）查询字符串参数对象，注意：是一个对象，不是字符串。
        ///         name: "windowName",				// （必埴）窗口名称
        ///         dialogFeatures: "",				// （可选）对话框特性。如果不指定，程序自动计算
        ///     };
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		选项值
        ///	</param>
        ///	<returns type="Object" />

        utility._inspectProperty(option, "url", "string", "MapExt.openWindow()");
        utility._inspectProperty(option, "name", "string", "MapExt.openWindow()");

        var url = MapExt.param(option.url, option.data);

        var sFeatures = option.dialogFeatures;
        if (typeof (sFeatures) != "string" || sFeatures.length < 1) {
            var iX = window.screen.width;
            var iY = window.screen.height;
            sFeatures = "left=0;top=0;width=" + iX + "px;heigth=" + iY + "px;status=1;resizable=1;";
        }
        return window.open(url, option.name, sFeatures);
    }

    
    MapExt.showDialog = function (option) {
        ///	<summary>
        ///    打开一个模态窗口
        ///    var option = {
        ///        url: "/xxxx/abc.aspx",			// （必埴）文件路径，不带任何查询字符串参数
        ///        data: { a: 1, b: 2, c: 3 },		// （可选）查询字符串参数对象，注意：是一个对象，不是字符串。
        ///        dialogArguments: {},				// （可选）传递给对话框的参数对象
        ///        dialogFeatures: "",				// （可选）对话框特性。如果不指定，程序自动计算
        ///   };
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		选项值
        ///	</param>
        ///	<returns type="Object" />

        utility._inspectProperty(option, "url", "string", "MapExt.showDialog()");

        var url = MapExt.param(option.url, option.data);
        var sFeatures = option.dialogFeatures;
        if (typeof (sFeatures) != "string" || sFeatures.length < 1) {
            var iX = window.screen.width / 2;
            var iY = window.screen.height - 80 / 2;
            sFeatures = "dialogWidth:" + iX + "px;dialogHeight:" + iY + "px; status:0; help:0; resizable:0; center:1;";
        }
        return window.showModalDialog(url, option.dialogArguments, sFeatures);
    }

   
    MapExt.showPostDialog = function (option) {
        ///	<summary>
        ///    打开一个可以进行POST操作的模态窗口
        ///    var option = {
        ///         url: "/xxxx/abc.aspx",			// （必埴）文件路径，不带任何查询字符串参数
        ///         data: { a: 1, b: 2, c: 3 },		// （可选）查询字符串参数对象，注意：是一个对象，不是字符串。
        ///         title: "title",					// （可选）窗口标题
        ///         transferUrl:""                    // （可选）用于重写默认的FrameTemp0.aspx地址
        ///         dialogArguments: {},				// （可选）传递给对话框的参数对象
        ///         dialogFeatures: "",				// （可选）对话框特性。如果不指定，程序自动计算
        ///    };
        ///	</summary>
        ///	<param name="option" type="Object">
        ///		选项值
        ///	</param>
        ///	<returns type="Object" />

        utility._inspectProperty(option, "url", "string", "MapExt.showPostDialog()");


        var transferUrl = option.transferUrl || "/FrameTemp0.aspx?";
        var urlData = { filename: option.url, title: option.title, param: MJQ.param(option.data) };
        var url = MapExt.param(transferUrl, urlData);

        var sFeatures = option.dialogFeatures;
        if (typeof (sFeatures) != "string" || sFeatures.length < 1) {
            var iX = window.screen.width / 2;
            var iY = window.screen.height - 80 / 2;
            sFeatures = "dialogWidth:" + iX + "px;dialogHeight:" + iY + "px; status:0; help:0; resizable:0; center:1;";
        }
        return window.showModalDialog(url, option.dialogArguments, sFeatures);
    }

    MapExt.createXmlDocument = function(){
        ///	<summary>
        ///    创建xml document对象
        ///	</summary>
        ///	<returns type="Object" />

         if (typeof arguments.callee.activeXString != "string") {
            var versions = ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument"];
            for (var i = 0, length = versions.length; i < length; i++) {
                try {
                    var xmlDom = new ActiveXObject(versions[i]);
                    arguments.callee.activeXString = versions[i];
                    return xmlDom;
                } catch (e) {}
            }
        }
        return new ActiveXObject(arguments.callee.activeXString);
    }

    MapExt.cookie = MJQ.cookie;
    ///	<summary>
    ///    cookie读取封装
    ///	</summary>
    ///	<returns type="Object" />

    var createUploadIframe = function (frameId) {
        var frame = null;
        if (window.ActiveXObject) {

            try {
                frame = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');
            } catch (error) {
            }
        }
        if (!frame) {
            frame = document.createElement('iframe');
            frame.id = frameId;
            frame.name = frameId;
        }
        frame.src = 'javascript:false';
        frame.style.position = 'absolute';
        frame.style.top = '-1000px';
        frame.style.left = '-1000px';

        document.body.appendChild(frame);

        return frame;
    }
    var createUploadForm = function (formId, url) {

        var form = document.createElement('form');
        form.id = formId;
        form.name = formId;
        form.method = "POST";
        form.action = url;
        form.style.position = 'absolute';
        form.style.top = '-1200px';
        form.style.left = '-1200px';

        document.body.appendChild(form);
        return form;
    }
    var handleError = function (option, xml, status, e) {
        if (option && option.error && typeof (option.error) == "function") {
            try {
                option.error(xml, status, e);
            } catch (e) {

            }
        }
    }

    var handleSuccess = function (option, xml, status) {
        if (option && option.success && typeof (option.success) == "function") {
            option.success(xml, status);
        }
    }
    var handleComplete = function (option, xml, status) {
        if (option && option.complete && typeof (option.complete) == "function") {
            option.complete(xml, status);
        }
    }
    var submit = function (option) {
        if (!option) return false;

        var id = new Date().getTime();
        var createIframe = !option.frame;
        var formId = 'myUploadForm' + id;
        var form = createUploadForm(formId, option.url);

        var frame;
        if (createIframe) {
            frame = createUploadIframe('UploadForm' + id);
        } else {
            frame = getElement(option.frame);
        }
        if (!frame) return false;

        var requestDone = false;
        var xml = {};

        var uploadCallback = function (isTimeout) {
            try {
                if (frame.contentWindow) {
                    xml.responseText = frame.contentWindow.document.body ? frame.contentWindow.document.body.innerHTML : null;
                    xml.responseXML = frame.contentWindow.document.XMLDocument ? frame.contentWindow.document.XMLDocument : frame.contentWindow.document;

                } else if (frame.contentDocument) {
                    xml.responseText = frame.contentDocument.document.body ? frame.contentDocument.document.body.innerHTML : null;
                    xml.responseXML = frame.contentDocument.document.XMLDocument ? frame.contentDocument.document.XMLDocument : frame.contentDocument.document;
                }
            } catch (e) {
                handleError(option, xml, null, e);
            }
            if (xml || isTimeout == "timeout") {
                requestDone = true;
                var status;
                try {
                    status = isTimeout != "timeout" ? "success" : "error";

                    if (status != "error") {
                        var data = uploadHttpData(xml, option.dataType);
                        if (option.success)
                            handleSuccess(option, data, status);
                    } else
                        handleError(option, xml, status);
                } catch (e) {
                    status = "error";
                    handleError(option, xml, status, e);
                }

                handleComplete(option, xml, status);

                if (window.attachEvent) {
                    frame.detachEvent('onload', uploadCallback);
                } else {
                    frame.removeEventListener('load', uploadCallback, false);
                }

                setTimeout(function () {
                    try {
                        if (createIframe)
                            document.body.removeChild(frame);
                        document.body.removeChild(form);
                    } catch (e) {
                        handleError(option, xml, null, e);
                    }

                }, 100);

                xml = null;

            }
        };
        if (option.timeout > 0) {

            setTimeout(function () {
                if (!requestDone) uploadCallback("timeout");
            }, option.timeout);
        }
        try {

            form.target = frame.name;
            if (option.data != null && option.data != undefined) {
                for (var p in option.data) {
                    if (typeof (option.data[p]) != "function" && typeof (option.data[p]) != "undefined") {

                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.name = p;
                        input.value = option.data[p];
                        form.appendChild(input);
                    }
                }
            }
            if (option.files && option.files.length > 0) {
                if (form.encoding) {
                    form.encoding = 'multipart/form-data';
                } else {
                    form.enctype = 'multipart/form-data';
                }
                for (var index = 0; index < option.files.length; index++) {
                    var file = getElement(option.files[index]);
                    var clone = file.cloneNode(true);
                    file.parentNode.insertBefore(clone, file);
                    form.appendChild(file);
                }
            }
            form.submit();

        } catch (e) {
            handleError(option, xml, null, e);
        }

        if (window.attachEvent) {
            frame.attachEvent('onload', uploadCallback);
        } else {
            frame.addEventListener('load', uploadCallback, false);
        }
        return {
            abort: function () {
            }
        };

    }
    var getElement = function (element) {
        var dom = null;
        if (typeof (element) == "string") {
            dom = document.getElementById(element);
            if (!dom) {
                var elements = document.getElementsByName(element);
                if (elements.length > 0) {
                    dom = elements[0];
                }
            }

        } else if (typeof (element) == "object") {
            dom = element;
        }
        return dom;
    }
    var uploadHttpData = function (r, type) {
        var data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;

        if (type == "json")
            eval("data = " + data);
        return data;
    }

    MapExt.iframeSubmit = submit;
    ///	<summary>
    ///    提交数据到iframe
    ///	</summary>
    ///	<returns type="Object" />

    MapExt.number = function(val){
        this._num = new BigNumber(val);

        //加
        this.plus = function(val){
            this._num = this._num.plus(val);
            return this;
        }

        //减
        this.minus = function(val){
            this._num = this._num.minus(val);
            return this;
        }

        //乘
        this.multiply = function(val){
            this._num = this._num.times(val);
            return this;
        }

        //除
        this.divide = function(val){
            this._num = this._num.div(val);
            return this;
        }

        //求余
        this.mod = function(val){
            this._num = this._num.modulo(val);
            return this;
        }

        //平方
        this.pow = function(val){
            this._num = this._num.pow(val);
            return this;
        }

        //开方
        this.sqrt = function(){
            this._num = this._num.sqrt();
            return this;
        }

        //大于
        this.greaterThan = function(val){
            return this._num.greaterThan(val);
        }

        //大于等于
        this.greaterThanOrEqualTo = function(val){
            return this._num.greaterThanOrEqualTo(val);
        }

        //小于
        this.lessThan = function(val){
            return this._num.lessThan(val);
        }

        //小于等于
        this.lessThanOrEqualTo = function(val){
            return this._num.lessThanOrEqualTo(val);
        }

        //是否相等
        this.equals = function(val){
            return this._num.equals(val);
        }

        //比较
        this.comparedTo = function(val){
            return this._num.comparedTo(val);
        }

        //是否为0
        this.isZero = function(){
           return this._num.isZero();
        }

        //是否为负数
        this.isNeg = function(){
            return this._num.isNeg();
        }

        //转换为负数
        this.neg = function(){
            this._num = this._num.neg();
            return this;
        }

        //求绝对值
        this.abs = function(){
            this._num = this._num.abs();
            return this;
        }

        //截断
        this.toFixed = function(place){
            this._num = this._num.toFixed(place);
            return this;
        }

        //四舍五入
        this.round = function(place){
            this._num = this._num.round(place);
            return this;
        }

        //向下舍入
        this.floor = function(){
            this._num = this._num.floor();
            return this;
        }

        //向上舍入
        this.ceil = function(){
            this._num = this._num.ceil();
            return this;
        }

        //转换为指定精度
        this.toPrecision = function(num){
            return this._num.toPrecision(num);
        }

        //转换为带千分位的字符串
        this.toCurrency = function(){
            var str = this._num.toString();
            var re = /(\d{1,3})(?=(\d{3})+(?:\.))/g;
            return str.replace(re, "$1,");
        }

        //转换为字符串
        this.toString = function(){
            return this._num.toString();
        }
    }

    MapExt.getTableXml = function(option) {

		var tab, start = 0, func;

		if (typeof (option) == "string") {
			tab = document.getElementById(option);
		}
		else {
			tab = document.getElementById(option.table);
		}

		if (!tab) {
			return null;
		}

		if (option.start) {
			start = parseInt(option.start);
			if (start <= 0) {
				start = 0;
			}
		}

		var keys = new Array();
		var tr = document.createElement("tr");

		for (var key in tr) {
			var item = keys[key];
			if (!item) {
				keys[key] = 1; //标记这个属性是存在的
			}
		}

		var xml = "";

		xml += "<data ";
		xml += 'id="' + _xmlEscape(tab.id) + '">';

		for (var i = start; i < tab.rows.length; i++) {
			var row = tab.rows[i];
			xml += "\r\n  <row "
			for (var key in row) {
				var item = keys[key];
				if (!item) {
					xml += '' + _xmlEscape(key) + '="' + _xmlEscape(row.getAttribute(key)) + '" ';
				}
			}

			xml += ">\r\n"

			MJQ(row).find("input,select,textarea").each(function () {

				var name = _xmlEscape($(this).attr("name"));
				var value = _xmlEscape($(this).val());
				var text = "";
				if (MJQ(this).is("select")){
					text = MJQ(this).find("option:selected").text();
				}
				xml += "      <" + name + " text=\"" + text + "\" >\r\n";
				xml += "          " + value + "\r\n";
				xml += "      </" + name + ">\r\n";
			});

			xml += "  </row>\r\n";
		}

		xml += "</data>";

		return xml;
	}

})();
