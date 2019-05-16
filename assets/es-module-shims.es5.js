"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/* ES Module Shims 0.2.7 */
(function () {
  'use strict';

  var baseUrl;

  if (typeof location !== 'undefined') {
    baseUrl = location.href.split('#')[0].split('?')[0];
    var lastSepIndex = baseUrl.lastIndexOf('/');
    if (lastSepIndex !== -1) baseUrl = baseUrl.slice(0, lastSepIndex + 1);
  }

  var backslashRegEx = /\\/g;

  function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
    if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/'); // protocol-relative

    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    } // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || relUrl[0] === '/') {
        var parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1); // Disabled, but these cases will give inconsistent results for deep backtracking
        //if (parentUrl[parentProtocol.length] !== '/')
        //  throw new Error('Cannot resolve');
        // read pathname from parent URL
        // pathname taken to be part after leading "/"

        var pathname;

        if (parentUrl[parentProtocol.length + 1] === '/') {
          // resolving to a :// so we need to read out the auth and host
          if (parentProtocol !== 'file:') {
            pathname = parentUrl.slice(parentProtocol.length + 2);
            pathname = pathname.slice(pathname.indexOf('/') + 1);
          } else {
            pathname = parentUrl.slice(8);
          }
        } else {
          // resolving to :/ so pathname is the /... part
          pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
        }

        if (relUrl[0] === '/') return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl; // join together and split for removal of .. and . segments
        // looping the string instead of anything fancy for perf reasons
        // '../../../../../z' resolved to 'x/y' is just 'z'

        var segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;
        var output = [];
        var segmentIndex = -1;

        for (var _i = 0; _i < segmented.length; _i++) {
          // busy reading a segment - only terminate on '/'
          if (segmentIndex !== -1) {
            if (segmented[_i] === '/') {
              output.push(segmented.slice(segmentIndex, _i + 1));
              segmentIndex = -1;
            }
          } // new segment - check if it is relative
          else if (segmented[_i] === '.') {
              // ../ segment
              if (segmented[_i + 1] === '.' && (segmented[_i + 2] === '/' || _i + 2 === segmented.length)) {
                output.pop();
                _i += 2;
              } // ./ segment
              else if (segmented[_i + 1] === '/' || _i + 1 === segmented.length) {
                  _i += 1;
                } else {
                  // the start of a new segment as below
                  segmentIndex = _i;
                }
            } // it is the start of a new segment
            else {
                segmentIndex = _i;
              }
        } // finish reading out the last segment


        if (segmentIndex !== -1) output.push(segmented.slice(segmentIndex));
        return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
      }
  }
  /*
   * Import maps implementation
   * 
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   * 
   */


  function resolveUrl(relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || relUrl.indexOf(':') !== -1 && relUrl || resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
  }

  function resolvePackages(pkgs) {
    var outPkgs = {};

    for (var p in pkgs) {
      var value = pkgs[p]; // TODO package fallback support

      if (typeof value !== 'string') continue;
      outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
    }

    return outPkgs;
  }

  function parseImportMap(json, baseUrl) {
    var imports = resolvePackages(json.imports) || {};
    var scopes = {};

    if (json.scopes) {
      for (var scopeName in json.scopes) {
        var scope = json.scopes[scopeName];
        var resolvedScopeName = resolveUrl(scopeName, baseUrl);
        if (resolvedScopeName[resolvedScopeName.length - 1] !== '/') resolvedScopeName += '/';
        scopes[resolvedScopeName] = resolvePackages(scope) || {};
      }
    }

    return {
      imports: imports,
      scopes: scopes,
      baseUrl: baseUrl
    };
  }

  function getMatch(path, matchObj) {
    if (matchObj[path]) return path;
    var sepIndex = path.length;

    do {
      var segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj) return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);
  }

  function applyPackages(id, packages, baseUrl) {
    var pkgName = getMatch(id, packages);

    if (pkgName) {
      var pkg = packages[pkgName];
      if (pkg === null) if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
      return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
    }
  }

  var protocolre = /^[a-z][a-z0-9.+-]*\:/i;

  function resolveImportMap(id, parentUrl, importMap) {
    var urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);

    if (urlResolved) {
      id = urlResolved;
    } else if (protocolre.test(id)) {
      // non-relative URL with protocol
      return id;
    }

    var scopeName = getMatch(parentUrl, importMap.scopes);

    if (scopeName) {
      var scopePackages = importMap.scopes[scopeName];
      var packageResolution = applyPackages(id, scopePackages, scopeName);
      if (packageResolution) return packageResolution;
    }

    return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
  }

  function throwBare(id, parentUrl) {
    throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
  }

  function analyzeModuleSyntax(_str) {
    str = _str;
    var err = null;

    try {
      baseParse();
    } catch (e) {
      err = e;
    }

    return [oImports, oExports, err];
  } // State:
  // (for perf, works because this runs sync)


  var i, charCode, str, lastTokenIndex, lastOpenTokenIndex, lastTokenIndexStack, dynamicImportStack, braceDepth, templateDepth, templateStack, oImports, oExports;

  function baseParse() {
    lastTokenIndex = lastOpenTokenIndex = -1;
    oImports = [];
    oExports = [];
    braceDepth = 0;
    templateDepth = 0;
    templateStack = [];
    lastTokenIndexStack = [];
    dynamicImportStack = [];
    i = -1;
    /*
     * This is just the simple loop:
     * 
     * while (charCode = str.charCodeAt(++i)) {
     *   // reads into the first non-ws / comment token
     *   commentWhitespace();
     *   // reads one token at a time
     *   parseNext();
     *   // stores the last (non ws/comment) token for division operator backtracking checks
     *   // (including on lastTokenIndexStack as we nest structures)
     *   lastTokenIndex = i;
     * }
     * 
     * Optimized by:
     * - Inlining comment whitespace to avoid repeated "/" checks (minor perf saving)
     * - Inlining the division operator check from "parseNext" into this loop
     * - Having "regularExpression()" start on the initial index (different to other parse functions)
     */

    while (charCode = str.charCodeAt(++i)) {
      // reads into the first non-ws / comment token
      if (isBrOrWs(charCode)) continue;

      if (charCode === 47
      /*/*/
      ) {
          charCode = str.charCodeAt(++i);
          if (charCode === 47
          /*/*/
          ) lineComment();else if (charCode === 42
          /***/
          ) blockComment();else {
            /*
             * Division / regex ambiguity handling
             * based on checking backtrack analysis of:
             * - what token came previously (lastTokenIndex)
             * - what token came before the opening paren or brace (lastOpenTokenIndex)
             *
             * Only known unhandled ambiguities are cases of regexes immediately followed
             * by division, another regex or brace:
             * 
             * /regex/ / x
             * 
             * /regex/
             * {}
             * /regex/
             * 
             * And those cases only show errors when containing "'/` in the regex
             * 
             * Could be fixed tracking stack of last regex, but doesn't seem worth it, and bad for perf
             */
            var lastTokenCode = str.charCodeAt(lastTokenIndex);

            if (!lastTokenCode || isExpressionKeyword(lastTokenIndex) || isExpressionPunctuator(lastTokenCode) || lastTokenCode === 41
            /*)*/
            && isParenKeyword(lastOpenTokenIndex) || lastTokenCode === 125
            /*}*/
            && isExpressionTerminator(lastOpenTokenIndex)) {
              // TODO: perf improvement
              // it may be possible to precompute isParenKeyword and isExpressionTerminator checks
              // when they are added to the token stack, not here
              // this way we only need to store a stack of "regexTokenDepthStack" and "regexTokenDepth"
              // where depth is the combined brace and paren depth count
              // when leaving a brace or paren, this stack would be cleared automatically (if a match)
              // this check then becomes curDepth === regexTokenDepth for the lastTokenCode )|} case
              regularExpression();
            }

            lastTokenIndex = i;
          }
        } else {
        parseNext();
        lastTokenIndex = i;
      }
    }

    if (braceDepth || templateDepth || lastTokenIndexStack.length) syntaxError();
  }

  function parseNext() {
    switch (charCode) {
      case 123
      /*{*/
      :
        // dynamic import followed by { is not a dynamic import (so remove)
        // this is a sneaky way to get around { import () {} } v { import () } block / object ambiguity without a parser (assuming source is valid)
        if (oImports.length && oImports[oImports.length - 1].d === lastTokenIndex) {
          oImports.pop();
        }

        braceDepth++;
      // fallthrough

      case 40
      /*(*/
      :
        lastTokenIndexStack.push(lastTokenIndex);
        return;

      case 125
      /*}*/
      :
        if (braceDepth-- === templateDepth) {
          templateDepth = templateStack.pop();
          templateString();
          return;
        }

        if (braceDepth < templateDepth) syntaxError();
      // fallthrough

      case 41
      /*)*/
      :
        if (!lastTokenIndexStack) syntaxError();
        lastOpenTokenIndex = lastTokenIndexStack.pop();

        if (dynamicImportStack.length && lastOpenTokenIndex == dynamicImportStack[dynamicImportStack.length - 1]) {
          for (var j = 0; j < oImports.length; j++) {
            if (oImports[j].s === lastOpenTokenIndex) {
              oImports[j].d = i;
              break;
            }
          }

          dynamicImportStack.pop();
        }

        return;

      case 39
      /*'*/
      :
        singleQuoteString();
        return;

      case 34
      /*"*/
      :
        doubleQuoteString();
        return;

      case 96
      /*`*/
      :
        templateString();
        return;

      case 105
      /*i*/
      :
        {
          if (readPrecedingKeyword(i + 5) !== 'import') return;
          var start = i;
          charCode = str.charCodeAt(i += 6);
          if (readToWsOrPunctuator(i) !== '' && charCode !== 46
          /*.*/
          && charCode !== 34
          /*"*/
          && charCode !== 39
          /*'*/
          ) return;
          commentWhitespace();

          switch (charCode) {
            // dynamic import
            case 40
            /*(*/
            :
              lastTokenIndexStack.push(start);
              if (str.charCodeAt(lastTokenIndex) === 46
              /*.*/
              ) return; // dynamic import indicated by positive d, which will be set to closing paren index

              dynamicImportStack.push(start);
              oImports.push({
                s: start,
                e: i + 1,
                d: undefined
              });
              return;
            // import.meta

            case 46
            /*.*/
            :
              charCode = str.charCodeAt(++i);
              commentWhitespace(); // import.meta indicated by d === -2

              if (readToWsOrPunctuator(i) === 'meta' && str.charCodeAt(lastTokenIndex) !== 46
              /*.*/
              ) oImports.push({
                  s: start,
                  e: i + 4,
                  d: -2
                });
              return;
          } // import statement (only permitted at base-level)


          if (lastTokenIndexStack.length === 0) {
            readSourceString();
            return;
          }
        }

      case 101
      /*e*/
      :
        {
          if (lastTokenIndexStack.length !== 0 || readPrecedingKeyword(i + 5) !== 'export' || readToWsOrPunctuator(i + 6) !== '') return;
          var name;
          charCode = str.charCodeAt(i += 6);
          commentWhitespace();

          switch (charCode) {
            // export default ...
            case 100
            /*d*/
            :
              oExports.push('default');
              return;
            // export async? function*? name () {

            case 97
            /*a*/
            :
              charCode = str.charCodeAt(i += 5);
              commentWhitespace();
            // fallthrough

            case 102
            /*f*/
            :
              charCode = str.charCodeAt(i += 8);
              commentWhitespace();

              if (charCode === 42
              /***/
              ) {
                  charCode = str.charCodeAt(++i);
                  commentWhitespace();
                }

              oExports.push(readToWsOrPunctuator(i));
              return;

            case 99
            /*c*/
            :
              if (readToWsOrPunctuator(i + 1) === 'lass') {
                charCode = str.charCodeAt(i += 5);
                commentWhitespace();
                oExports.push(readToWsOrPunctuator(i));
                return;
              }

              i += 2;
            // fallthrough
            // export var/let/const name = ...(, name = ...)+

            case 118
            /*v*/
            :
            case 108
            /*l*/
            :
              /*
               * destructured initializations not currently supported (skipped for { or [)
               * also, lexing names after variable equals is skipped (export var p = function () { ... }, q = 5 skips "q")
               */
              do {
                charCode = str.charCodeAt(i += 3);
                commentWhitespace();
                name = readToWsOrPunctuator(i); // stops on [ { destructurings

                if (!name.length) return;
                oExports.push(name);
                charCode = str.charCodeAt(i += name.length);
                commentWhitespace();
              } while (charCode === 44
              /*,*/
              );

              return;
            // export {...}

            case 123
            /*{*/
            :
              charCode = str.charCodeAt(++i);
              commentWhitespace();

              do {
                name = readToWsOrPunctuator(i);
                charCode = str.charCodeAt(i += name.length);
                commentWhitespace(); // as

                if (charCode === 97
                /*a*/
                ) {
                    charCode = str.charCodeAt(i += 2);
                    commentWhitespace();
                    name = readToWsOrPunctuator(i);
                    charCode = str.charCodeAt(i += name.length);
                    commentWhitespace();
                  } // ,


                if (charCode === 44) {
                  charCode = str.charCodeAt(++i);
                  commentWhitespace();
                }

                oExports.push(name);
                if (!charCode) syntaxError();
              } while (charCode !== 125
              /*}*/
              );

            // fallthrough
            // export *

            case 42
            /***/
            :
              charCode = str.charCodeAt(++i);
              commentWhitespace();

              if (charCode === 102 && str.slice(i + 1, i + 4) === 'rom') {
                charCode = str.charCodeAt(i += 4);
                readSourceString();
              }

          }
        }
    }
  }
  /*
   * Helper functions
   */
  // seeks through whitespace, comments and multiline comments


  function commentWhitespace() {
    do {
      if (charCode === 47
      /*/*/
      ) {
          var nextCharCode = str.charCodeAt(i + 1);

          if (nextCharCode === 47
          /*/*/
          ) {
              charCode = nextCharCode;
              i++;
              lineComment();
            } else if (nextCharCode === 42
          /***/
          ) {
              charCode = nextCharCode;
              i++;
              blockComment();
            } else {
            return;
          }
        } else if (!isBrOrWs(charCode)) {
        return;
      }
    } while (charCode = str.charCodeAt(++i));
  }

  function templateString() {
    while (charCode = str.charCodeAt(++i)) {
      if (charCode === 36
      /*$*/
      ) {
          charCode = str.charCodeAt(++i);

          if (charCode === 123
          /*{*/
          ) {
              templateStack.push(templateDepth);
              templateDepth = ++braceDepth;
              return;
            }
        } else if (charCode === 96
      /*`*/
      ) {
          return;
        } else if (charCode === 92
      /*\*/
      ) {
          charCode = str.charCodeAt(++i);
        }
    }

    syntaxError();
  }

  function readSourceString() {
    var start;

    do {
      if (charCode === 39
      /*'*/
      ) {
          start = i + 1;
          singleQuoteString();
          oImports.push({
            s: start,
            e: i,
            d: -1
          });
          return;
        }

      if (charCode === 34
      /*"*/
      ) {
          start = i + 1;
          doubleQuoteString();
          oImports.push({
            s: start,
            e: i,
            d: -1
          });
          return;
        }
    } while (charCode = str.charCodeAt(++i));

    syntaxError();
  }

  function isBr() {
    // (8232 <LS> and 8233 <PS> omitted for now)
    return charCode === 10
    /*\n*/
    || charCode === 13
    /*\r*/
    ;
  }

  function isBrOrWs(charCode) {
    return charCode > 8 && charCode < 14 || charCode === 32 || charCode === 160 || charCode === 65279;
  }

  function blockComment() {
    charCode = str.charCodeAt(++i);

    while (charCode) {
      if (charCode === 42
      /***/
      ) {
          charCode = str.charCodeAt(++i);
          if (charCode === 47
          /*/*/
          ) return;
          continue;
        }

      charCode = str.charCodeAt(++i);
    }
  }

  function lineComment() {
    while (charCode = str.charCodeAt(++i)) {
      if (isBr()) return;
    }
  }

  function singleQuoteString() {
    while (charCode = str.charCodeAt(++i)) {
      if (charCode === 39
      /*'*/
      ) return;
      if (charCode === 92
      /*\*/
      ) i++;else if (isBr()) syntaxError();
    }

    syntaxError();
  }

  function doubleQuoteString() {
    while (charCode = str.charCodeAt(++i)) {
      if (charCode === 34
      /*"*/
      ) return;
      if (charCode === 92
      /*\*/
      ) i++;else if (isBr()) syntaxError();
    }

    syntaxError();
  }

  function regexCharacterClass() {
    while (charCode = str.charCodeAt(++i)) {
      if (charCode === 93
      /*]*/
      ) return;
      if (charCode === 92
      /*\*/
      ) i++;else if (isBr()) syntaxError();
    }

    syntaxError();
  }

  function regularExpression() {
    do {
      if (charCode === 47
      /*/*/
      ) return;
      if (charCode === 91
      /*[*/
      ) regexCharacterClass();else if (charCode === 92
      /*\*/
      ) i++;else if (isBr()) syntaxError();
    } while (charCode = str.charCodeAt(++i));

    syntaxError();
  }

  function readPrecedingKeyword(endIndex) {
    var startIndex = endIndex;
    var nextChar = str.charCodeAt(startIndex);

    while (nextChar && nextChar > 96
    /*a*/
    && nextChar < 123
    /*z*/
    ) {
      nextChar = str.charCodeAt(--startIndex);
    } // must be preceded by punctuator or whitespace


    if (nextChar && !isBrOrWs(nextChar) && !isPunctuator(nextChar) || nextChar === 46
    /*.*/
    ) return '';
    return str.slice(startIndex + 1, endIndex + 1);
  }

  function readToWsOrPunctuator(startIndex) {
    var endIndex = startIndex;
    var nextChar = str.charCodeAt(endIndex);

    while (nextChar && !isBrOrWs(nextChar) && !isPunctuator(nextChar)) {
      nextChar = str.charCodeAt(++endIndex);
    }

    return str.slice(startIndex, endIndex);
  }

  var expressionKeywords = {
    "case": 1,
    "debugger": 1,
    "delete": 1,
    "do": 1,
    "else": 1,
    "in": 1,
    "instanceof": 1,
    "new": 1,
    "return": 1,
    "throw": 1,
    "typeof": 1,
    "void": 1,
    "yield": 1,
    "await": 1
  };

  function isExpressionKeyword(lastTokenIndex) {
    return expressionKeywords[readPrecedingKeyword(lastTokenIndex)];
  }

  function isParenKeyword(lastTokenIndex) {
    var precedingKeyword = readPrecedingKeyword(lastTokenIndex);
    return precedingKeyword === 'while' || precedingKeyword === 'for' || precedingKeyword === 'if';
  }

  function isPunctuator(charCode) {
    // 23 possible punctuator endings: !%&()*+,-./:;<=>?[]^{}|~
    return charCode === 33 || charCode === 37 || charCode === 38 || charCode > 39 && charCode < 48 || charCode > 57 && charCode < 64 || charCode === 91 || charCode === 93 || charCode === 94 || charCode > 122 && charCode < 127;
  }

  function isExpressionPunctuator(charCode) {
    return isPunctuator(charCode) && charCode !== 93
    /*]*/
    && charCode !== 41
    /*)*/
    && charCode !== 125
    /*}*/
    ;
  }

  function isExpressionTerminator(lastTokenIndex) {
    // detects:
    // ; ) -1 finally
    // as all of these followed by a { will indicate a statement brace
    // in future we will need: "catch" (optional catch parameters)
    //                         "do" (do expressions)
    switch (str.charCodeAt(lastTokenIndex)) {
      case 59
      /*;*/
      :
      case 41
      /*)*/
      :
      case NaN:
        return true;

      case 121
      /*y*/
      :
        return readPrecedingKeyword(lastTokenIndex) === 'finally';
    }

    return false;
  }

  function syntaxError() {
    // we just need the stack
    // this isn't shown to users, only for diagnostics
    throw new Error();
  }

  var id = 0;
  var registry = {}; // support browsers without dynamic import support (eg Firefox 6x)

  var dynamicImport;

  try {
    dynamicImport = (0, eval)('u=>import(u)');
  } catch (e) {
    if (typeof document !== 'undefined') {
      self.addEventListener('error', function (e) {
        return importShim.e = e.error;
      });

      dynamicImport = function dynamicImport(blobUrl) {
        var topLevelBlobUrl = createBlob("import*as m from'".concat(blobUrl, "';self.importShim.l=m;self.importShim.e=null"));
        var s = document.createElement('script');
        s.type = 'module';
        s.src = topLevelBlobUrl;
        document.head.appendChild(s);
        return new Promise(function (resolve, reject) {
          s.addEventListener('load', function () {
            document.head.removeChild(s);
            if (importShim.e) return reject(importShim.e);
            resolve(importShim.l);
          });
        });
      };
    }
  }

  function loadAll(_x, _x2) {
    return _loadAll.apply(this, arguments);
  }

  function _loadAll() {
    _loadAll = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5(load, loaded) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(load.b || loaded[load.u])) {
                _context5.next = 2;
                break;
              }

              return _context5.abrupt("return");

            case 2:
              loaded[load.u] = true;
              _context5.next = 5;
              return load.L;

            case 5:
              _context5.next = 7;
              return Promise.all(load.d.map(function (dep) {
                return loadAll(dep, loaded);
              }));

            case 7:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _loadAll.apply(this, arguments);
  }

  function topLevelLoad(_x3, _x4) {
    return _topLevelLoad.apply(this, arguments);
  }

  function _topLevelLoad() {
    _topLevelLoad = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6(url, source) {
      var load, module;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              load = getOrCreateLoad(url, source);
              _context6.next = 3;
              return loadAll(load, {});

            case 3:
              resolveDeps(load, {});
              _context6.next = 6;
              return dynamicImport(load.b);

            case 6:
              module = _context6.sent;

              if (!load.s) {
                _context6.next = 12;
                break;
              }

              _context6.next = 10;
              return dynamicImport(load.s);

            case 10:
              _context6.t0 = module;

              _context6.sent.u$_(_context6.t0);

            case 12:
              return _context6.abrupt("return", module);

            case 13:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));
    return _topLevelLoad.apply(this, arguments);
  }

  function importShim(_x5) {
    return _importShim.apply(this, arguments);
  }

  function _importShim() {
    _importShim = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7(id) {
      var parentUrl,
          _args7 = arguments;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              parentUrl = _args7.length === 1 ? baseUrl : (id = _args7[1], _args7[0]);
              _context7.t0 = topLevelLoad;
              _context7.next = 4;
              return resolve(id, parentUrl);

            case 4:
              _context7.t1 = _context7.sent;
              return _context7.abrupt("return", (0, _context7.t0)(_context7.t1));

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));
    return _importShim.apply(this, arguments);
  }

  self.importShim = importShim;
  var meta = {};
  var wasmModules = {};
  Object.defineProperties(importShim, {
    m: {
      value: meta
    },
    w: {
      value: wasmModules
    },
    l: {
      value: undefined,
      writable: true
    },
    e: {
      value: undefined,
      writable: true
    }
  });

  function resolveDeps(_x6, _x7) {
    return _resolveDeps.apply(this, arguments);
  }

  function _resolveDeps() {
    _resolveDeps = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8(load, seen) {
      var source, resolvedSource, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _depLoad, lastIndex, depIndex, _i3, _load$a$0$_i, start, end, dynamicImportIndex, depLoad, blobUrl;

      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (!load.b) {
                _context8.next = 2;
                break;
              }

              return _context8.abrupt("return");

            case 2:
              seen[load.u] = true;
              source = load.S;
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context8.prev = 7;

              for (_iterator = load.d[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _depLoad = _step.value;
                if (!seen[_depLoad.u]) resolveDeps(_depLoad, seen);
              }

              _context8.next = 15;
              break;

            case 11:
              _context8.prev = 11;
              _context8.t0 = _context8["catch"](7);
              _didIteratorError = true;
              _iteratorError = _context8.t0;

            case 15:
              _context8.prev = 15;
              _context8.prev = 16;

              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }

            case 18:
              _context8.prev = 18;

              if (!_didIteratorError) {
                _context8.next = 21;
                break;
              }

              throw _iteratorError;

            case 21:
              return _context8.finish(18);

            case 22:
              return _context8.finish(15);

            case 23:
              if (load.a[0].length) {
                _context8.next = 27;
                break;
              }

              resolvedSource = source;
              _context8.next = 54;
              break;

            case 27:
              // once all deps have loaded we can inline the dependency resolution blobs
              // and define this blob
              lastIndex = 0;
              resolvedSource = '';
              depIndex = 0;
              _i3 = 0;

            case 31:
              if (!(_i3 < load.a[0].length)) {
                _context8.next = 53;
                break;
              }

              _load$a$0$_i = load.a[0][_i3], start = _load$a$0$_i.s, end = _load$a$0$_i.e, dynamicImportIndex = _load$a$0$_i.d; // dependency source replacements

              if (!(dynamicImportIndex === -1)) {
                _context8.next = 49;
                break;
              }

              depLoad = load.d[depIndex++];
              blobUrl = depLoad.b;

              if (blobUrl) {
                _context8.next = 40;
                break;
              }

              // circular shell creation
              if (!(blobUrl = depLoad.s)) {
                blobUrl = depLoad.s = createBlob("export function u$_(m){".concat(depLoad.a[1].map(function (name) {
                  return name === 'default' ? "$_default=m.default" : "".concat(name, "=m.").concat(name);
                }).join(','), "}").concat(depLoad.a[1].map(function (name) {
                  return name === 'default' ? "let $_default;export{$_default as default}" : "export let ".concat(name);
                }).join(';'), "\n//# sourceURL=").concat(depLoad.r, "?cycle"));
              }

              _context8.next = 45;
              break;

            case 40:
              if (!depLoad.s) {
                _context8.next = 45;
                break;
              }

              resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl + source[end] + ";import*as m$_".concat(depIndex, " from'").concat(depLoad.b, "';import{u$_ as u$_").concat(depIndex, "}from'").concat(depLoad.s, "';u$_").concat(depIndex, "(m$_").concat(depIndex, ")");
              lastIndex = end + 1;
              depLoad.s = undefined;
              return _context8.abrupt("continue", 50);

            case 45:
              resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl;
              lastIndex = end;
              _context8.next = 50;
              break;

            case 49:
              // import.meta
              if (dynamicImportIndex === -2) {
                meta[load.r] = {
                  url: load.r
                };
                resolvedSource += source.slice(lastIndex, start) + 'importShim.m[' + JSON.stringify(load.r) + ']';
                lastIndex = end;
              } // dynamic import
              else {
                  resolvedSource += source.slice(lastIndex, start) + 'importShim' + source.slice(start + 6, end) + JSON.stringify(load.r) + ', ';
                  lastIndex = end;
                }

            case 50:
              _i3++;
              _context8.next = 31;
              break;

            case 53:
              resolvedSource += source.slice(lastIndex);

            case 54:
              load.b = createBlob(resolvedSource + '\n//# sourceURL=' + load.r);
              load.S = undefined;

            case 56:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, null, [[7, 11, 15, 23], [16,, 18, 22]]);
    }));
    return _resolveDeps.apply(this, arguments);
  }

  var createBlob = function createBlob(source) {
    return URL.createObjectURL(new Blob([source], {
      type: 'application/javascript'
    }));
  };

  function getOrCreateLoad(url, source) {
    var load = registry[url];
    if (load) return load;
    load = registry[url] = {
      // url
      u: url,
      // response url
      r: undefined,
      // fetchPromise
      f: undefined,
      // source
      S: undefined,
      // linkPromise
      L: undefined,
      // analysis
      a: undefined,
      // deps
      d: undefined,
      // blobUrl
      b: undefined,
      // shellUrl
      s: undefined
    };
    load.f = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var res, module, deps, aDeps, depStrs, curIndex;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (source) {
                _context.next = 30;
                break;
              }

              _context.next = 3;
              return fetch(url);

            case 3:
              res = _context.sent;

              if (res.ok) {
                _context.next = 6;
                break;
              }

              throw new Error("".concat(res.status, " ").concat(res.statusText, " ").concat(res.url));

            case 6:
              load.r = res.url;

              if (!res.url.endsWith('.wasm')) {
                _context.next = 27;
                break;
              }

              if (!WebAssembly.compileStreaming) {
                _context.next = 12;
                break;
              }

              _context.t0 = WebAssembly.compileStreaming(res);
              _context.next = 17;
              break;

            case 12:
              _context.t1 = WebAssembly;
              _context.next = 15;
              return res.arrayBuffer();

            case 15:
              _context.t2 = _context.sent;
              _context.t0 = _context.t1.compile.call(_context.t1, _context.t2);

            case 17:
              _context.next = 19;
              return _context.t0;

            case 19:
              module = wasmModules[url] = _context.sent;
              deps = WebAssembly.Module.imports ? WebAssembly.Module.imports(module).map(function (impt) {
                return impt.module;
              }) : [];
              aDeps = [];
              load.a = [aDeps, WebAssembly.Module.exports(module).map(function (expt) {
                return expt.name;
              })];
              depStrs = deps.map(function (dep) {
                return JSON.stringify(dep);
              });
              curIndex = 0;
              load.S = depStrs.map(function (depStr, idx) {
                var index = idx.toString();
                var strStart = curIndex + 17 + index.length;
                var strEnd = strStart + depStr.length - 2;
                aDeps.push({
                  s: strStart,
                  e: strEnd,
                  d: -1
                });
                curIndex += strEnd + 3;
                return "import*as m".concat(index, " from").concat(depStr, ";");
              }).join('') + "const module=importShim.w[".concat(JSON.stringify(url), "],exports=new WebAssembly.Instance(module,{") + depStrs.map(function (depStr, idx) {
                return "".concat(depStr, ":m").concat(idx, ",");
              }).join('') + "}).exports;" + load.a[1].map(function (name) {
                return name === 'default' ? "export default exports.".concat(name) : "export const ".concat(name, "=exports.").concat(name);
              }).join(';');
              return _context.abrupt("return", deps);

            case 27:
              _context.next = 29;
              return res.text();

            case 29:
              source = _context.sent;

            case 30:
              load.a = analyzeModuleSyntax(source);
              if (load.a[2]) importShim.err = [source, load.a[2]];
              load.S = source;
              return _context.abrupt("return", load.a[0].filter(function (d) {
                return d.d === -1;
              }).map(function (d) {
                return source.slice(d.s, d.e);
              }));

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
    load.L = load.f.then(
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(deps) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return Promise.all(deps.map(
                /*#__PURE__*/
                function () {
                  var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2(depId) {
                    var depLoad;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.t0 = getOrCreateLoad;
                            _context2.next = 3;
                            return resolve(depId, load.r);

                          case 3:
                            _context2.t1 = _context2.sent;
                            depLoad = (0, _context2.t0)(_context2.t1);
                            _context2.next = 7;
                            return depLoad.f;

                          case 7:
                            return _context2.abrupt("return", depLoad);

                          case 8:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x9) {
                    return _ref3.apply(this, arguments);
                  };
                }()));

              case 2:
                load.d = _context3.sent;

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x8) {
        return _ref2.apply(this, arguments);
      };
    }());
    return load;
  }

  var importMap, importMapPromise;

  if (typeof document !== 'undefined') {
    var scripts = document.getElementsByTagName('script');

    var _loop = function _loop(_i2) {
      var script = scripts[_i2];

      if (script.type === 'importmap-shim' && !importMapPromise) {
        if (script.src) {
          importMapPromise = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.t0 = parseImportMap;
                    _context4.next = 3;
                    return fetch(script.src);

                  case 3:
                    _context4.next = 5;
                    return _context4.sent.json();

                  case 5:
                    _context4.t1 = _context4.sent;
                    _context4.t2 = script.src.slice(0, script.src.lastIndexOf('/') + 1);
                    importMap = (0, _context4.t0)(_context4.t1, _context4.t2);

                  case 8:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }))();
        } else {
          importMap = parseImportMap(JSON.parse(script.innerHTML), baseUrl);
        }
      } // this works here because there is a .then before resolve
      else if (script.type === 'module-shim') {
          if (script.src) topLevelLoad(script.src);else topLevelLoad("".concat(baseUrl, "?").concat(id++), script.innerHTML);
        }
    };

    for (var _i2 = 0; _i2 < scripts.length; _i2++) {
      _loop(_i2);
    }
  }

  importMap = importMap || {
    imports: {},
    scopes: {}
  };

  function resolve(_x10, _x11) {
    return _resolve.apply(this, arguments);
  }

  function _resolve() {
    _resolve = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9(id, parentUrl) {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              parentUrl = parentUrl || baseUrl;

              if (!importMapPromise) {
                _context9.next = 3;
                break;
              }

              return _context9.abrupt("return", importMapPromise.then(function () {
                return resolveImportMap(id, parentUrl, importMap);
              }));

            case 3:
              return _context9.abrupt("return", resolveImportMap(id, parentUrl, importMap));

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));
    return _resolve.apply(this, arguments);
  }
})();
