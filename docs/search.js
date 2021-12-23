window.pdocSearch = (function () {
  /** elasticlunr - http://weixsong.github.io * Copyright (C) 2017 Oliver Nightingale * Copyright (C) 2017 Wei Song * MIT Licensed */ !(function () {
    function e(e) {
      if (null === e || "object" != typeof e) return e;
      var t = e.constructor();
      for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
      return t;
    }
    var t = function (e) {
      var n = new t.Index();
      return (
        n.pipeline.add(t.trimmer, t.stopWordFilter, t.stemmer),
        e && e.call(n, n),
        n
      );
    };
    (t.version = "0.9.5"),
      (lunr = t),
      (t.utils = {}),
      (t.utils.warn = (function (e) {
        return function (t) {
          e.console && console.warn && console.warn(t);
        };
      })(this)),
      (t.utils.toString = function (e) {
        return void 0 === e || null === e ? "" : e.toString();
      }),
      (t.EventEmitter = function () {
        this.events = {};
      }),
      (t.EventEmitter.prototype.addListener = function () {
        var e = Array.prototype.slice.call(arguments),
          t = e.pop(),
          n = e;
        if ("function" != typeof t)
          throw new TypeError("last argument must be a function");
        n.forEach(function (e) {
          this.hasHandler(e) || (this.events[e] = []), this.events[e].push(t);
        }, this);
      }),
      (t.EventEmitter.prototype.removeListener = function (e, t) {
        if (this.hasHandler(e)) {
          var n = this.events[e].indexOf(t);
          -1 !== n &&
            (this.events[e].splice(n, 1),
            0 == this.events[e].length && delete this.events[e]);
        }
      }),
      (t.EventEmitter.prototype.emit = function (e) {
        if (this.hasHandler(e)) {
          var t = Array.prototype.slice.call(arguments, 1);
          this.events[e].forEach(function (e) {
            e.apply(void 0, t);
          }, this);
        }
      }),
      (t.EventEmitter.prototype.hasHandler = function (e) {
        return e in this.events;
      }),
      (t.tokenizer = function (e) {
        if (!arguments.length || null === e || void 0 === e) return [];
        if (Array.isArray(e)) {
          var n = e.filter(function (e) {
            return null === e || void 0 === e ? !1 : !0;
          });
          n = n.map(function (e) {
            return t.utils.toString(e).toLowerCase();
          });
          var i = [];
          return (
            n.forEach(function (e) {
              var n = e.split(t.tokenizer.seperator);
              i = i.concat(n);
            }, this),
            i
          );
        }
        return e.toString().trim().toLowerCase().split(t.tokenizer.seperator);
      }),
      (t.tokenizer.defaultSeperator = /[\s\-]+/),
      (t.tokenizer.seperator = t.tokenizer.defaultSeperator),
      (t.tokenizer.setSeperator = function (e) {
        null !== e &&
          void 0 !== e &&
          "object" == typeof e &&
          (t.tokenizer.seperator = e);
      }),
      (t.tokenizer.resetSeperator = function () {
        t.tokenizer.seperator = t.tokenizer.defaultSeperator;
      }),
      (t.tokenizer.getSeperator = function () {
        return t.tokenizer.seperator;
      }),
      (t.Pipeline = function () {
        this._queue = [];
      }),
      (t.Pipeline.registeredFunctions = {}),
      (t.Pipeline.registerFunction = function (e, n) {
        n in t.Pipeline.registeredFunctions &&
          t.utils.warn("Overwriting existing registered function: " + n),
          (e.label = n),
          (t.Pipeline.registeredFunctions[n] = e);
      }),
      (t.Pipeline.getRegisteredFunction = function (e) {
        return e in t.Pipeline.registeredFunctions != !0
          ? null
          : t.Pipeline.registeredFunctions[e];
      }),
      (t.Pipeline.warnIfFunctionNotRegistered = function (e) {
        var n = e.label && e.label in this.registeredFunctions;
        n ||
          t.utils.warn(
            "Function is not registered with pipeline. This may cause problems when serialising the index.\n",
            e
          );
      }),
      (t.Pipeline.load = function (e) {
        var n = new t.Pipeline();
        return (
          e.forEach(function (e) {
            var i = t.Pipeline.getRegisteredFunction(e);
            if (!i) throw new Error("Cannot load un-registered function: " + e);
            n.add(i);
          }),
          n
        );
      }),
      (t.Pipeline.prototype.add = function () {
        var e = Array.prototype.slice.call(arguments);
        e.forEach(function (e) {
          t.Pipeline.warnIfFunctionNotRegistered(e), this._queue.push(e);
        }, this);
      }),
      (t.Pipeline.prototype.after = function (e, n) {
        t.Pipeline.warnIfFunctionNotRegistered(n);
        var i = this._queue.indexOf(e);
        if (-1 === i) throw new Error("Cannot find existingFn");
        this._queue.splice(i + 1, 0, n);
      }),
      (t.Pipeline.prototype.before = function (e, n) {
        t.Pipeline.warnIfFunctionNotRegistered(n);
        var i = this._queue.indexOf(e);
        if (-1 === i) throw new Error("Cannot find existingFn");
        this._queue.splice(i, 0, n);
      }),
      (t.Pipeline.prototype.remove = function (e) {
        var t = this._queue.indexOf(e);
        -1 !== t && this._queue.splice(t, 1);
      }),
      (t.Pipeline.prototype.run = function (e) {
        for (
          var t = [], n = e.length, i = this._queue.length, o = 0;
          n > o;
          o++
        ) {
          for (
            var r = e[o], s = 0;
            i > s &&
            ((r = this._queue[s](r, o, e)), void 0 !== r && null !== r);
            s++
          );
          void 0 !== r && null !== r && t.push(r);
        }
        return t;
      }),
      (t.Pipeline.prototype.reset = function () {
        this._queue = [];
      }),
      (t.Pipeline.prototype.get = function () {
        return this._queue;
      }),
      (t.Pipeline.prototype.toJSON = function () {
        return this._queue.map(function (e) {
          return t.Pipeline.warnIfFunctionNotRegistered(e), e.label;
        });
      }),
      (t.Index = function () {
        (this._fields = []),
          (this._ref = "id"),
          (this.pipeline = new t.Pipeline()),
          (this.documentStore = new t.DocumentStore()),
          (this.index = {}),
          (this.eventEmitter = new t.EventEmitter()),
          (this._idfCache = {}),
          this.on(
            "add",
            "remove",
            "update",
            function () {
              this._idfCache = {};
            }.bind(this)
          );
      }),
      (t.Index.prototype.on = function () {
        var e = Array.prototype.slice.call(arguments);
        return this.eventEmitter.addListener.apply(this.eventEmitter, e);
      }),
      (t.Index.prototype.off = function (e, t) {
        return this.eventEmitter.removeListener(e, t);
      }),
      (t.Index.load = function (e) {
        e.version !== t.version &&
          t.utils.warn(
            "version mismatch: current " + t.version + " importing " + e.version
          );
        var n = new this();
        (n._fields = e.fields),
          (n._ref = e.ref),
          (n.documentStore = t.DocumentStore.load(e.documentStore)),
          (n.pipeline = t.Pipeline.load(e.pipeline)),
          (n.index = {});
        for (var i in e.index) n.index[i] = t.InvertedIndex.load(e.index[i]);
        return n;
      }),
      (t.Index.prototype.addField = function (e) {
        return (
          this._fields.push(e), (this.index[e] = new t.InvertedIndex()), this
        );
      }),
      (t.Index.prototype.setRef = function (e) {
        return (this._ref = e), this;
      }),
      (t.Index.prototype.saveDocument = function (e) {
        return (this.documentStore = new t.DocumentStore(e)), this;
      }),
      (t.Index.prototype.addDoc = function (e, n) {
        if (e) {
          var n = void 0 === n ? !0 : n,
            i = e[this._ref];
          this.documentStore.addDoc(i, e),
            this._fields.forEach(function (n) {
              var o = this.pipeline.run(t.tokenizer(e[n]));
              this.documentStore.addFieldLength(i, n, o.length);
              var r = {};
              o.forEach(function (e) {
                e in r ? (r[e] += 1) : (r[e] = 1);
              }, this);
              for (var s in r) {
                var u = r[s];
                (u = Math.sqrt(u)),
                  this.index[n].addToken(s, { ref: i, tf: u });
              }
            }, this),
            n && this.eventEmitter.emit("add", e, this);
        }
      }),
      (t.Index.prototype.removeDocByRef = function (e) {
        if (
          e &&
          this.documentStore.isDocStored() !== !1 &&
          this.documentStore.hasDoc(e)
        ) {
          var t = this.documentStore.getDoc(e);
          this.removeDoc(t, !1);
        }
      }),
      (t.Index.prototype.removeDoc = function (e, n) {
        if (e) {
          var n = void 0 === n ? !0 : n,
            i = e[this._ref];
          this.documentStore.hasDoc(i) &&
            (this.documentStore.removeDoc(i),
            this._fields.forEach(function (n) {
              var o = this.pipeline.run(t.tokenizer(e[n]));
              o.forEach(function (e) {
                this.index[n].removeToken(e, i);
              }, this);
            }, this),
            n && this.eventEmitter.emit("remove", e, this));
        }
      }),
      (t.Index.prototype.updateDoc = function (e, t) {
        var t = void 0 === t ? !0 : t;
        this.removeDocByRef(e[this._ref], !1),
          this.addDoc(e, !1),
          t && this.eventEmitter.emit("update", e, this);
      }),
      (t.Index.prototype.idf = function (e, t) {
        var n = "@" + t + "/" + e;
        if (Object.prototype.hasOwnProperty.call(this._idfCache, n))
          return this._idfCache[n];
        var i = this.index[t].getDocFreq(e),
          o = 1 + Math.log(this.documentStore.length / (i + 1));
        return (this._idfCache[n] = o), o;
      }),
      (t.Index.prototype.getFields = function () {
        return this._fields.slice();
      }),
      (t.Index.prototype.search = function (e, n) {
        if (!e) return [];
        e = "string" == typeof e ? { any: e } : JSON.parse(JSON.stringify(e));
        var i = null;
        null != n && (i = JSON.stringify(n));
        for (
          var o = new t.Configuration(i, this.getFields()).get(),
            r = {},
            s = Object.keys(e),
            u = 0;
          u < s.length;
          u++
        ) {
          var a = s[u];
          r[a] = this.pipeline.run(t.tokenizer(e[a]));
        }
        var l = {};
        for (var c in o) {
          var d = r[c] || r.any;
          if (d) {
            var f = this.fieldSearch(d, c, o),
              h = o[c].boost;
            for (var p in f) f[p] = f[p] * h;
            for (var p in f) p in l ? (l[p] += f[p]) : (l[p] = f[p]);
          }
        }
        var v,
          g = [];
        for (var p in l)
          (v = { ref: p, score: l[p] }),
            this.documentStore.hasDoc(p) &&
              (v.doc = this.documentStore.getDoc(p)),
            g.push(v);
        return (
          g.sort(function (e, t) {
            return t.score - e.score;
          }),
          g
        );
      }),
      (t.Index.prototype.fieldSearch = function (e, t, n) {
        var i = n[t].bool,
          o = n[t].expand,
          r = n[t].boost,
          s = null,
          u = {};
        return 0 !== r
          ? (e.forEach(function (e) {
              var n = [e];
              1 == o && (n = this.index[t].expandToken(e));
              var r = {};
              n.forEach(function (n) {
                var o = this.index[t].getDocs(n),
                  a = this.idf(n, t);
                if (s && "AND" == i) {
                  var l = {};
                  for (var c in s) c in o && (l[c] = o[c]);
                  o = l;
                }
                n == e && this.fieldSearchStats(u, n, o);
                for (var c in o) {
                  var d = this.index[t].getTermFrequency(n, c),
                    f = this.documentStore.getFieldLength(c, t),
                    h = 1;
                  0 != f && (h = 1 / Math.sqrt(f));
                  var p = 1;
                  n != e && (p = 0.15 * (1 - (n.length - e.length) / n.length));
                  var v = d * a * h * p;
                  c in r ? (r[c] += v) : (r[c] = v);
                }
              }, this),
                (s = this.mergeScores(s, r, i));
            }, this),
            (s = this.coordNorm(s, u, e.length)))
          : void 0;
      }),
      (t.Index.prototype.mergeScores = function (e, t, n) {
        if (!e) return t;
        if ("AND" == n) {
          var i = {};
          for (var o in t) o in e && (i[o] = e[o] + t[o]);
          return i;
        }
        for (var o in t) o in e ? (e[o] += t[o]) : (e[o] = t[o]);
        return e;
      }),
      (t.Index.prototype.fieldSearchStats = function (e, t, n) {
        for (var i in n) i in e ? e[i].push(t) : (e[i] = [t]);
      }),
      (t.Index.prototype.coordNorm = function (e, t, n) {
        for (var i in e)
          if (i in t) {
            var o = t[i].length;
            e[i] = (e[i] * o) / n;
          }
        return e;
      }),
      (t.Index.prototype.toJSON = function () {
        var e = {};
        return (
          this._fields.forEach(function (t) {
            e[t] = this.index[t].toJSON();
          }, this),
          {
            version: t.version,
            fields: this._fields,
            ref: this._ref,
            documentStore: this.documentStore.toJSON(),
            index: e,
            pipeline: this.pipeline.toJSON(),
          }
        );
      }),
      (t.Index.prototype.use = function (e) {
        var t = Array.prototype.slice.call(arguments, 1);
        t.unshift(this), e.apply(this, t);
      }),
      (t.DocumentStore = function (e) {
        (this._save = null === e || void 0 === e ? !0 : e),
          (this.docs = {}),
          (this.docInfo = {}),
          (this.length = 0);
      }),
      (t.DocumentStore.load = function (e) {
        var t = new this();
        return (
          (t.length = e.length),
          (t.docs = e.docs),
          (t.docInfo = e.docInfo),
          (t._save = e.save),
          t
        );
      }),
      (t.DocumentStore.prototype.isDocStored = function () {
        return this._save;
      }),
      (t.DocumentStore.prototype.addDoc = function (t, n) {
        this.hasDoc(t) || this.length++,
          (this.docs[t] = this._save === !0 ? e(n) : null);
      }),
      (t.DocumentStore.prototype.getDoc = function (e) {
        return this.hasDoc(e) === !1 ? null : this.docs[e];
      }),
      (t.DocumentStore.prototype.hasDoc = function (e) {
        return e in this.docs;
      }),
      (t.DocumentStore.prototype.removeDoc = function (e) {
        this.hasDoc(e) &&
          (delete this.docs[e], delete this.docInfo[e], this.length--);
      }),
      (t.DocumentStore.prototype.addFieldLength = function (e, t, n) {
        null !== e &&
          void 0 !== e &&
          0 != this.hasDoc(e) &&
          (this.docInfo[e] || (this.docInfo[e] = {}), (this.docInfo[e][t] = n));
      }),
      (t.DocumentStore.prototype.updateFieldLength = function (e, t, n) {
        null !== e &&
          void 0 !== e &&
          0 != this.hasDoc(e) &&
          this.addFieldLength(e, t, n);
      }),
      (t.DocumentStore.prototype.getFieldLength = function (e, t) {
        return null === e || void 0 === e
          ? 0
          : e in this.docs && t in this.docInfo[e]
          ? this.docInfo[e][t]
          : 0;
      }),
      (t.DocumentStore.prototype.toJSON = function () {
        return {
          docs: this.docs,
          docInfo: this.docInfo,
          length: this.length,
          save: this._save,
        };
      }),
      (t.stemmer = (function () {
        var e = {
            ational: "ate",
            tional: "tion",
            enci: "ence",
            anci: "ance",
            izer: "ize",
            bli: "ble",
            alli: "al",
            entli: "ent",
            eli: "e",
            ousli: "ous",
            ization: "ize",
            ation: "ate",
            ator: "ate",
            alism: "al",
            iveness: "ive",
            fulness: "ful",
            ousness: "ous",
            aliti: "al",
            iviti: "ive",
            biliti: "ble",
            logi: "log",
          },
          t = {
            icate: "ic",
            ative: "",
            alize: "al",
            iciti: "ic",
            ical: "ic",
            ful: "",
            ness: "",
          },
          n = "[^aeiou]",
          i = "[aeiouy]",
          o = n + "[^aeiouy]*",
          r = i + "[aeiou]*",
          s = "^(" + o + ")?" + r + o,
          u = "^(" + o + ")?" + r + o + "(" + r + ")?$",
          a = "^(" + o + ")?" + r + o + r + o,
          l = "^(" + o + ")?" + i,
          c = new RegExp(s),
          d = new RegExp(a),
          f = new RegExp(u),
          h = new RegExp(l),
          p = /^(.+?)(ss|i)es$/,
          v = /^(.+?)([^s])s$/,
          g = /^(.+?)eed$/,
          m = /^(.+?)(ed|ing)$/,
          y = /.$/,
          S = /(at|bl|iz)$/,
          x = new RegExp("([^aeiouylsz])\\1$"),
          w = new RegExp("^" + o + i + "[^aeiouwxy]$"),
          I = /^(.+?[^aeiou])y$/,
          b =
            /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,
          E = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,
          D =
            /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
          F = /^(.+?)(s|t)(ion)$/,
          _ = /^(.+?)e$/,
          P = /ll$/,
          k = new RegExp("^" + o + i + "[^aeiouwxy]$"),
          z = function (n) {
            var i, o, r, s, u, a, l;
            if (n.length < 3) return n;
            if (
              ((r = n.substr(0, 1)),
              "y" == r && (n = r.toUpperCase() + n.substr(1)),
              (s = p),
              (u = v),
              s.test(n)
                ? (n = n.replace(s, "$1$2"))
                : u.test(n) && (n = n.replace(u, "$1$2")),
              (s = g),
              (u = m),
              s.test(n))
            ) {
              var z = s.exec(n);
              (s = c), s.test(z[1]) && ((s = y), (n = n.replace(s, "")));
            } else if (u.test(n)) {
              var z = u.exec(n);
              (i = z[1]),
                (u = h),
                u.test(i) &&
                  ((n = i),
                  (u = S),
                  (a = x),
                  (l = w),
                  u.test(n)
                    ? (n += "e")
                    : a.test(n)
                    ? ((s = y), (n = n.replace(s, "")))
                    : l.test(n) && (n += "e"));
            }
            if (((s = I), s.test(n))) {
              var z = s.exec(n);
              (i = z[1]), (n = i + "i");
            }
            if (((s = b), s.test(n))) {
              var z = s.exec(n);
              (i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + e[o]);
            }
            if (((s = E), s.test(n))) {
              var z = s.exec(n);
              (i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + t[o]);
            }
            if (((s = D), (u = F), s.test(n))) {
              var z = s.exec(n);
              (i = z[1]), (s = d), s.test(i) && (n = i);
            } else if (u.test(n)) {
              var z = u.exec(n);
              (i = z[1] + z[2]), (u = d), u.test(i) && (n = i);
            }
            if (((s = _), s.test(n))) {
              var z = s.exec(n);
              (i = z[1]),
                (s = d),
                (u = f),
                (a = k),
                (s.test(i) || (u.test(i) && !a.test(i))) && (n = i);
            }
            return (
              (s = P),
              (u = d),
              s.test(n) && u.test(n) && ((s = y), (n = n.replace(s, ""))),
              "y" == r && (n = r.toLowerCase() + n.substr(1)),
              n
            );
          };
        return z;
      })()),
      t.Pipeline.registerFunction(t.stemmer, "stemmer"),
      (t.stopWordFilter = function (e) {
        return e && t.stopWordFilter.stopWords[e] !== !0 ? e : void 0;
      }),
      (t.clearStopWords = function () {
        t.stopWordFilter.stopWords = {};
      }),
      (t.addStopWords = function (e) {
        null != e &&
          Array.isArray(e) !== !1 &&
          e.forEach(function (e) {
            t.stopWordFilter.stopWords[e] = !0;
          }, this);
      }),
      (t.resetStopWords = function () {
        t.stopWordFilter.stopWords = t.defaultStopWords;
      }),
      (t.defaultStopWords = {
        "": !0,
        a: !0,
        able: !0,
        about: !0,
        across: !0,
        after: !0,
        all: !0,
        almost: !0,
        also: !0,
        am: !0,
        among: !0,
        an: !0,
        and: !0,
        any: !0,
        are: !0,
        as: !0,
        at: !0,
        be: !0,
        because: !0,
        been: !0,
        but: !0,
        by: !0,
        can: !0,
        cannot: !0,
        could: !0,
        dear: !0,
        did: !0,
        do: !0,
        does: !0,
        either: !0,
        else: !0,
        ever: !0,
        every: !0,
        for: !0,
        from: !0,
        get: !0,
        got: !0,
        had: !0,
        has: !0,
        have: !0,
        he: !0,
        her: !0,
        hers: !0,
        him: !0,
        his: !0,
        how: !0,
        however: !0,
        i: !0,
        if: !0,
        in: !0,
        into: !0,
        is: !0,
        it: !0,
        its: !0,
        just: !0,
        least: !0,
        let: !0,
        like: !0,
        likely: !0,
        may: !0,
        me: !0,
        might: !0,
        most: !0,
        must: !0,
        my: !0,
        neither: !0,
        no: !0,
        nor: !0,
        not: !0,
        of: !0,
        off: !0,
        often: !0,
        on: !0,
        only: !0,
        or: !0,
        other: !0,
        our: !0,
        own: !0,
        rather: !0,
        said: !0,
        say: !0,
        says: !0,
        she: !0,
        should: !0,
        since: !0,
        so: !0,
        some: !0,
        than: !0,
        that: !0,
        the: !0,
        their: !0,
        them: !0,
        then: !0,
        there: !0,
        these: !0,
        they: !0,
        this: !0,
        tis: !0,
        to: !0,
        too: !0,
        twas: !0,
        us: !0,
        wants: !0,
        was: !0,
        we: !0,
        were: !0,
        what: !0,
        when: !0,
        where: !0,
        which: !0,
        while: !0,
        who: !0,
        whom: !0,
        why: !0,
        will: !0,
        with: !0,
        would: !0,
        yet: !0,
        you: !0,
        your: !0,
      }),
      (t.stopWordFilter.stopWords = t.defaultStopWords),
      t.Pipeline.registerFunction(t.stopWordFilter, "stopWordFilter"),
      (t.trimmer = function (e) {
        if (null === e || void 0 === e)
          throw new Error("token should not be undefined");
        return e.replace(/^\W+/, "").replace(/\W+$/, "");
      }),
      t.Pipeline.registerFunction(t.trimmer, "trimmer"),
      (t.InvertedIndex = function () {
        this.root = { docs: {}, df: 0 };
      }),
      (t.InvertedIndex.load = function (e) {
        var t = new this();
        return (t.root = e.root), t;
      }),
      (t.InvertedIndex.prototype.addToken = function (e, t, n) {
        for (var n = n || this.root, i = 0; i <= e.length - 1; ) {
          var o = e[i];
          o in n || (n[o] = { docs: {}, df: 0 }), (i += 1), (n = n[o]);
        }
        var r = t.ref;
        n.docs[r]
          ? (n.docs[r] = { tf: t.tf })
          : ((n.docs[r] = { tf: t.tf }), (n.df += 1));
      }),
      (t.InvertedIndex.prototype.hasToken = function (e) {
        if (!e) return !1;
        for (var t = this.root, n = 0; n < e.length; n++) {
          if (!t[e[n]]) return !1;
          t = t[e[n]];
        }
        return !0;
      }),
      (t.InvertedIndex.prototype.getNode = function (e) {
        if (!e) return null;
        for (var t = this.root, n = 0; n < e.length; n++) {
          if (!t[e[n]]) return null;
          t = t[e[n]];
        }
        return t;
      }),
      (t.InvertedIndex.prototype.getDocs = function (e) {
        var t = this.getNode(e);
        return null == t ? {} : t.docs;
      }),
      (t.InvertedIndex.prototype.getTermFrequency = function (e, t) {
        var n = this.getNode(e);
        return null == n ? 0 : t in n.docs ? n.docs[t].tf : 0;
      }),
      (t.InvertedIndex.prototype.getDocFreq = function (e) {
        var t = this.getNode(e);
        return null == t ? 0 : t.df;
      }),
      (t.InvertedIndex.prototype.removeToken = function (e, t) {
        if (e) {
          var n = this.getNode(e);
          null != n && t in n.docs && (delete n.docs[t], (n.df -= 1));
        }
      }),
      (t.InvertedIndex.prototype.expandToken = function (e, t, n) {
        if (null == e || "" == e) return [];
        var t = t || [];
        if (void 0 == n && ((n = this.getNode(e)), null == n)) return t;
        n.df > 0 && t.push(e);
        for (var i in n)
          "docs" !== i && "df" !== i && this.expandToken(e + i, t, n[i]);
        return t;
      }),
      (t.InvertedIndex.prototype.toJSON = function () {
        return { root: this.root };
      }),
      (t.Configuration = function (e, n) {
        var e = e || "";
        if (void 0 == n || null == n)
          throw new Error("fields should not be null");
        this.config = {};
        var i;
        try {
          (i = JSON.parse(e)), this.buildUserConfig(i, n);
        } catch (o) {
          t.utils.warn(
            "user configuration parse failed, will use default configuration"
          ),
            this.buildDefaultConfig(n);
        }
      }),
      (t.Configuration.prototype.buildDefaultConfig = function (e) {
        this.reset(),
          e.forEach(function (e) {
            this.config[e] = { boost: 1, bool: "OR", expand: !1 };
          }, this);
      }),
      (t.Configuration.prototype.buildUserConfig = function (e, n) {
        var i = "OR",
          o = !1;
        if (
          (this.reset(),
          "bool" in e && (i = e.bool || i),
          "expand" in e && (o = e.expand || o),
          "fields" in e)
        )
          for (var r in e.fields)
            if (n.indexOf(r) > -1) {
              var s = e.fields[r],
                u = o;
              void 0 != s.expand && (u = s.expand),
                (this.config[r] = {
                  boost: s.boost || 0 === s.boost ? s.boost : 1,
                  bool: s.bool || i,
                  expand: u,
                });
            } else
              t.utils.warn(
                "field name in user configuration not found in index instance fields"
              );
        else this.addAllFields2UserConfig(i, o, n);
      }),
      (t.Configuration.prototype.addAllFields2UserConfig = function (e, t, n) {
        n.forEach(function (n) {
          this.config[n] = { boost: 1, bool: e, expand: t };
        }, this);
      }),
      (t.Configuration.prototype.get = function () {
        return this.config;
      }),
      (t.Configuration.prototype.reset = function () {
        this.config = {};
      }),
      (lunr.SortedSet = function () {
        (this.length = 0), (this.elements = []);
      }),
      (lunr.SortedSet.load = function (e) {
        var t = new this();
        return (t.elements = e), (t.length = e.length), t;
      }),
      (lunr.SortedSet.prototype.add = function () {
        var e, t;
        for (e = 0; e < arguments.length; e++)
          (t = arguments[e]),
            ~this.indexOf(t) || this.elements.splice(this.locationFor(t), 0, t);
        this.length = this.elements.length;
      }),
      (lunr.SortedSet.prototype.toArray = function () {
        return this.elements.slice();
      }),
      (lunr.SortedSet.prototype.map = function (e, t) {
        return this.elements.map(e, t);
      }),
      (lunr.SortedSet.prototype.forEach = function (e, t) {
        return this.elements.forEach(e, t);
      }),
      (lunr.SortedSet.prototype.indexOf = function (e) {
        for (
          var t = 0,
            n = this.elements.length,
            i = n - t,
            o = t + Math.floor(i / 2),
            r = this.elements[o];
          i > 1;

        ) {
          if (r === e) return o;
          e > r && (t = o),
            r > e && (n = o),
            (i = n - t),
            (o = t + Math.floor(i / 2)),
            (r = this.elements[o]);
        }
        return r === e ? o : -1;
      }),
      (lunr.SortedSet.prototype.locationFor = function (e) {
        for (
          var t = 0,
            n = this.elements.length,
            i = n - t,
            o = t + Math.floor(i / 2),
            r = this.elements[o];
          i > 1;

        )
          e > r && (t = o),
            r > e && (n = o),
            (i = n - t),
            (o = t + Math.floor(i / 2)),
            (r = this.elements[o]);
        return r > e ? o : e > r ? o + 1 : void 0;
      }),
      (lunr.SortedSet.prototype.intersect = function (e) {
        for (
          var t = new lunr.SortedSet(),
            n = 0,
            i = 0,
            o = this.length,
            r = e.length,
            s = this.elements,
            u = e.elements;
          ;

        ) {
          if (n > o - 1 || i > r - 1) break;
          s[n] !== u[i]
            ? s[n] < u[i]
              ? n++
              : s[n] > u[i] && i++
            : (t.add(s[n]), n++, i++);
        }
        return t;
      }),
      (lunr.SortedSet.prototype.clone = function () {
        var e = new lunr.SortedSet();
        return (e.elements = this.toArray()), (e.length = e.elements.length), e;
      }),
      (lunr.SortedSet.prototype.union = function (e) {
        var t, n, i;
        this.length >= e.length ? ((t = this), (n = e)) : ((t = e), (n = this)),
          (i = t.clone());
        for (var o = 0, r = n.toArray(); o < r.length; o++) i.add(r[o]);
        return i;
      }),
      (lunr.SortedSet.prototype.toJSON = function () {
        return this.toArray();
      }),
      (function (e, t) {
        "function" == typeof define && define.amd
          ? define(t)
          : "object" == typeof exports
          ? (module.exports = t())
          : (e.elasticlunr = t());
      })(this, function () {
        return t;
      });
  })();
  /** pdoc search index */ const docs = {
    version: "0.9.5",
    fields: ["qualname", "fullname", "doc"],
    ref: "fullname",
    documentStore: {
      docs: {
        projet: {
          fullname: "projet",
          modulename: "projet",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.load_user": {
          fullname: "projet.load_user",
          modulename: "projet",
          qualname: "load_user",
          type: "function",
          doc: '<p>Used by the login manager to load a user from the database by their ID.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>user_id (int):</strong>  the User id</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>User: The user with the given id</p>\n</blockquote>\n',
          parameters: ["user_id"],
          funcdef: "def",
        },
        "projet.ai": {
          fullname: "projet.ai",
          modulename: "projet.ai",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.ai.update_game_finished": {
          fullname: "projet.ai.update_game_finished",
          modulename: "projet.ai",
          qualname: "update_game_finished",
          type: "function",
          doc: '<p>Update the QTable when the game is finished\nIt\'s the same mechanism than the update in game\nbut force the last state to be be updated.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_state (Game):</strong>  the game state</li>\n</ul>\n',
          parameters: ["game_state", "player"],
          funcdef: "def",
        },
        "projet.ai.random_action": {
          fullname: "projet.ai.random_action",
          modulename: "projet.ai",
          qualname: "random_action",
          type: "function",
          doc: "<p>Choose a valid random action.</p>\n\n<h6 id=\"args\">Args</h6>\n\n<ul>\n<li><strong>board (list[list[int]]):</strong>  the board</li>\n<li><strong>pos_player (tuple[int, int]):</strong>  the player position</li>\n<li><strong>player (int, optional):</strong>  the player number. Defaults to 2.</li>\n</ul>\n\n<h6 id=\"returns\">Returns</h6>\n\n<blockquote>\n  <p>str: a direction between ['u', 'd', 'l', 'r']</p>\n</blockquote>\n",
          parameters: ["board", "pos_cur_player", "player"],
          funcdef: "def",
        },
        "projet.ai.update_quality": {
          fullname: "projet.ai.update_quality",
          modulename: "projet.ai",
          qualname: "update_quality",
          type: "function",
          doc: "<p>Update the previous Q[s,a] with the reward and the new Q[s,a]</p>\n\n<h6 id=\"args\">Args</h6>\n\n<ul>\n<li><strong>action (str):</strong>  the direction in 1 letter ('u', 'd', 'l' or 'r')</li>\n<li><strong>q_old_state (Qtable):</strong>  The previous Q[s,a]</li>\n<li><strong>q_new_state (Qtable):</strong>  The new Q[s,a]</li>\n<li><strong>reward (float):</strong>  the reward from the previous action</li>\n</ul>\n",
          parameters: ["action", "q_old_state", "q_new_state", "reward_value"],
          funcdef: "def",
        },
        "projet.ai.update_epsilon": {
          fullname: "projet.ai.update_epsilon",
          modulename: "projet.ai",
          qualname: "update_epsilon",
          type: "function",
          doc: "<p>Update the global epsilon variable</p>\n\n<p>With this formula, the epsilon is high for about 80 000 games\nthen drop to 0.1 for the next 20 000 games.</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.ai.update_discount_factor": {
          fullname: "projet.ai.update_discount_factor",
          modulename: "projet.ai",
          qualname: "update_discount_factor",
          type: "function",
          doc: '<p>Update the discount_factor from global variable</p>\n\n<h6 id="discount-factor">Discount factor</h6>\n\n<blockquote>\n  <ul>\n  <li>0 = short-sighted</li>\n  <li>1 = long-sighted</li>\n  </ul>\n</blockquote>\n\n<p>With this formula, the dicsount factor needs about 25 000 games\nto reach his max value.</p>\n',
          parameters: [],
          funcdef: "def",
        },
        "projet.ai.reward": {
          fullname: "projet.ai.reward",
          modulename: "projet.ai",
          qualname: "reward",
          type: "function",
          doc: '<p>Calculate the reward based on the evolution of the board</p>\n\n<h6 id="how-it-works">How it works</h6>\n\n<blockquote>\n  <ul>\n  <li>1 case took by the player = +1 point.</li>\n  <li>1 case took by the other player = -0.5 point</li>\n  <li>if win = +10 points</li>\n  </ul>\n</blockquote>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>old_state (str):</strong>  the old state</li>\n<li><strong>new_state (str):</strong>  the new state</li>\n<li><strong>player (int):</strong>  the player number who learns (1 or 2)</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>reward: the reward of the previous action</p>\n</blockquote>\n',
          parameters: ["old_state", "new_state", "player", "winner"],
          funcdef: "def",
        },
        "projet.ai.previous_state": {
          fullname: "projet.ai.previous_state",
          modulename: "projet.ai",
          qualname: "previous_state",
          type: "function",
          doc: '<p>Get previous state from the database</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_id (int):</strong>  id of the game</li>\n<li><strong>current_player (int):</strong>  the player number who learns</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>state: The old state from History table</p>\n</blockquote>\n',
          parameters: ["game_id", "current_player"],
          funcdef: "def",
        },
        "projet.ai.other_player": {
          fullname: "projet.ai.other_player",
          modulename: "projet.ai",
          qualname: "other_player",
          type: "function",
          doc: '<p>Get the other player number</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>player (int):</strong>  the current player (1 or 2)</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>int: the other player number</p>\n</blockquote>\n',
          parameters: ["player"],
          funcdef: "def",
        },
        "projet.ai.pos_player": {
          fullname: "projet.ai.pos_player",
          modulename: "projet.ai",
          qualname: "pos_player",
          type: "function",
          doc: '<p>Return the position of a player</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_state (GameState):</strong>  the current state of the game</li>\n<li><strong>player (int):</strong>  the player number</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>(int, int): the position of the player</p>\n</blockquote>\n',
          parameters: ["game_state", "player"],
          funcdef: "def",
        },
        "projet.ai.q_state": {
          fullname: "projet.ai.q_state",
          modulename: "projet.ai",
          qualname: "q_state",
          type: "function",
          doc: '<p>Retreive the qtable line for the state if it exists.\nOtherwise create it and return it.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>state (str):</strong>  the state</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>Qtable: the line of the qtable</p>\n</blockquote>\n',
          parameters: ["state"],
          funcdef: "def",
        },
        "projet.ai.info": {
          fullname: "projet.ai.info",
          modulename: "projet.ai",
          qualname: "info",
          type: "function",
          doc: "<p>Return the current state of the learning</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.ai.set_parameters": {
          fullname: "projet.ai.set_parameters",
          modulename: "projet.ai",
          qualname: "set_parameters",
          type: "function",
          doc: '<p>Set the value of the pamaeters according to the mode</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>mode (str):</strong>  the mode of the app (train or play)</li>\n</ul>\n',
          parameters: ["mode"],
          funcdef: "def",
        },
        "projet.ai.get_move_random": {
          fullname: "projet.ai.get_move_random",
          modulename: "projet.ai",
          qualname: "get_move_random",
          type: "function",
          doc: '<p>Return a random movement</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_state (Game):</strong>  the current state of the game</li>\n<li><strong>player (int):</strong>  the player number</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>Tuple[int, int]: a random movement</p>\n</blockquote>\n',
          parameters: ["game_state", "player"],
          funcdef: "def",
        },
        "projet.exceptions": {
          fullname: "projet.exceptions",
          modulename: "projet.exceptions",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.exceptions.InvalidPositionException": {
          fullname: "projet.exceptions.InvalidPositionException",
          modulename: "projet.exceptions",
          qualname: "InvalidPositionException",
          type: "class",
          doc: '<p>Exception raised by an invalid move</p>\n\n<h6 id="attributes">Attributes</h6>\n\n<ul>\n<li><strong>x (int):</strong>  x position of the player</li>\n<li><strong>y (int):</strong>  y position of the player</li>\n</ul>\n',
        },
        "projet.exceptions.InvalidPositionException.__init__": {
          fullname: "projet.exceptions.InvalidPositionException.__init__",
          modulename: "projet.exceptions",
          qualname: "InvalidPositionException.__init__",
          type: "function",
          doc: "<p></p>\n",
          parameters: ["self", "x", "y"],
          funcdef: "def",
        },
        "projet.exceptions.InvalidPlayerException": {
          fullname: "projet.exceptions.InvalidPlayerException",
          modulename: "projet.exceptions",
          qualname: "InvalidPlayerException",
          type: "class",
          doc: '<p>Exception raised by an invalid player</p>\n\n<h6 id="attributes">Attributes</h6>\n\n<ul>\n<li><strong>player (int):</strong>  the invalid player numbers</li>\n</ul>\n',
        },
        "projet.exceptions.InvalidPlayerException.__init__": {
          fullname: "projet.exceptions.InvalidPlayerException.__init__",
          modulename: "projet.exceptions",
          qualname: "InvalidPlayerException.__init__",
          type: "function",
          doc: "<p></p>\n",
          parameters: ["self", "player"],
          funcdef: "def",
        },
        "projet.exceptions.GameFinishedException": {
          fullname: "projet.exceptions.GameFinishedException",
          modulename: "projet.exceptions",
          qualname: "GameFinishedException",
          type: "class",
          doc: "<p>Exception raised by a finished game</p>\n",
        },
        "projet.exceptions.InvalidMoveException": {
          fullname: "projet.exceptions.InvalidMoveException",
          modulename: "projet.exceptions",
          qualname: "InvalidMoveException",
          type: "class",
          doc: '<p>Exception raised by an invalid move</p>\n\n<h6 id="attributes">Attributes</h6>\n\n<ul>\n<li><strong>x (int):</strong>  the x coordinate of the move</li>\n<li><strong>y (int):</strong>  the y coordinate of the move</li>\n</ul>\n',
        },
        "projet.exceptions.InvalidMoveException.__init__": {
          fullname: "projet.exceptions.InvalidMoveException.__init__",
          modulename: "projet.exceptions",
          qualname: "InvalidMoveException.__init__",
          type: "function",
          doc: "<p></p>\n",
          parameters: ["self", "x", "y"],
          funcdef: "def",
        },
        "projet.exceptions.InvalidActionException": {
          fullname: "projet.exceptions.InvalidActionException",
          modulename: "projet.exceptions",
          qualname: "InvalidActionException",
          type: "class",
          doc: '<p>Exception raised by an invalid action</p>\n\n<h6 id="attributes">Attributes</h6>\n\n<ul>\n<li><strong>action (str):</strong>  the invalid action</li>\n</ul>\n',
        },
        "projet.exceptions.InvalidActionException.__init__": {
          fullname: "projet.exceptions.InvalidActionException.__init__",
          modulename: "projet.exceptions",
          qualname: "InvalidActionException.__init__",
          type: "function",
          doc: "<p></p>\n",
          parameters: ["self", "action"],
          funcdef: "def",
        },
        "projet.models": {
          fullname: "projet.models",
          modulename: "projet.models",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.models.init_db": {
          fullname: "projet.models.init_db",
          modulename: "projet.models",
          qualname: "init_db",
          type: "function",
          doc: "<p>Initialize Database</p>\n",
          parameters: ["reset"],
          funcdef: "def",
        },
        "projet.models.User": {
          fullname: "projet.models.User",
          modulename: "projet.models",
          qualname: "User",
          type: "class",
          doc: "<p>User Model</p>\n\n<h6 id=\"args\">Args</h6>\n\n<ul>\n<li><strong>email (string):</strong>  User's email</li>\n<li><strong>name (string):</strong>  User's name</li>\n<li><strong>password (string):</strong>  hashed User's password</li>\n<li><strong>is_human (boolean):</strong>  True if user is admin, False otherwise</li>\n</ul>\n",
        },
        "projet.models.User.__init__": {
          fullname: "projet.models.User.__init__",
          modulename: "projet.models",
          qualname: "User.__init__",
          type: "function",
          doc: "<p>A simple constructor that allows initialization from kwargs.</p>\n\n<p>Sets attributes on the constructed instance using the names and\nvalues in <code>kwargs</code>.</p>\n\n<p>Only keys that are present as\nattributes of the instance's class are allowed. These could be,\nfor example, any mapped columns or relationships.</p>\n",
          parameters: ["self", "kwargs"],
          funcdef: "def",
        },
        "projet.models.User.id": {
          fullname: "projet.models.User.id",
          modulename: "projet.models",
          qualname: "User.id",
          type: "variable",
          doc: "<p>Auto-incrementing primary key</p>\n",
        },
        "projet.models.User.email": {
          fullname: "projet.models.User.email",
          modulename: "projet.models",
          qualname: "User.email",
          type: "variable",
          doc: "<p>email of the user</p>\n",
        },
        "projet.models.User.name": {
          fullname: "projet.models.User.name",
          modulename: "projet.models",
          qualname: "User.name",
          type: "variable",
          doc: "<p>name of the user</p>\n",
        },
        "projet.models.User.password": {
          fullname: "projet.models.User.password",
          modulename: "projet.models",
          qualname: "User.password",
          type: "variable",
          doc: "<p>hashed password of the user</p>\n",
        },
        "projet.models.User.is_human": {
          fullname: "projet.models.User.is_human",
          modulename: "projet.models",
          qualname: "User.is_human",
          type: "variable",
          doc: "<p>True if user is human, False if user is a bot</p>\n",
        },
        "projet.models.User.games": {
          fullname: "projet.models.User.games",
          modulename: "projet.models",
          qualname: "User.games",
          type: "variable",
          doc: "<p>Games played by the user. Read only</p>\n",
        },
        "projet.models.User.is_admin": {
          fullname: "projet.models.User.is_admin",
          modulename: "projet.models",
          qualname: "User.is_admin",
          type: "variable",
          doc: "<p>True if user is admin, False otherwise.\nTo add admin user: add his email in ADMIN_USERS env variable</p>\n\n<p>Read only</p>\n",
        },
        "projet.models.User.nb_game_played": {
          fullname: "projet.models.User.nb_game_played",
          modulename: "projet.models",
          qualname: "User.nb_game_played",
          type: "variable",
          doc: "<p>The number of game played by the user. Read only</p>\n",
        },
        "projet.models.User.nb_game_win": {
          fullname: "projet.models.User.nb_game_win",
          modulename: "projet.models",
          qualname: "User.nb_game_win",
          type: "variable",
          doc: "<p>The number of game won by the user. Read only</p>\n",
        },
        "projet.models.Game": {
          fullname: "projet.models.Game",
          modulename: "projet.models",
          qualname: "Game",
          type: "class",
          doc: "<p>Game Model</p>\n\n<h6 id=\"args\">Args</h6>\n\n<ul>\n<li><strong>datetime (datetime):</strong>  Creation date of the game</li>\n<li><strong>user_id_1 (int):</strong>  User 1's id</li>\n<li><strong>vs_ai (boolean):</strong>  True if user 2 is an AI, False otherwise</li>\n<li><strong># user_id_2 (int):</strong>  User 2's id</li>\n<li><strong>board (string):</strong>  Board's state</li>\n<li><strong>current_player (int):</strong>  Number of the player who's turn it is</li>\n<li><strong>pos_player1_X (int):</strong>  X position of player 1</li>\n<li><strong>pos_player1_Y (int):</strong>  Y position of player 1</li>\n<li><strong>pos_player2_X (int):</strong>  X position of player 2</li>\n<li><strong>pos_player2_Y (int):</strong>  Y position of player 2</li>\n</ul>\n",
        },
        "projet.models.Game.__init__": {
          fullname: "projet.models.Game.__init__",
          modulename: "projet.models",
          qualname: "Game.__init__",
          type: "function",
          doc: "<p>A simple constructor that allows initialization from kwargs.</p>\n\n<p>Sets attributes on the constructed instance using the names and\nvalues in <code>kwargs</code>.</p>\n\n<p>Only keys that are present as\nattributes of the instance's class are allowed. These could be,\nfor example, any mapped columns or relationships.</p>\n",
          parameters: ["self", "kwargs"],
          funcdef: "def",
        },
        "projet.models.Game.size": {
          fullname: "projet.models.Game.size",
          modulename: "projet.models",
          qualname: "Game.size",
          type: "variable",
          doc: "<p>Size of the board</p>\n",
        },
        "projet.models.Game.id": {
          fullname: "projet.models.Game.id",
          modulename: "projet.models",
          qualname: "Game.id",
          type: "variable",
          doc: "<p>Auto-incrementing primary key</p>\n",
        },
        "projet.models.Game.datetime": {
          fullname: "projet.models.Game.datetime",
          modulename: "projet.models",
          qualname: "Game.datetime",
          type: "variable",
          doc: "<p>Creation date of the game</p>\n",
        },
        "projet.models.Game.user_id_1": {
          fullname: "projet.models.Game.user_id_1",
          modulename: "projet.models",
          qualname: "Game.user_id_1",
          type: "variable",
          doc: "<p>User 1's id</p>\n",
        },
        "projet.models.Game.vs_ai": {
          fullname: "projet.models.Game.vs_ai",
          modulename: "projet.models",
          qualname: "Game.vs_ai",
          type: "variable",
          doc: "<p>True if user 2 is an AI, False otherwise</p>\n",
        },
        "projet.models.Game.board": {
          fullname: "projet.models.Game.board",
          modulename: "projet.models",
          qualname: "Game.board",
          type: "variable",
          doc: "<p>Board's state in string format. 0 = empty, 1 = player 1, 2 = player 2`</p>\n",
        },
        "projet.models.Game.pos_player_1_x": {
          fullname: "projet.models.Game.pos_player_1_x",
          modulename: "projet.models",
          qualname: "Game.pos_player_1_x",
          type: "variable",
          doc: "<p>X position of player 1</p>\n",
        },
        "projet.models.Game.pos_player_1_y": {
          fullname: "projet.models.Game.pos_player_1_y",
          modulename: "projet.models",
          qualname: "Game.pos_player_1_y",
          type: "variable",
          doc: "<p>Y position of player 1</p>\n",
        },
        "projet.models.Game.pos_player_2_x": {
          fullname: "projet.models.Game.pos_player_2_x",
          modulename: "projet.models",
          qualname: "Game.pos_player_2_x",
          type: "variable",
          doc: "<p>X position of player 2</p>\n",
        },
        "projet.models.Game.pos_player_2_y": {
          fullname: "projet.models.Game.pos_player_2_y",
          modulename: "projet.models",
          qualname: "Game.pos_player_2_y",
          type: "variable",
          doc: "<p>Y position of player 2</p>\n",
        },
        "projet.models.Game.current_player": {
          fullname: "projet.models.Game.current_player",
          modulename: "projet.models",
          qualname: "Game.current_player",
          type: "variable",
          doc: "<p>Number of the player who's turn it is</p>\n",
        },
        "projet.models.Game.board_to_array": {
          fullname: "projet.models.Game.board_to_array",
          modulename: "projet.models",
          qualname: "Game.board_to_array",
          type: "function",
          doc: "<p>Convert board to double array</p>\n",
          parameters: ["cls", "board"],
          funcdef: "def",
        },
        "projet.models.Game.board_to_string": {
          fullname: "projet.models.Game.board_to_string",
          modulename: "projet.models",
          qualname: "Game.board_to_string",
          type: "function",
          doc: "<p>Convert board to string</p>\n",
          parameters: ["board"],
          funcdef: "def",
        },
        "projet.models.Game.board_array": {
          fullname: "projet.models.Game.board_array",
          modulename: "projet.models",
          qualname: "Game.board_array",
          type: "variable",
          doc: "<p>Convert board to double array</p>\n",
        },
        "projet.models.Game.is_finished": {
          fullname: "projet.models.Game.is_finished",
          modulename: "projet.models",
          qualname: "Game.is_finished",
          type: "variable",
          doc: '<p>Return if the game is finished</p>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>bool: <code>True</code> if the game is finished, <code>False</code> otherwise.</p>\n</blockquote>\n',
        },
        "projet.models.Game.winner": {
          fullname: "projet.models.Game.winner",
          modulename: "projet.models",
          qualname: "Game.winner",
          type: "variable",
          doc: '<p>Return the number of the winner.</p>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>int: <code>0</code> if the game is not finished, <code>1</code> or <code>2</code> otherwise.</p>\n</blockquote>\n',
        },
        "projet.models.Game.pos_player_1": {
          fullname: "projet.models.Game.pos_player_1",
          modulename: "projet.models",
          qualname: "Game.pos_player_1",
          type: "variable",
          doc: '<p>Return the player 1 \'s position</p>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>tuple: (x, y)</p>\n</blockquote>\n',
        },
        "projet.models.Game.pos_player_2": {
          fullname: "projet.models.Game.pos_player_2",
          modulename: "projet.models",
          qualname: "Game.pos_player_2",
          type: "variable",
          doc: '<p>Return the player 2 \'s position</p>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>tuple: (x, y)</p>\n</blockquote>\n',
        },
        "projet.models.Game.move": {
          fullname: "projet.models.Game.move",
          modulename: "projet.models",
          qualname: "Game.move",
          type: "function",
          doc: '<p>Move the player and update the board</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>move (tuple):</strong>  (x, y) of the move</li>\n<li><strong>player (int):</strong>  Number of the player who\'s turn it is</li>\n</ul>\n',
          parameters: ["self", "move", "player"],
          funcdef: "def",
        },
        "projet.models.Qtable": {
          fullname: "projet.models.Qtable",
          modulename: "projet.models",
          qualname: "Qtable",
          type: "class",
          doc: '<p>Qtable model</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>state (str):</strong>  this is the state of the current game, contain:\nboard(25), pos_player_1(2), pos_player_2(2), and turn(1)\n=&gt; 30 caracters =&gt; "100000000000000000000000200441" for ex</li>\n<li><strong>up (int):</strong>  value of the quality for this direction at this state</li>\n<li><strong>down (int):</strong>  value of the quality for this direction at this state</li>\n<li><strong>left (int):</strong>  value of the quality for this direction at this state</li>\n<li><strong>right (int):</strong>  value of the quality for this direction at this state</li>\n</ul>\n',
        },
        "projet.models.Qtable.__init__": {
          fullname: "projet.models.Qtable.__init__",
          modulename: "projet.models",
          qualname: "Qtable.__init__",
          type: "function",
          doc: "<p>A simple constructor that allows initialization from kwargs.</p>\n\n<p>Sets attributes on the constructed instance using the names and\nvalues in <code>kwargs</code>.</p>\n\n<p>Only keys that are present as\nattributes of the instance's class are allowed. These could be,\nfor example, any mapped columns or relationships.</p>\n",
          parameters: ["self", "kwargs"],
          funcdef: "def",
        },
        "projet.models.Qtable.state": {
          fullname: "projet.models.Qtable.state",
          modulename: "projet.models",
          qualname: "Qtable.state",
          type: "variable",
          doc: "<p>State of the current game in a string</p>\n",
        },
        "projet.models.Qtable.up": {
          fullname: "projet.models.Qtable.up",
          modulename: "projet.models",
          qualname: "Qtable.up",
          type: "variable",
          doc: "<p>Value of the quality for up direction at this state</p>\n",
        },
        "projet.models.Qtable.down": {
          fullname: "projet.models.Qtable.down",
          modulename: "projet.models",
          qualname: "Qtable.down",
          type: "variable",
          doc: "<p>Value of the quality for down direction at this state</p>\n",
        },
        "projet.models.Qtable.left": {
          fullname: "projet.models.Qtable.left",
          modulename: "projet.models",
          qualname: "Qtable.left",
          type: "variable",
          doc: "<p>Value of the quality for left direction at this state</p>\n",
        },
        "projet.models.Qtable.right": {
          fullname: "projet.models.Qtable.right",
          modulename: "projet.models",
          qualname: "Qtable.right",
          type: "variable",
          doc: "<p>Value of the quality for right direction at this state</p>\n",
        },
        "projet.models.Qtable.get_quality": {
          fullname: "projet.models.Qtable.get_quality",
          modulename: "projet.models",
          qualname: "Qtable.get_quality",
          type: "function",
          doc: '<p>Return the quality of the action</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>action (str):</strong>  the action to get the quality</li>\n</ul>\n\n<h6 id="raises">Raises</h6>\n\n<ul>\n<li><strong>InvalidActionException:</strong>  if the action is not valid (up, down, left, right)</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>int: the quality of the action</p>\n</blockquote>\n',
          parameters: ["self", "action"],
          funcdef: "def",
        },
        "projet.models.Qtable.set_quality": {
          fullname: "projet.models.Qtable.set_quality",
          modulename: "projet.models",
          qualname: "Qtable.set_quality",
          type: "function",
          doc: '<p>Set the reward of the action</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>action (str):</strong>  the action to set the reward</li>\n<li><strong>reward (float):</strong>  the reward to set</li>\n</ul>\n\n<h6 id="raises">Raises</h6>\n\n<ul>\n<li><strong>InvalidActionException:</strong>  if the action is not valid (up, down, left, right)</li>\n</ul>\n',
          parameters: ["self", "action", "reward"],
          funcdef: "def",
        },
        "projet.models.Qtable.max": {
          fullname: "projet.models.Qtable.max",
          modulename: "projet.models",
          qualname: "Qtable.max",
          type: "function",
          doc: '<p>Return the max reward for the given valid moves.\nIf no valid moves are given, return the max quality for all the actions.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>valid_movements (list):</strong>  list of valid movements.\nDefault is ["u", "d", "l", "r"]</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>float: the max quality of the action</p>\n</blockquote>\n',
          parameters: ["self", "valid_movements"],
          funcdef: "def",
        },
        "projet.models.Qtable.best": {
          fullname: "projet.models.Qtable.best",
          modulename: "projet.models",
          qualname: "Qtable.best",
          type: "function",
          doc: '<p>Return the best action</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>valid_movements (list, optional):</strong>  List of all valid moves.\nDefaults to ["u", "d", "l", "r"].</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: the best action</p>\n</blockquote>\n',
          parameters: ["self", "valid_movements"],
          funcdef: "def",
        },
        "projet.models.History": {
          fullname: "projet.models.History",
          modulename: "projet.models",
          qualname: "History",
          type: "class",
          doc: "<p>Save last state for a gameId and player. Used for the AI</p>\n",
        },
        "projet.models.History.__init__": {
          fullname: "projet.models.History.__init__",
          modulename: "projet.models",
          qualname: "History.__init__",
          type: "function",
          doc: "<p>A simple constructor that allows initialization from kwargs.</p>\n\n<p>Sets attributes on the constructed instance using the names and\nvalues in <code>kwargs</code>.</p>\n\n<p>Only keys that are present as\nattributes of the instance's class are allowed. These could be,\nfor example, any mapped columns or relationships.</p>\n",
          parameters: ["self", "kwargs"],
          funcdef: "def",
        },
        "projet.models.History.game_id": {
          fullname: "projet.models.History.game_id",
          modulename: "projet.models",
          qualname: "History.game_id",
          type: "variable",
          doc: "<p>Id of the game</p>\n",
        },
        "projet.models.History.current_player": {
          fullname: "projet.models.History.current_player",
          modulename: "projet.models",
          qualname: "History.current_player",
          type: "variable",
          doc: "<p>Number of the player who's turn it is</p>\n",
        },
        "projet.models.History.state": {
          fullname: "projet.models.History.state",
          modulename: "projet.models",
          qualname: "History.state",
          type: "variable",
          doc: "<p>State of the current game in a string</p>\n",
        },
        "projet.models.History.movement": {
          fullname: "projet.models.History.movement",
          modulename: "projet.models",
          qualname: "History.movement",
          type: "variable",
          doc: "<p>Movement of the player (u, d, l, r)</p>\n",
        },
        "projet.train": {
          fullname: "projet.train",
          modulename: "projet.train",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.train.train_ai": {
          fullname: "projet.train.train_ai",
          modulename: "projet.train",
          qualname: "train_ai",
          type: "function",
          doc: '<p>Launch a training session for the AI</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>n_games (int, optional):</strong>  the number of game to train the AI.\nDefaults to 1000.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: Finished string</p>\n</blockquote>\n\n<h6 id="yields">Yields</h6>\n\n<blockquote>\n  <p>string: information about the finised game</p>\n</blockquote>\n',
          parameters: ["n_games"],
          funcdef: "def",
        },
        "projet.train.start_train_ai": {
          fullname: "projet.train.start_train_ai",
          modulename: "projet.train",
          qualname: "start_train_ai",
          type: "function",
          doc: '<p>Start a training session for the AI and set the parameters to train mode</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>n_games (int, optional):</strong>  The number of game to train the AI.\nDefaults to 1000.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>Generator: The generator returns by <code>train_ai</code></p>\n</blockquote>\n',
          parameters: ["n_games"],
          funcdef: "def",
        },
        "projet.train.test_ai": {
          fullname: "projet.train.test_ai",
          modulename: "projet.train",
          qualname: "test_ai",
          type: "function",
          doc: '<p>Launch a test session for the AI</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>n_games (int, optional):</strong>  The number of game to test the AI.\nDefaults to 100.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: final stat string</p>\n</blockquote>\n\n<h6 id="yields">Yields</h6>\n\n<blockquote>\n  <p>string: the number of the game just finished</p>\n</blockquote>\n',
          parameters: ["n_games"],
          funcdef: "def",
        },
        "projet.train.start_test_ai": {
          fullname: "projet.train.start_test_ai",
          modulename: "projet.train",
          qualname: "start_test_ai",
          type: "function",
          doc: '<p>Start a test session for the AI and set the parameters to test mode</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>n_games (int, optional):</strong>  The number of game to test the AI.\nDefaults to 100.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>Generator: The generator returns by <code>test_ai</code></p>\n</blockquote>\n',
          parameters: ["n_games"],
          funcdef: "def",
        },
        "projet.utils": {
          fullname: "projet.utils",
          modulename: "projet.utils",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.utils.is_email_valid": {
          fullname: "projet.utils.is_email_valid",
          modulename: "projet.utils",
          qualname: "is_email_valid",
          type: "function",
          doc: '<p>Check if an email is valid.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>email (string):</strong>  input Email.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>bool: <code>True</code> if the email is valid, <code>False</code> otherwise.</p>\n</blockquote>\n',
          parameters: ["email"],
          funcdef: "def",
        },
        "projet.utils.fill_paddock": {
          fullname: "projet.utils.fill_paddock",
          modulename: "projet.utils",
          qualname: "fill_paddock",
          type: "function",
          doc: '<p>Update board to paint enclosed cells.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>board (2D Array):</strong>  The board game.</li>\n<li><strong>size (int, optional):</strong>  size of the board. Defaults to 5.</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>2D Array: The updated board.</p>\n</blockquote>\n\n<h6 id="explanation">Explanation</h6>\n\n<blockquote>\n  <p>The board is updated by checking if an empty cell is surrounded by cells\n  of the same color.\n  If an empty cell is surrounded by cells of the same color, it is painted\n  with the same color.\n  If an empty cell is surrounded by cells of different color, it is not painted.</p>\n</blockquote>\n\n<h6 id="board-value">Board Value</h6>\n\n<blockquote>\n  <p>0 : Empty cell\n  1 : user 1\'s cell\n  2 : user 2\'s cell</p>\n</blockquote>\n\n<h6 id="board-temp-value">Board Temp Value</h6>\n\n<blockquote>\n  <p>-1: Cell not enclosed\n  -2: Cell that has been checked and wait for an answer</p>\n</blockquote>\n\n<h6 id="exemple">Exemple</h6>\n\n<blockquote>\n  <p>INPUT:\n  [[1, 0, 0, 1, 0],\n   [1, 1, 1, 1, 0],\n   [0, 0, 2, 2, 2],\n   [0, 0, 2, 0, 0],\n   [0, 0, 2, 2, 2]]</p>\n  \n  <p>OUTPUT:\n  [[1, 1, 1, 1, 0],\n   [1, 1, 1, 1, 0],\n   [0, 0, 2, 2, 2],\n   [0, 0, 2, 2, 2],\n   [0, 0, 2, 2, 2]]</p>\n</blockquote>\n',
          parameters: ["board", "size"],
          funcdef: "def",
        },
        "projet.utils.is_movement_valid": {
          fullname: "projet.utils.is_movement_valid",
          modulename: "projet.utils",
          qualname: "is_movement_valid",
          type: "function",
          doc: '<p>Check if the movement is valid.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>board (List[List[int]]):</strong>  board</li>\n<li><strong>player (int):</strong>  player</li>\n<li><strong>movement (tuple):</strong>  movement</li>\n</ul>\n',
          parameters: ["board", "player", "player_pos", "movement"],
          funcdef: "def",
        },
        "projet.utils.move_converted": {
          fullname: "projet.utils.move_converted",
          modulename: "projet.utils",
          qualname: "move_converted",
          type: "function",
          doc: '<p>Convert direction to coordinates.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>move (str):</strong>  the word representing the direction</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>tuple: the coordinates of the direction</p>\n</blockquote>\n',
          parameters: ["move"],
          funcdef: "def",
        },
        "projet.utils.called": {
          fullname: "projet.utils.called",
          modulename: "projet.utils",
          qualname: "called",
          type: "function",
          doc: '<p>Decorator to log when a function is called.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>func (function):</strong>  function to log</li>\n</ul>\n',
          parameters: ["func"],
          funcdef: "def",
        },
        "projet.utils.timer": {
          fullname: "projet.utils.timer",
          modulename: "projet.utils",
          qualname: "timer",
          type: "function",
          doc: "<p>Decorator to log the time taken by a function</p>\n",
          parameters: ["func"],
          funcdef: "def",
        },
        "projet.utils.parse_users": {
          fullname: "projet.utils.parse_users",
          modulename: "projet.utils",
          qualname: "parse_users",
          type: "function",
          doc: '<p>Parse the users to a list of tuples.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>users (str):</strong>  the users</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>list: the list of tuples</p>\n</blockquote>\n',
          parameters: ["users"],
          funcdef: "def",
        },
        "projet.utils.user_is_admin": {
          fullname: "projet.utils.user_is_admin",
          modulename: "projet.utils",
          qualname: "user_is_admin",
          type: "function",
          doc: '<p>Check if the user is an admin.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>user (User):</strong>  the user</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>bool: <code>True</code> if the user is an admin, <code>False</code> otherwise.</p>\n</blockquote>\n',
          parameters: ["user"],
          funcdef: "def",
        },
        "projet.utils.admin_required": {
          fullname: "projet.utils.admin_required",
          modulename: "projet.utils",
          qualname: "admin_required",
          type: "function",
          doc: "<p>Decorator to check if the user is an admin.</p>\n",
          parameters: ["func"],
          funcdef: "def",
        },
        "projet.utils.beautify_board": {
          fullname: "projet.utils.beautify_board",
          modulename: "projet.utils",
          qualname: "beautify_board",
          type: "function",
          doc: '<p>Beautify the board.</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>board (List[List[int]]):</strong>  the board</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: the board</p>\n</blockquote>\n',
          parameters: ["board"],
          funcdef: "def",
        },
        "projet.utils.state_is_valid": {
          fullname: "projet.utils.state_is_valid",
          modulename: "projet.utils",
          qualname: "state_is_valid",
          type: "function",
          doc: '<p>Check the state</p>\n\n<p>Check if the state has a valid form</p>\n\n<h6 id="args">Args</h6>\n\n<blockquote>\n  <p>state : the current state to test</p>\n</blockquote>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>bool : the validity of the state</p>\n</blockquote>\n',
          parameters: ["state", "board_size"],
          funcdef: "def",
        },
        "projet.utils.all_valid_movements": {
          fullname: "projet.utils.all_valid_movements",
          modulename: "projet.utils",
          qualname: "all_valid_movements",
          type: "function",
          doc: '<p>Return all valid movements for a player</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>board (List[List[int]]):</strong>  the board</li>\n<li><strong>player (int):</strong>  the player number</li>\n<li><strong>pos (tuple(int,int)):</strong>  the position of the player</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>List[str]: All valid movements</p>\n</blockquote>\n',
          parameters: ["board", "player", "pos"],
          funcdef: "def",
        },
        "projet.utils.state_parsed": {
          fullname: "projet.utils.state_parsed",
          modulename: "projet.utils",
          qualname: "state_parsed",
          type: "function",
          doc: '<p>Retreive state information from the string</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>state (string):</strong>  state concat in string</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: board: the board in string\n  int: pos_player_1: the position of player 1 in a tuple\n  int: pos_player_2: the position of player 2 in a tuple\n  int: turn: the player who has to play.</p>\n</blockquote>\n',
          parameters: ["state"],
          funcdef: "def",
        },
        "projet.utils.state_str": {
          fullname: "projet.utils.state_str",
          modulename: "projet.utils",
          qualname: "state_str",
          type: "function",
          doc: '<p>Convert game state to string state</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_state (Game):</strong>  the game object from db</li>\n</ul>\n\n<h6 id="returns">Returns</h6>\n\n<blockquote>\n  <p>str: the converted string state</p>\n</blockquote>\n',
          parameters: ["game_state"],
          funcdef: "def",
        },
        "projet.views": {
          fullname: "projet.views",
          modulename: "projet.views",
          qualname: "",
          type: "module",
          doc: "<p></p>\n",
        },
        "projet.views.index": {
          fullname: "projet.views.index",
          modulename: "projet.views",
          qualname: "index",
          type: "function",
          doc: "<p>Root route</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.game_create": {
          fullname: "projet.views.game_create",
          modulename: "projet.views",
          qualname: "game_create",
          type: "function",
          doc: "<p>Create game</p>\n\n<p>Auth required</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.display_stat": {
          fullname: "projet.views.display_stat",
          modulename: "projet.views",
          qualname: "display_stat",
          type: "function",
          doc: "<p></p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.hint": {
          fullname: "projet.views.hint",
          modulename: "projet.views",
          qualname: "hint",
          type: "function",
          doc: "<p></p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.game": {
          fullname: "projet.views.game",
          modulename: "projet.views",
          qualname: "game",
          type: "function",
          doc: '<p>Send game view and game state + handle move</p>\n\n<p>Auth required</p>\n\n<h6 id="args">Args</h6>\n\n<ul>\n<li><strong>game_id (int):</strong>  the ID of the game</li>\n</ul>\n',
          parameters: ["game_id"],
          funcdef: "def",
        },
        "projet.views.login": {
          fullname: "projet.views.login",
          modulename: "projet.views",
          qualname: "login",
          type: "function",
          doc: "<p>Login route</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.signup": {
          fullname: "projet.views.signup",
          modulename: "projet.views",
          qualname: "signup",
          type: "function",
          doc: "<p>Signup route</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.logout": {
          fullname: "projet.views.logout",
          modulename: "projet.views",
          qualname: "logout",
          type: "function",
          doc: "<p>Logout route</p>\n\n<p>Auth required</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.dashboard": {
          fullname: "projet.views.dashboard",
          modulename: "projet.views",
          qualname: "dashboard",
          type: "function",
          doc: "<p>Dashboard</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.start_train": {
          fullname: "projet.views.start_train",
          modulename: "projet.views",
          qualname: "start_train",
          type: "function",
          doc: "<p>Start training</p>\n",
          parameters: [],
          funcdef: "def",
        },
        "projet.views.start_test": {
          fullname: "projet.views.start_test",
          modulename: "projet.views",
          qualname: "start_test",
          type: "function",
          doc: "<p>Start training</p>\n",
          parameters: [],
          funcdef: "def",
        },
      },
      docInfo: {
        projet: { qualname: 0, fullname: 1, doc: 0 },
        "projet.load_user": { qualname: 1, fullname: 2, doc: 17 },
        "projet.ai": { qualname: 0, fullname: 2, doc: 0 },
        "projet.ai.update_game_finished": { qualname: 1, fullname: 3, doc: 18 },
        "projet.ai.random_action": { qualname: 1, fullname: 3, doc: 28 },
        "projet.ai.update_quality": { qualname: 1, fullname: 3, doc: 29 },
        "projet.ai.update_epsilon": { qualname: 1, fullname: 3, doc: 17 },
        "projet.ai.update_discount_factor": {
          qualname: 1,
          fullname: 3,
          doc: 22,
        },
        "projet.ai.reward": { qualname: 1, fullname: 3, doc: 43 },
        "projet.ai.previous_state": { qualname: 1, fullname: 3, doc: 19 },
        "projet.ai.other_player": { qualname: 1, fullname: 3, doc: 13 },
        "projet.ai.pos_player": { qualname: 1, fullname: 3, doc: 18 },
        "projet.ai.q_state": { qualname: 1, fullname: 3, doc: 16 },
        "projet.ai.info": { qualname: 1, fullname: 3, doc: 4 },
        "projet.ai.set_parameters": { qualname: 1, fullname: 3, doc: 12 },
        "projet.ai.get_move_random": { qualname: 1, fullname: 3, doc: 18 },
        "projet.exceptions": { qualname: 0, fullname: 2, doc: 0 },
        "projet.exceptions.InvalidPositionException": {
          qualname: 1,
          fullname: 3,
          doc: 15,
        },
        "projet.exceptions.InvalidPositionException.__init__": {
          qualname: 2,
          fullname: 4,
          doc: 0,
        },
        "projet.exceptions.InvalidPlayerException": {
          qualname: 1,
          fullname: 3,
          doc: 10,
        },
        "projet.exceptions.InvalidPlayerException.__init__": {
          qualname: 2,
          fullname: 4,
          doc: 0,
        },
        "projet.exceptions.GameFinishedException": {
          qualname: 1,
          fullname: 3,
          doc: 4,
        },
        "projet.exceptions.InvalidMoveException": {
          qualname: 1,
          fullname: 3,
          doc: 15,
        },
        "projet.exceptions.InvalidMoveException.__init__": {
          qualname: 2,
          fullname: 4,
          doc: 0,
        },
        "projet.exceptions.InvalidActionException": {
          qualname: 1,
          fullname: 3,
          doc: 9,
        },
        "projet.exceptions.InvalidActionException.__init__": {
          qualname: 2,
          fullname: 4,
          doc: 0,
        },
        "projet.models": { qualname: 0, fullname: 2, doc: 0 },
        "projet.models.init_db": { qualname: 1, fullname: 3, doc: 2 },
        "projet.models.User": { qualname: 1, fullname: 3, doc: 23 },
        "projet.models.User.__init__": { qualname: 2, fullname: 4, doc: 23 },
        "projet.models.User.id": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.User.email": { qualname: 2, fullname: 4, doc: 2 },
        "projet.models.User.name": { qualname: 2, fullname: 4, doc: 2 },
        "projet.models.User.password": { qualname: 2, fullname: 4, doc: 3 },
        "projet.models.User.is_human": { qualname: 2, fullname: 4, doc: 6 },
        "projet.models.User.games": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.User.is_admin": { qualname: 2, fullname: 4, doc: 14 },
        "projet.models.User.nb_game_played": {
          qualname: 2,
          fullname: 4,
          doc: 5,
        },
        "projet.models.User.nb_game_win": { qualname: 2, fullname: 4, doc: 5 },
        "projet.models.Game": { qualname: 1, fullname: 3, doc: 60 },
        "projet.models.Game.__init__": { qualname: 2, fullname: 4, doc: 23 },
        "projet.models.Game.size": { qualname: 2, fullname: 4, doc: 2 },
        "projet.models.Game.id": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.Game.datetime": { qualname: 2, fullname: 4, doc: 3 },
        "projet.models.Game.user_id_1": { qualname: 2, fullname: 4, doc: 3 },
        "projet.models.Game.vs_ai": { qualname: 2, fullname: 4, doc: 6 },
        "projet.models.Game.board": { qualname: 2, fullname: 4, doc: 12 },
        "projet.models.Game.pos_player_1_x": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.pos_player_1_y": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.pos_player_2_x": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.pos_player_2_y": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.current_player": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.board_to_array": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.Game.board_to_string": {
          qualname: 2,
          fullname: 4,
          doc: 3,
        },
        "projet.models.Game.board_array": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.Game.is_finished": { qualname: 2, fullname: 4, doc: 10 },
        "projet.models.Game.winner": { qualname: 2, fullname: 4, doc: 11 },
        "projet.models.Game.pos_player_1": { qualname: 2, fullname: 4, doc: 9 },
        "projet.models.Game.pos_player_2": { qualname: 2, fullname: 4, doc: 9 },
        "projet.models.Game.move": { qualname: 2, fullname: 4, doc: 16 },
        "projet.models.Qtable": { qualname: 1, fullname: 3, doc: 43 },
        "projet.models.Qtable.__init__": { qualname: 2, fullname: 4, doc: 23 },
        "projet.models.Qtable.state": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.Qtable.up": { qualname: 2, fullname: 4, doc: 5 },
        "projet.models.Qtable.down": { qualname: 2, fullname: 4, doc: 5 },
        "projet.models.Qtable.left": { qualname: 2, fullname: 4, doc: 5 },
        "projet.models.Qtable.right": { qualname: 2, fullname: 4, doc: 5 },
        "projet.models.Qtable.get_quality": {
          qualname: 2,
          fullname: 4,
          doc: 20,
        },
        "projet.models.Qtable.set_quality": {
          qualname: 2,
          fullname: 4,
          doc: 21,
        },
        "projet.models.Qtable.max": { qualname: 2, fullname: 4, doc: 29 },
        "projet.models.Qtable.best": { qualname: 2, fullname: 4, doc: 19 },
        "projet.models.History": { qualname: 1, fullname: 3, doc: 7 },
        "projet.models.History.__init__": { qualname: 2, fullname: 4, doc: 23 },
        "projet.models.History.game_id": { qualname: 2, fullname: 4, doc: 2 },
        "projet.models.History.current_player": {
          qualname: 2,
          fullname: 4,
          doc: 4,
        },
        "projet.models.History.state": { qualname: 2, fullname: 4, doc: 4 },
        "projet.models.History.movement": { qualname: 2, fullname: 4, doc: 6 },
        "projet.train": { qualname: 0, fullname: 2, doc: 0 },
        "projet.train.train_ai": { qualname: 1, fullname: 3, doc: 23 },
        "projet.train.start_train_ai": { qualname: 1, fullname: 3, doc: 23 },
        "projet.train.test_ai": { qualname: 1, fullname: 3, doc: 24 },
        "projet.train.start_test_ai": { qualname: 1, fullname: 3, doc: 23 },
        "projet.utils": { qualname: 0, fullname: 2, doc: 0 },
        "projet.utils.is_email_valid": { qualname: 1, fullname: 3, doc: 15 },
        "projet.utils.fill_paddock": { qualname: 1, fullname: 3, doc: 126 },
        "projet.utils.is_movement_valid": { qualname: 1, fullname: 3, doc: 13 },
        "projet.utils.move_converted": { qualname: 1, fullname: 3, doc: 13 },
        "projet.utils.called": { qualname: 1, fullname: 3, doc: 9 },
        "projet.utils.timer": { qualname: 1, fullname: 3, doc: 5 },
        "projet.utils.parse_users": { qualname: 1, fullname: 3, doc: 12 },
        "projet.utils.user_is_admin": { qualname: 1, fullname: 3, doc: 14 },
        "projet.utils.admin_required": { qualname: 1, fullname: 3, doc: 4 },
        "projet.utils.beautify_board": { qualname: 1, fullname: 3, doc: 9 },
        "projet.utils.state_is_valid": { qualname: 1, fullname: 3, doc: 15 },
        "projet.utils.all_valid_movements": {
          qualname: 1,
          fullname: 3,
          doc: 20,
        },
        "projet.utils.state_parsed": { qualname: 1, fullname: 3, doc: 31 },
        "projet.utils.state_str": { qualname: 1, fullname: 3, doc: 16 },
        "projet.views": { qualname: 0, fullname: 2, doc: 0 },
        "projet.views.index": { qualname: 1, fullname: 3, doc: 2 },
        "projet.views.game_create": { qualname: 1, fullname: 3, doc: 4 },
        "projet.views.display_stat": { qualname: 1, fullname: 3, doc: 0 },
        "projet.views.hint": { qualname: 1, fullname: 3, doc: 0 },
        "projet.views.game": { qualname: 1, fullname: 3, doc: 14 },
        "projet.views.login": { qualname: 1, fullname: 3, doc: 2 },
        "projet.views.signup": { qualname: 1, fullname: 3, doc: 2 },
        "projet.views.logout": { qualname: 1, fullname: 3, doc: 4 },
        "projet.views.dashboard": { qualname: 1, fullname: 3, doc: 1 },
        "projet.views.start_train": { qualname: 1, fullname: 3, doc: 2 },
        "projet.views.start_test": { qualname: 1, fullname: 3, doc: 2 },
      },
      length: 109,
      save: true,
    },
    index: {
      qualname: {
        root: {
          docs: {},
          df: 0,
          l: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      s: { docs: { "projet.load_user": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
              g: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: { docs: { "projet.views.login": { tf: 1 } }, df: 1 },
                },
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.views.logout": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                t: { docs: { "projet.models.Qtable.left": { tf: 1 } }, df: 1 },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            p: {
              docs: { "projet.models.Qtable.up": { tf: 1 } },
              df: 1,
              d: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        g: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  f: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          s: {
                                            docs: {},
                                            df: 0,
                                            h: {
                                              docs: {
                                                "projet.ai.update_game_finished":
                                                  { tf: 1 },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        q: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: { "projet.ai.update_quality": { tf: 1 } },
                            df: 1,
                          },
                        },
                        e: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {
                                        "projet.ai.update_epsilon": { tf: 1 },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        d: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  u: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {},
                                        df: 0,
                                        _: {
                                          docs: {},
                                          df: 0,
                                          f: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {},
                                                  df: 0,
                                                  o: {
                                                    docs: {},
                                                    df: 0,
                                                    r: {
                                                      docs: {
                                                        "projet.ai.update_discount_factor":
                                                          { tf: 1 },
                                                      },
                                                      df: 1,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "projet.models.User": { tf: 1 },
                    "projet.models.User.__init__": { tf: 1 },
                    "projet.models.User.id": { tf: 1 },
                    "projet.models.User.email": { tf: 1 },
                    "projet.models.User.name": { tf: 1 },
                    "projet.models.User.password": { tf: 1 },
                    "projet.models.User.is_human": { tf: 1 },
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.models.User.nb_game_win": { tf: 1 },
                  },
                  df: 11,
                  _: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        _: {
                          1: {
                            docs: { "projet.models.Game.user_id_1": { tf: 1 } },
                            df: 1,
                          },
                          docs: {},
                          df: 0,
                        },
                      },
                      s: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            d: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {
                                      "projet.utils.user_is_admin": { tf: 1 },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.ai.random_action": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    d: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "projet.models.Qtable.right": { tf: 1 } },
                    df: 1,
                  },
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                v: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: { "projet.ai.previous_state": { tf: 1 } },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: { "projet.ai.pos_player": { tf: 1 } },
                          df: 1,
                          e: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              _: {
                                1: {
                                  docs: {
                                    "projet.models.Game.pos_player_1": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                  _: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {
                                        "projet.models.Game.pos_player_1_x": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                    i: {
                                      docs: {
                                        "projet.models.Game.pos_player_1_y": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                2: {
                                  docs: {
                                    "projet.models.Game.pos_player_2": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                  _: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {
                                        "projet.models.Game.pos_player_2_x": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                    i: {
                                      docs: {
                                        "projet.models.Game.pos_player_2_y": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                docs: {},
                                df: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: { "projet.models.User.password": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: { "projet.utils.parse_users": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            y: {
                              docs: { "projet.ai.other_player": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          q: {
            docs: {},
            df: 0,
            _: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      e: { docs: { "projet.ai.q_state": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models.Qtable": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.Qtable.up": { tf: 1 },
                      "projet.models.Qtable.down": { tf: 1 },
                      "projet.models.Qtable.left": { tf: 1 },
                      "projet.models.Qtable.right": { tf: 1 },
                      "projet.models.Qtable.get_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1 },
                      "projet.models.Qtable.best": { tf: 1 },
                    },
                    df: 11,
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                o: { docs: { "projet.ai.info": { tf: 1 } }, df: 1 },
              },
              v: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                          docs: {},
                                          df: 0,
                                          x: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                p: {
                                                  docs: {},
                                                  df: 0,
                                                  t: {
                                                    docs: {
                                                      "projet.exceptions.InvalidPositionException":
                                                        { tf: 1 },
                                                      "projet.exceptions.InvalidPositionException.__init__":
                                                        { tf: 1 },
                                                    },
                                                    df: 2,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          l: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              y: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      x: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "projet.exceptions.InvalidPlayerException":
                                                    { tf: 1 },
                                                  "projet.exceptions.InvalidPlayerException.__init__":
                                                    { tf: 1 },
                                                },
                                                df: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        m: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {
                                              "projet.exceptions.InvalidMoveException":
                                                { tf: 1 },
                                              "projet.exceptions.InvalidMoveException.__init__":
                                                { tf: 1 },
                                            },
                                            df: 2,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      x: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "projet.exceptions.InvalidActionException":
                                                    { tf: 1 },
                                                  "projet.exceptions.InvalidActionException.__init__":
                                                    { tf: 1 },
                                                },
                                                df: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {},
                      df: 0,
                      b: {
                        docs: { "projet.models.init_db": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  x: { docs: { "projet.views.index": { tf: 1 } }, df: 1 },
                },
              },
            },
            d: {
              docs: {
                "projet.models.User.id": { tf: 1 },
                "projet.models.Game.id": { tf: 1 },
              },
              df: 2,
            },
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: { "projet.models.User.is_human": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
                a: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: { "projet.models.User.is_admin": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
                f: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          h: {
                            docs: {
                              "projet.models.Game.is_finished": { tf: 1 },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.is_email_valid": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                m: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    v: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  v: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          d: {
                                            docs: {
                                              "projet.utils.is_movement_valid":
                                                { tf: 1 },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: { "projet.ai.set_parameters": { tf: 1 } },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  q: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {
                            "projet.models.Qtable.set_quality": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              z: {
                docs: {},
                df: 0,
                e: { docs: { "projet.models.Game.size": { tf: 1 } }, df: 1 },
              },
              g: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    p: { docs: { "projet.views.signup": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.History.state": { tf: 1 },
                    },
                    df: 2,
                    _: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.state_is_valid": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      p: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: { "projet.utils.state_parsed": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: { "projet.utils.state_str": { tf: 1 } },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: { "projet.views.start_train": { tf: 1 } },
                                df: 1,
                                _: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {
                                        "projet.train.start_train_ai": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        e: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.views.start_test": { tf: 1 } },
                              df: 1,
                              _: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {
                                      "projet.train.start_test_ai": { tf: 1 },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          g: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      m: {
                                        docs: {
                                          "projet.ai.get_move_random": {
                                            tf: 1,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  q: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {
                            "projet.models.Qtable.get_quality": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.__init__": { tf: 1 },
                    "projet.models.Game.size": { tf: 1 },
                    "projet.models.Game.id": { tf: 1 },
                    "projet.models.Game.datetime": { tf: 1 },
                    "projet.models.Game.user_id_1": { tf: 1 },
                    "projet.models.Game.vs_ai": { tf: 1 },
                    "projet.models.Game.board": { tf: 1 },
                    "projet.models.Game.pos_player_1_x": { tf: 1 },
                    "projet.models.Game.pos_player_1_y": { tf: 1 },
                    "projet.models.Game.pos_player_2_x": { tf: 1 },
                    "projet.models.Game.pos_player_2_y": { tf: 1 },
                    "projet.models.Game.current_player": { tf: 1 },
                    "projet.models.Game.board_to_array": { tf: 1 },
                    "projet.models.Game.board_to_string": { tf: 1 },
                    "projet.models.Game.board_array": { tf: 1 },
                    "projet.models.Game.is_finished": { tf: 1 },
                    "projet.models.Game.winner": { tf: 1 },
                    "projet.models.Game.pos_player_1": { tf: 1 },
                    "projet.models.Game.pos_player_2": { tf: 1 },
                    "projet.models.Game.move": { tf: 1 },
                    "projet.views.game": { tf: 1 },
                  },
                  df: 23,
                  f: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            h: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {
                                                "projet.exceptions.GameFinishedException":
                                                  { tf: 1 },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  _: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: { "projet.models.History.game_id": { tf: 1 } },
                        df: 1,
                      },
                    },
                    c: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: { "projet.views.game_create": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          _: {
            docs: {},
            df: 0,
            _: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {
                            "projet.exceptions.InvalidPositionException.__init__":
                              { tf: 1 },
                            "projet.exceptions.InvalidPlayerException.__init__":
                              { tf: 1 },
                            "projet.exceptions.InvalidMoveException.__init__": {
                              tf: 1,
                            },
                            "projet.exceptions.InvalidActionException.__init__":
                              { tf: 1 },
                            "projet.models.User.__init__": { tf: 1 },
                            "projet.models.Game.__init__": { tf: 1 },
                            "projet.models.Qtable.__init__": { tf: 1 },
                            "projet.models.History.__init__": { tf: 1 },
                          },
                          df: 8,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  l: { docs: { "projet.models.User.email": { tf: 1 } }, df: 1 },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: { docs: { "projet.models.User.name": { tf: 1 } }, df: 1 },
              },
            },
            b: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "projet.models.User.nb_game_played": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                          w: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {
                                  "projet.models.User.nb_game_win": { tf: 1 },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          d: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: { "projet.models.Game.datetime": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: { "projet.views.dashboard": { tf: 1 } },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                n: { docs: { "projet.models.Qtable.down": { tf: 1 } }, df: 1 },
              },
            },
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      y: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "projet.views.display_stat": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  i: { docs: { "projet.models.Game.vs_ai": { tf: 1 } }, df: 1 },
                },
              },
            },
          },
          b: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "projet.models.Game.board": { tf: 1 } },
                    df: 1,
                    _: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    y: {
                                      docs: {
                                        "projet.models.Game.board_to_array": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                            s: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {
                                    "projet.models.Game.board_to_string": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                      a: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              y: {
                                docs: {
                                  "projet.models.Game.board_array": { tf: 1 },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: { docs: { "projet.models.Qtable.best": { tf: 1 } }, df: 1 },
              },
              a: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      f: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            b: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.beautify_board": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            u: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "projet.models.Game.current_player": {
                                      tf: 1,
                                    },
                                    "projet.models.History.current_player": {
                                      tf: 1,
                                    },
                                  },
                                  df: 2,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: { docs: { "projet.utils.called": { tf: 1 } }, df: 1 },
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.models.Game.winner": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: { "projet.models.Game.move": { tf: 1 } },
                  df: 1,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: { "projet.models.History.movement": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                  _: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          v: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "projet.utils.move_converted": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              x: { docs: { "projet.models.Qtable.max": { tf: 1 } }, df: 1 },
            },
          },
          h: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "projet.models.History": { tf: 1 },
                          "projet.models.History.__init__": { tf: 1 },
                          "projet.models.History.game_id": { tf: 1 },
                          "projet.models.History.current_player": { tf: 1 },
                          "projet.models.History.state": { tf: 1 },
                          "projet.models.History.movement": { tf: 1 },
                        },
                        df: 6,
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                t: { docs: { "projet.views.hint": { tf: 1 } }, df: 1 },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: { "projet.train.train_ai": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      i: { docs: { "projet.train.test_ai": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: { docs: { "projet.utils.timer": { tf: 1 } }, df: 1 },
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                k: {
                                  docs: {
                                    "projet.utils.fill_paddock": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          a: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          q: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {
                                    "projet.utils.admin_required": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {},
                            df: 0,
                            _: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  v: {
                                    docs: {
                                      "projet.utils.all_valid_movements": {
                                        tf: 1,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      fullname: {
        root: {
          docs: {},
          df: 0,
          p: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                j: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        projet: { tf: 1 },
                        "projet.load_user": { tf: 1 },
                        "projet.ai": { tf: 1 },
                        "projet.ai.update_game_finished": { tf: 1 },
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.update_quality": { tf: 1 },
                        "projet.ai.update_epsilon": { tf: 1 },
                        "projet.ai.update_discount_factor": { tf: 1 },
                        "projet.ai.reward": { tf: 1 },
                        "projet.ai.previous_state": { tf: 1 },
                        "projet.ai.other_player": { tf: 1 },
                        "projet.ai.pos_player": { tf: 1 },
                        "projet.ai.q_state": { tf: 1 },
                        "projet.ai.info": { tf: 1 },
                        "projet.ai.set_parameters": { tf: 1 },
                        "projet.ai.get_move_random": { tf: 1 },
                        "projet.exceptions": { tf: 1 },
                        "projet.exceptions.InvalidPositionException": { tf: 1 },
                        "projet.exceptions.InvalidPositionException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.InvalidPlayerException": { tf: 1 },
                        "projet.exceptions.InvalidPlayerException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.GameFinishedException": { tf: 1 },
                        "projet.exceptions.InvalidMoveException": { tf: 1 },
                        "projet.exceptions.InvalidMoveException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.InvalidActionException": { tf: 1 },
                        "projet.exceptions.InvalidActionException.__init__": {
                          tf: 1,
                        },
                        "projet.models": { tf: 1 },
                        "projet.models.init_db": { tf: 1 },
                        "projet.models.User": { tf: 1 },
                        "projet.models.User.__init__": { tf: 1 },
                        "projet.models.User.id": { tf: 1 },
                        "projet.models.User.email": { tf: 1 },
                        "projet.models.User.name": { tf: 1 },
                        "projet.models.User.password": { tf: 1 },
                        "projet.models.User.is_human": { tf: 1 },
                        "projet.models.User.games": { tf: 1 },
                        "projet.models.User.is_admin": { tf: 1 },
                        "projet.models.User.nb_game_played": { tf: 1 },
                        "projet.models.User.nb_game_win": { tf: 1 },
                        "projet.models.Game": { tf: 1 },
                        "projet.models.Game.__init__": { tf: 1 },
                        "projet.models.Game.size": { tf: 1 },
                        "projet.models.Game.id": { tf: 1 },
                        "projet.models.Game.datetime": { tf: 1 },
                        "projet.models.Game.user_id_1": { tf: 1 },
                        "projet.models.Game.vs_ai": { tf: 1 },
                        "projet.models.Game.board": { tf: 1 },
                        "projet.models.Game.pos_player_1_x": { tf: 1 },
                        "projet.models.Game.pos_player_1_y": { tf: 1 },
                        "projet.models.Game.pos_player_2_x": { tf: 1 },
                        "projet.models.Game.pos_player_2_y": { tf: 1 },
                        "projet.models.Game.current_player": { tf: 1 },
                        "projet.models.Game.board_to_array": { tf: 1 },
                        "projet.models.Game.board_to_string": { tf: 1 },
                        "projet.models.Game.board_array": { tf: 1 },
                        "projet.models.Game.is_finished": { tf: 1 },
                        "projet.models.Game.winner": { tf: 1 },
                        "projet.models.Game.pos_player_1": { tf: 1 },
                        "projet.models.Game.pos_player_2": { tf: 1 },
                        "projet.models.Game.move": { tf: 1 },
                        "projet.models.Qtable": { tf: 1 },
                        "projet.models.Qtable.__init__": { tf: 1 },
                        "projet.models.Qtable.state": { tf: 1 },
                        "projet.models.Qtable.up": { tf: 1 },
                        "projet.models.Qtable.down": { tf: 1 },
                        "projet.models.Qtable.left": { tf: 1 },
                        "projet.models.Qtable.right": { tf: 1 },
                        "projet.models.Qtable.get_quality": { tf: 1 },
                        "projet.models.Qtable.set_quality": { tf: 1 },
                        "projet.models.Qtable.max": { tf: 1 },
                        "projet.models.Qtable.best": { tf: 1 },
                        "projet.models.History": { tf: 1 },
                        "projet.models.History.__init__": { tf: 1 },
                        "projet.models.History.game_id": { tf: 1 },
                        "projet.models.History.current_player": { tf: 1 },
                        "projet.models.History.state": { tf: 1 },
                        "projet.models.History.movement": { tf: 1 },
                        "projet.train": { tf: 1 },
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.start_train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1 },
                        "projet.train.start_test_ai": { tf: 1 },
                        "projet.utils": { tf: 1 },
                        "projet.utils.is_email_valid": { tf: 1 },
                        "projet.utils.fill_paddock": { tf: 1 },
                        "projet.utils.is_movement_valid": { tf: 1 },
                        "projet.utils.move_converted": { tf: 1 },
                        "projet.utils.called": { tf: 1 },
                        "projet.utils.timer": { tf: 1 },
                        "projet.utils.parse_users": { tf: 1 },
                        "projet.utils.user_is_admin": { tf: 1 },
                        "projet.utils.admin_required": { tf: 1 },
                        "projet.utils.beautify_board": { tf: 1 },
                        "projet.utils.state_is_valid": { tf: 1 },
                        "projet.utils.all_valid_movements": { tf: 1 },
                        "projet.utils.state_parsed": { tf: 1 },
                        "projet.utils.state_str": { tf: 1 },
                        "projet.views": { tf: 1 },
                        "projet.views.index": { tf: 1 },
                        "projet.views.game_create": { tf: 1 },
                        "projet.views.display_stat": { tf: 1 },
                        "projet.views.hint": { tf: 1 },
                        "projet.views.game": { tf: 1 },
                        "projet.views.login": { tf: 1 },
                        "projet.views.signup": { tf: 1 },
                        "projet.views.logout": { tf: 1 },
                        "projet.views.dashboard": { tf: 1 },
                        "projet.views.start_train": { tf: 1 },
                        "projet.views.start_test": { tf: 1 },
                      },
                      df: 109,
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                v: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: { "projet.ai.previous_state": { tf: 1 } },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: { "projet.ai.pos_player": { tf: 1 } },
                          df: 1,
                          e: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              _: {
                                1: {
                                  docs: {
                                    "projet.models.Game.pos_player_1": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                  _: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {
                                        "projet.models.Game.pos_player_1_x": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                    i: {
                                      docs: {
                                        "projet.models.Game.pos_player_1_y": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                2: {
                                  docs: {
                                    "projet.models.Game.pos_player_2": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                  _: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {
                                        "projet.models.Game.pos_player_2_x": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                    i: {
                                      docs: {
                                        "projet.models.Game.pos_player_2_y": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                docs: {},
                                df: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: { "projet.models.User.password": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: { "projet.utils.parse_users": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      s: { docs: { "projet.load_user": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
              g: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: { docs: { "projet.views.login": { tf: 1 } }, df: 1 },
                },
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.views.logout": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                t: { docs: { "projet.models.Qtable.left": { tf: 1 } }, df: 1 },
              },
            },
          },
          a: {
            docs: {},
            df: 0,
            i: {
              docs: {
                "projet.ai": { tf: 1 },
                "projet.ai.update_game_finished": { tf: 1 },
                "projet.ai.random_action": { tf: 1 },
                "projet.ai.update_quality": { tf: 1 },
                "projet.ai.update_epsilon": { tf: 1 },
                "projet.ai.update_discount_factor": { tf: 1 },
                "projet.ai.reward": { tf: 1 },
                "projet.ai.previous_state": { tf: 1 },
                "projet.ai.other_player": { tf: 1 },
                "projet.ai.pos_player": { tf: 1 },
                "projet.ai.q_state": { tf: 1 },
                "projet.ai.info": { tf: 1 },
                "projet.ai.set_parameters": { tf: 1 },
                "projet.ai.get_move_random": { tf: 1 },
              },
              df: 14,
            },
            d: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          q: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {
                                    "projet.utils.admin_required": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {},
                            df: 0,
                            _: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  v: {
                                    docs: {
                                      "projet.utils.all_valid_movements": {
                                        tf: 1,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            p: {
              docs: { "projet.models.Qtable.up": { tf: 1 } },
              df: 1,
              d: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        g: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  f: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          s: {
                                            docs: {},
                                            df: 0,
                                            h: {
                                              docs: {
                                                "projet.ai.update_game_finished":
                                                  { tf: 1 },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        q: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: { "projet.ai.update_quality": { tf: 1 } },
                            df: 1,
                          },
                        },
                        e: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {
                                        "projet.ai.update_epsilon": { tf: 1 },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        d: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  u: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {},
                                        df: 0,
                                        _: {
                                          docs: {},
                                          df: 0,
                                          f: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {},
                                                  df: 0,
                                                  o: {
                                                    docs: {},
                                                    df: 0,
                                                    r: {
                                                      docs: {
                                                        "projet.ai.update_discount_factor":
                                                          { tf: 1 },
                                                      },
                                                      df: 1,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "projet.models.User": { tf: 1 },
                    "projet.models.User.__init__": { tf: 1 },
                    "projet.models.User.id": { tf: 1 },
                    "projet.models.User.email": { tf: 1 },
                    "projet.models.User.name": { tf: 1 },
                    "projet.models.User.password": { tf: 1 },
                    "projet.models.User.is_human": { tf: 1 },
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.models.User.nb_game_win": { tf: 1 },
                  },
                  df: 11,
                  _: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        _: {
                          1: {
                            docs: { "projet.models.Game.user_id_1": { tf: 1 } },
                            df: 1,
                          },
                          docs: {},
                          df: 0,
                        },
                      },
                      s: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            d: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {
                                      "projet.utils.user_is_admin": { tf: 1 },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "projet.utils": { tf: 1 },
                    "projet.utils.is_email_valid": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1 },
                    "projet.utils.is_movement_valid": { tf: 1 },
                    "projet.utils.move_converted": { tf: 1 },
                    "projet.utils.called": { tf: 1 },
                    "projet.utils.timer": { tf: 1 },
                    "projet.utils.parse_users": { tf: 1 },
                    "projet.utils.user_is_admin": { tf: 1 },
                    "projet.utils.admin_required": { tf: 1 },
                    "projet.utils.beautify_board": { tf: 1 },
                    "projet.utils.state_is_valid": { tf: 1 },
                    "projet.utils.all_valid_movements": { tf: 1 },
                    "projet.utils.state_parsed": { tf: 1 },
                    "projet.utils.state_str": { tf: 1 },
                  },
                  df: 15,
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.ai.random_action": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    d: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "projet.models.Qtable.right": { tf: 1 } },
                    df: 1,
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            y: {
                              docs: { "projet.ai.other_player": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          q: {
            docs: {},
            df: 0,
            _: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      e: { docs: { "projet.ai.q_state": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models.Qtable": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.Qtable.up": { tf: 1 },
                      "projet.models.Qtable.down": { tf: 1 },
                      "projet.models.Qtable.left": { tf: 1 },
                      "projet.models.Qtable.right": { tf: 1 },
                      "projet.models.Qtable.get_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1 },
                      "projet.models.Qtable.best": { tf: 1 },
                    },
                    df: 11,
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                o: { docs: { "projet.ai.info": { tf: 1 } }, df: 1 },
              },
              v: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                          docs: {},
                                          df: 0,
                                          x: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                p: {
                                                  docs: {},
                                                  df: 0,
                                                  t: {
                                                    docs: {
                                                      "projet.exceptions.InvalidPositionException":
                                                        { tf: 1 },
                                                      "projet.exceptions.InvalidPositionException.__init__":
                                                        { tf: 1 },
                                                    },
                                                    df: 2,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          l: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              y: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      x: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "projet.exceptions.InvalidPlayerException":
                                                    { tf: 1 },
                                                  "projet.exceptions.InvalidPlayerException.__init__":
                                                    { tf: 1 },
                                                },
                                                df: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        m: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {
                                              "projet.exceptions.InvalidMoveException":
                                                { tf: 1 },
                                              "projet.exceptions.InvalidMoveException.__init__":
                                                { tf: 1 },
                                            },
                                            df: 2,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      x: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "projet.exceptions.InvalidActionException":
                                                    { tf: 1 },
                                                  "projet.exceptions.InvalidActionException.__init__":
                                                    { tf: 1 },
                                                },
                                                df: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {},
                      df: 0,
                      b: {
                        docs: { "projet.models.init_db": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  x: { docs: { "projet.views.index": { tf: 1 } }, df: 1 },
                },
              },
            },
            d: {
              docs: {
                "projet.models.User.id": { tf: 1 },
                "projet.models.Game.id": { tf: 1 },
              },
              df: 2,
            },
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: { "projet.models.User.is_human": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
                a: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: { "projet.models.User.is_admin": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
                f: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          h: {
                            docs: {
                              "projet.models.Game.is_finished": { tf: 1 },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.is_email_valid": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                m: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    v: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  v: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          d: {
                                            docs: {
                                              "projet.utils.is_movement_valid":
                                                { tf: 1 },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: { "projet.ai.set_parameters": { tf: 1 } },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  q: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {
                            "projet.models.Qtable.set_quality": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              z: {
                docs: {},
                df: 0,
                e: { docs: { "projet.models.Game.size": { tf: 1 } }, df: 1 },
              },
              g: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    p: { docs: { "projet.views.signup": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.History.state": { tf: 1 },
                    },
                    df: 2,
                    _: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.state_is_valid": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      p: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: { "projet.utils.state_parsed": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: { "projet.utils.state_str": { tf: 1 } },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: { "projet.views.start_train": { tf: 1 } },
                                df: 1,
                                _: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {
                                        "projet.train.start_train_ai": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        e: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.views.start_test": { tf: 1 } },
                              df: 1,
                              _: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {
                                      "projet.train.start_test_ai": { tf: 1 },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          g: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      m: {
                                        docs: {
                                          "projet.ai.get_move_random": {
                                            tf: 1,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  q: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {
                            "projet.models.Qtable.get_quality": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.__init__": { tf: 1 },
                    "projet.models.Game.size": { tf: 1 },
                    "projet.models.Game.id": { tf: 1 },
                    "projet.models.Game.datetime": { tf: 1 },
                    "projet.models.Game.user_id_1": { tf: 1 },
                    "projet.models.Game.vs_ai": { tf: 1 },
                    "projet.models.Game.board": { tf: 1 },
                    "projet.models.Game.pos_player_1_x": { tf: 1 },
                    "projet.models.Game.pos_player_1_y": { tf: 1 },
                    "projet.models.Game.pos_player_2_x": { tf: 1 },
                    "projet.models.Game.pos_player_2_y": { tf: 1 },
                    "projet.models.Game.current_player": { tf: 1 },
                    "projet.models.Game.board_to_array": { tf: 1 },
                    "projet.models.Game.board_to_string": { tf: 1 },
                    "projet.models.Game.board_array": { tf: 1 },
                    "projet.models.Game.is_finished": { tf: 1 },
                    "projet.models.Game.winner": { tf: 1 },
                    "projet.models.Game.pos_player_1": { tf: 1 },
                    "projet.models.Game.pos_player_2": { tf: 1 },
                    "projet.models.Game.move": { tf: 1 },
                    "projet.views.game": { tf: 1 },
                  },
                  df: 23,
                  f: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            h: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    x: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {
                                                "projet.exceptions.GameFinishedException":
                                                  { tf: 1 },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  _: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: { "projet.models.History.game_id": { tf: 1 } },
                        df: 1,
                      },
                    },
                    c: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: { "projet.views.game_create": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            x: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "projet.exceptions": { tf: 1 },
                        "projet.exceptions.InvalidPositionException": { tf: 1 },
                        "projet.exceptions.InvalidPositionException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.InvalidPlayerException": { tf: 1 },
                        "projet.exceptions.InvalidPlayerException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.GameFinishedException": { tf: 1 },
                        "projet.exceptions.InvalidMoveException": { tf: 1 },
                        "projet.exceptions.InvalidMoveException.__init__": {
                          tf: 1,
                        },
                        "projet.exceptions.InvalidActionException": { tf: 1 },
                        "projet.exceptions.InvalidActionException.__init__": {
                          tf: 1,
                        },
                      },
                      df: 10,
                    },
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  l: { docs: { "projet.models.User.email": { tf: 1 } }, df: 1 },
                },
              },
            },
          },
          _: {
            docs: {},
            df: 0,
            _: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {
                            "projet.exceptions.InvalidPositionException.__init__":
                              { tf: 1 },
                            "projet.exceptions.InvalidPlayerException.__init__":
                              { tf: 1 },
                            "projet.exceptions.InvalidMoveException.__init__": {
                              tf: 1,
                            },
                            "projet.exceptions.InvalidActionException.__init__":
                              { tf: 1 },
                            "projet.models.User.__init__": { tf: 1 },
                            "projet.models.Game.__init__": { tf: 1 },
                            "projet.models.Qtable.__init__": { tf: 1 },
                            "projet.models.History.__init__": { tf: 1 },
                          },
                          df: 8,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models": { tf: 1 },
                      "projet.models.init_db": { tf: 1 },
                      "projet.models.User": { tf: 1 },
                      "projet.models.User.__init__": { tf: 1 },
                      "projet.models.User.id": { tf: 1 },
                      "projet.models.User.email": { tf: 1 },
                      "projet.models.User.name": { tf: 1 },
                      "projet.models.User.password": { tf: 1 },
                      "projet.models.User.is_human": { tf: 1 },
                      "projet.models.User.games": { tf: 1 },
                      "projet.models.User.is_admin": { tf: 1 },
                      "projet.models.User.nb_game_played": { tf: 1 },
                      "projet.models.User.nb_game_win": { tf: 1 },
                      "projet.models.Game": { tf: 1 },
                      "projet.models.Game.__init__": { tf: 1 },
                      "projet.models.Game.size": { tf: 1 },
                      "projet.models.Game.id": { tf: 1 },
                      "projet.models.Game.datetime": { tf: 1 },
                      "projet.models.Game.user_id_1": { tf: 1 },
                      "projet.models.Game.vs_ai": { tf: 1 },
                      "projet.models.Game.board": { tf: 1 },
                      "projet.models.Game.pos_player_1_x": { tf: 1 },
                      "projet.models.Game.pos_player_1_y": { tf: 1 },
                      "projet.models.Game.pos_player_2_x": { tf: 1 },
                      "projet.models.Game.pos_player_2_y": { tf: 1 },
                      "projet.models.Game.current_player": { tf: 1 },
                      "projet.models.Game.board_to_array": { tf: 1 },
                      "projet.models.Game.board_to_string": { tf: 1 },
                      "projet.models.Game.board_array": { tf: 1 },
                      "projet.models.Game.is_finished": { tf: 1 },
                      "projet.models.Game.winner": { tf: 1 },
                      "projet.models.Game.pos_player_1": { tf: 1 },
                      "projet.models.Game.pos_player_2": { tf: 1 },
                      "projet.models.Game.move": { tf: 1 },
                      "projet.models.Qtable": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.Qtable.up": { tf: 1 },
                      "projet.models.Qtable.down": { tf: 1 },
                      "projet.models.Qtable.left": { tf: 1 },
                      "projet.models.Qtable.right": { tf: 1 },
                      "projet.models.Qtable.get_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1 },
                      "projet.models.Qtable.best": { tf: 1 },
                      "projet.models.History": { tf: 1 },
                      "projet.models.History.__init__": { tf: 1 },
                      "projet.models.History.game_id": { tf: 1 },
                      "projet.models.History.current_player": { tf: 1 },
                      "projet.models.History.state": { tf: 1 },
                      "projet.models.History.movement": { tf: 1 },
                    },
                    df: 51,
                  },
                },
              },
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: { "projet.models.Game.move": { tf: 1 } },
                  df: 1,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: { "projet.models.History.movement": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                  _: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          v: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "projet.utils.move_converted": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              x: { docs: { "projet.models.Qtable.max": { tf: 1 } }, df: 1 },
            },
          },
          n: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: { docs: { "projet.models.User.name": { tf: 1 } }, df: 1 },
              },
            },
            b: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "projet.models.User.nb_game_played": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                          w: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {
                                  "projet.models.User.nb_game_win": { tf: 1 },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          d: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: { "projet.models.Game.datetime": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: { "projet.views.dashboard": { tf: 1 } },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                n: { docs: { "projet.models.Qtable.down": { tf: 1 } }, df: 1 },
              },
            },
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      y: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "projet.views.display_stat": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  i: { docs: { "projet.models.Game.vs_ai": { tf: 1 } }, df: 1 },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                w: {
                  docs: {
                    "projet.views": { tf: 1 },
                    "projet.views.index": { tf: 1 },
                    "projet.views.game_create": { tf: 1 },
                    "projet.views.display_stat": { tf: 1 },
                    "projet.views.hint": { tf: 1 },
                    "projet.views.game": { tf: 1 },
                    "projet.views.login": { tf: 1 },
                    "projet.views.signup": { tf: 1 },
                    "projet.views.logout": { tf: 1 },
                    "projet.views.dashboard": { tf: 1 },
                    "projet.views.start_train": { tf: 1 },
                    "projet.views.start_test": { tf: 1 },
                  },
                  df: 12,
                },
              },
            },
          },
          b: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "projet.models.Game.board": { tf: 1 } },
                    df: 1,
                    _: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    y: {
                                      docs: {
                                        "projet.models.Game.board_to_array": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                            s: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {
                                    "projet.models.Game.board_to_string": {
                                      tf: 1,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                      a: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              y: {
                                docs: {
                                  "projet.models.Game.board_array": { tf: 1 },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: { docs: { "projet.models.Qtable.best": { tf: 1 } }, df: 1 },
              },
              a: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      f: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            b: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "projet.utils.beautify_board": {
                                          tf: 1,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            u: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        _: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "projet.models.Game.current_player": {
                                      tf: 1,
                                    },
                                    "projet.models.History.current_player": {
                                      tf: 1,
                                    },
                                  },
                                  df: 2,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: { docs: { "projet.utils.called": { tf: 1 } }, df: 1 },
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.models.Game.winner": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "projet.models.History": { tf: 1 },
                          "projet.models.History.__init__": { tf: 1 },
                          "projet.models.History.game_id": { tf: 1 },
                          "projet.models.History.current_player": { tf: 1 },
                          "projet.models.History.state": { tf: 1 },
                          "projet.models.History.movement": { tf: 1 },
                        },
                        df: 6,
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                t: { docs: { "projet.views.hint": { tf: 1 } }, df: 1 },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.train": { tf: 1 },
                      "projet.train.train_ai": { tf: 1 },
                      "projet.train.start_train_ai": { tf: 1 },
                      "projet.train.test_ai": { tf: 1 },
                      "projet.train.start_test_ai": { tf: 1 },
                    },
                    df: 5,
                    _: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: { "projet.train.train_ai": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      i: { docs: { "projet.train.test_ai": { tf: 1 } }, df: 1 },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: { docs: { "projet.utils.timer": { tf: 1 } }, df: 1 },
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  _: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                k: {
                                  docs: {
                                    "projet.utils.fill_paddock": { tf: 1 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      doc: {
        root: {
          0: {
            0: {
              0: {
                docs: {
                  "projet.ai.update_epsilon": { tf: 1.4142135623730951 },
                  "projet.ai.update_discount_factor": { tf: 1 },
                },
                df: 2,
              },
              docs: {},
              df: 0,
            },
            docs: {
              "projet.ai.update_epsilon": { tf: 1 },
              "projet.ai.update_discount_factor": { tf: 1 },
              "projet.ai.reward": { tf: 1 },
              "projet.models.Game.board": { tf: 1 },
              "projet.models.Game.winner": { tf: 1 },
              "projet.utils.fill_paddock": { tf: 4.58257569495584 },
            },
            df: 6,
          },
          1: {
            0: {
              0: {
                0: {
                  0: {
                    0: {
                      0: {
                        0: {
                          0: {
                            0: {
                              0: {
                                0: {
                                  0: {
                                    0: {
                                      0: {
                                        0: {
                                          0: {
                                            0: {
                                              0: {
                                                0: {
                                                  0: {
                                                    0: {
                                                      0: {
                                                        0: {
                                                          2: {
                                                            0: {
                                                              0: {
                                                                4: {
                                                                  4: {
                                                                    1: {
                                                                      docs: {
                                                                        "projet.models.Qtable":
                                                                          {
                                                                            tf: 1,
                                                                          },
                                                                      },
                                                                      df: 1,
                                                                    },
                                                                    docs: {},
                                                                    df: 0,
                                                                  },
                                                                  docs: {},
                                                                  df: 0,
                                                                },
                                                                docs: {},
                                                                df: 0,
                                                              },
                                                              docs: {},
                                                              df: 0,
                                                            },
                                                            docs: {},
                                                            df: 0,
                                                          },
                                                          docs: {},
                                                          df: 0,
                                                        },
                                                        docs: {},
                                                        df: 0,
                                                      },
                                                      docs: {},
                                                      df: 0,
                                                    },
                                                    docs: {},
                                                    df: 0,
                                                  },
                                                  docs: {},
                                                  df: 0,
                                                },
                                                docs: {},
                                                df: 0,
                                              },
                                              docs: {},
                                              df: 0,
                                            },
                                            docs: {},
                                            df: 0,
                                          },
                                          docs: {},
                                          df: 0,
                                        },
                                        docs: {},
                                        df: 0,
                                      },
                                      docs: {},
                                      df: 0,
                                    },
                                    docs: {},
                                    df: 0,
                                  },
                                  docs: {},
                                  df: 0,
                                },
                                docs: {},
                                df: 0,
                              },
                              docs: {},
                              df: 0,
                            },
                            docs: {},
                            df: 0,
                          },
                          docs: {},
                          df: 0,
                        },
                        docs: {},
                        df: 0,
                      },
                      docs: {},
                      df: 0,
                    },
                    docs: {},
                    df: 0,
                  },
                  docs: {
                    "projet.train.train_ai": { tf: 1 },
                    "projet.train.start_train_ai": { tf: 1 },
                  },
                  df: 2,
                },
                docs: {
                  "projet.train.test_ai": { tf: 1 },
                  "projet.train.start_test_ai": { tf: 1 },
                },
                df: 2,
              },
              docs: { "projet.ai.reward": { tf: 1 } },
              df: 1,
            },
            docs: {
              "projet.ai.update_quality": { tf: 1 },
              "projet.ai.update_epsilon": { tf: 1 },
              "projet.ai.update_discount_factor": { tf: 1 },
              "projet.ai.reward": { tf: 2 },
              "projet.ai.other_player": { tf: 1 },
              "projet.models.Game": { tf: 1.4142135623730951 },
              "projet.models.Game.board": { tf: 1.4142135623730951 },
              "projet.models.Game.pos_player_1_x": { tf: 1 },
              "projet.models.Game.pos_player_1_y": { tf: 1 },
              "projet.models.Game.winner": { tf: 1 },
              "projet.models.Game.pos_player_1": { tf: 1 },
              "projet.utils.fill_paddock": { tf: 4 },
              "projet.utils.state_parsed": { tf: 1 },
            },
            df: 13,
            "'": {
              docs: {
                "projet.models.Game": { tf: 1 },
                "projet.models.Game.user_id_1": { tf: 1 },
                "projet.utils.fill_paddock": { tf: 1 },
              },
              df: 3,
            },
          },
          2: {
            0: { docs: { "projet.ai.update_epsilon": { tf: 1 } }, df: 1 },
            5: {
              docs: { "projet.ai.update_discount_factor": { tf: 1 } },
              df: 1,
            },
            docs: {
              "projet.ai.random_action": { tf: 1 },
              "projet.ai.reward": { tf: 1 },
              "projet.ai.other_player": { tf: 1 },
              "projet.models.Game": { tf: 1.7320508075688772 },
              "projet.models.Game.vs_ai": { tf: 1 },
              "projet.models.Game.board": { tf: 1.4142135623730951 },
              "projet.models.Game.pos_player_2_x": { tf: 1 },
              "projet.models.Game.pos_player_2_y": { tf: 1 },
              "projet.models.Game.winner": { tf: 1 },
              "projet.models.Game.pos_player_2": { tf: 1 },
              "projet.utils.fill_paddock": { tf: 4.242640687119285 },
              "projet.utils.state_parsed": { tf: 1 },
            },
            df: 12,
            "'": {
              docs: {
                "projet.models.Game": { tf: 1 },
                "projet.utils.fill_paddock": { tf: 1 },
              },
              df: 2,
            },
            d: {
              docs: { "projet.utils.fill_paddock": { tf: 1.4142135623730951 } },
              df: 1,
            },
          },
          3: {
            0: { docs: { "projet.models.Qtable": { tf: 1 } }, df: 1 },
            docs: {},
            df: 0,
          },
          5: {
            docs: {
              "projet.ai.reward": { tf: 1 },
              "projet.utils.fill_paddock": { tf: 1 },
            },
            df: 2,
          },
          8: {
            0: { docs: { "projet.ai.update_epsilon": { tf: 1 } }, df: 1 },
            docs: {},
            df: 0,
          },
          docs: {},
          df: 0,
          u: {
            docs: {
              "projet.ai.random_action": { tf: 1 },
              "projet.ai.update_quality": { tf: 1 },
              "projet.models.Qtable.max": { tf: 1 },
              "projet.models.Qtable.best": { tf: 1 },
              "projet.models.History.movement": { tf: 1 },
            },
            df: 5,
            s: {
              docs: {
                "projet.load_user": { tf: 1 },
                "projet.models.User.__init__": { tf: 1 },
                "projet.models.Game.__init__": { tf: 1 },
                "projet.models.Qtable.__init__": { tf: 1 },
                "projet.models.History": { tf: 1 },
                "projet.models.History.__init__": { tf: 1 },
              },
              df: 6,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "projet.load_user": { tf: 2 },
                    "projet.models.User": { tf: 1.4142135623730951 },
                    "projet.models.User.email": { tf: 1 },
                    "projet.models.User.name": { tf: 1 },
                    "projet.models.User.password": { tf: 1 },
                    "projet.models.User.is_human": { tf: 1.4142135623730951 },
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1.4142135623730951 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.models.User.nb_game_win": { tf: 1 },
                    "projet.models.Game": { tf: 1.7320508075688772 },
                    "projet.models.Game.user_id_1": { tf: 1 },
                    "projet.models.Game.vs_ai": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                    "projet.utils.parse_users": { tf: 1.7320508075688772 },
                    "projet.utils.user_is_admin": { tf: 2.23606797749979 },
                    "projet.utils.admin_required": { tf: 1 },
                  },
                  df: 17,
                  _: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: { "projet.load_user": { tf: 1 } },
                        df: 1,
                        _: {
                          1: {
                            docs: { "projet.models.Game": { tf: 1 } },
                            df: 1,
                          },
                          2: {
                            docs: { "projet.models.Game": { tf: 1 } },
                            df: 1,
                          },
                          docs: {},
                          df: 0,
                        },
                      },
                    },
                  },
                  "'": {
                    docs: { "projet.models.User": { tf: 1.7320508075688772 } },
                    df: 1,
                  },
                },
              },
            },
            p: {
              docs: {
                "projet.models.Qtable": { tf: 1 },
                "projet.models.Qtable.up": { tf: 1 },
                "projet.models.Qtable.get_quality": { tf: 1 },
                "projet.models.Qtable.set_quality": { tf: 1 },
              },
              df: 4,
              d: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.ai.update_game_finished": {
                        tf: 1.7320508075688772,
                      },
                      "projet.ai.update_quality": { tf: 1 },
                      "projet.ai.update_epsilon": { tf: 1 },
                      "projet.ai.update_discount_factor": { tf: 1 },
                      "projet.models.Game.move": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 1.7320508075688772 },
                    },
                    df: 6,
                  },
                },
              },
            },
          },
          l: {
            docs: {
              "projet.ai.random_action": { tf: 1 },
              "projet.ai.update_quality": { tf: 1 },
              "projet.models.Qtable.max": { tf: 1 },
              "projet.models.Qtable.best": { tf: 1 },
              "projet.models.History.movement": { tf: 1 },
            },
            df: 5,
            o: {
              docs: {},
              df: 0,
              g: {
                docs: {
                  "projet.utils.called": { tf: 1.4142135623730951 },
                  "projet.utils.timer": { tf: 1 },
                },
                df: 2,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.load_user": { tf: 1 },
                      "projet.views.login": { tf: 1 },
                    },
                    df: 2,
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.views.logout": { tf: 1 } }, df: 1 },
                  },
                },
              },
              a: {
                docs: {},
                df: 0,
                d: { docs: { "projet.load_user": { tf: 1 } }, df: 1 },
              },
              n: {
                docs: {},
                df: 0,
                g: {
                  docs: { "projet.ai.update_discount_factor": { tf: 1 } },
                  df: 1,
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.ai.update_game_finished": { tf: 1 },
                    "projet.models.History": { tf: 1 },
                  },
                  df: 2,
                },
              },
              u: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    h: {
                      docs: {
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.models.Qtable.max": { tf: 1.4142135623730951 },
                    "projet.models.Qtable.best": { tf: 1.4142135623730951 },
                    "projet.utils.parse_users": { tf: 1.7320508075688772 },
                  },
                  df: 3,
                  "[": {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            "[": {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {
                                      "projet.ai.random_action": { tf: 1 },
                                      "projet.utils.is_movement_valid": {
                                        tf: 1,
                                      },
                                      "projet.utils.beautify_board": { tf: 1 },
                                      "projet.utils.all_valid_movements": {
                                        tf: 1,
                                      },
                                    },
                                    df: 4,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    s: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {
                            "projet.utils.all_valid_movements": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                e: {
                  docs: { "projet.ai.q_state": { tf: 1.4142135623730951 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.ai.update_quality": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.ai.reward": { tf: 1 },
                      "projet.ai.previous_state": { tf: 1 },
                      "projet.ai.info": { tf: 1 },
                    },
                    df: 3,
                  },
                },
              },
              f: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.models.Qtable": { tf: 1 },
                    "projet.models.Qtable.left": { tf: 1 },
                    "projet.models.Qtable.get_quality": { tf: 1 },
                    "projet.models.Qtable.set_quality": { tf: 1 },
                  },
                  df: 4,
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  g: { docs: { "projet.load_user": { tf: 1 } }, df: 1 },
                },
              },
              x: {
                docs: {
                  "projet.ai.update_discount_factor": { tf: 1 },
                  "projet.models.Qtable.max": { tf: 1.7320508075688772 },
                },
                df: 2,
              },
              p: {
                docs: {
                  "projet.models.User.__init__": { tf: 1 },
                  "projet.models.Game.__init__": { tf: 1 },
                  "projet.models.Qtable.__init__": { tf: 1 },
                  "projet.models.History.__init__": { tf: 1 },
                },
                df: 4,
              },
            },
            e: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: { "projet.ai.update_game_finished": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.ai.set_parameters": { tf: 1.7320508075688772 },
                    "projet.train.start_train_ai": { tf: 1 },
                    "projet.train.start_test_ai": { tf: 1 },
                  },
                  df: 3,
                  l: {
                    docs: {
                      "projet.models.User": { tf: 1 },
                      "projet.models.Game": { tf: 1 },
                      "projet.models.Qtable": { tf: 1 },
                    },
                    df: 3,
                  },
                },
              },
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.exceptions.InvalidPositionException": { tf: 1 },
                    "projet.exceptions.InvalidMoveException": {
                      tf: 1.7320508075688772,
                    },
                    "projet.models.Game.move": { tf: 1.7320508075688772 },
                    "projet.models.Qtable.max": { tf: 1.4142135623730951 },
                    "projet.models.Qtable.best": { tf: 1 },
                    "projet.utils.move_converted": { tf: 1 },
                    "projet.views.game": { tf: 1 },
                  },
                  df: 7,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "projet.ai.get_move_random": {
                              tf: 1.4142135623730951,
                            },
                            "projet.models.Qtable.max": { tf: 1 },
                            "projet.models.History.movement": { tf: 1 },
                            "projet.utils.is_movement_valid": {
                              tf: 1.7320508075688772,
                            },
                            "projet.utils.all_valid_movements": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 5,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          d: {
            docs: {
              "projet.ai.random_action": { tf: 1 },
              "projet.ai.update_quality": { tf: 1 },
              "projet.models.Qtable.max": { tf: 1 },
              "projet.models.Qtable.best": { tf: 1 },
              "projet.models.History.movement": { tf: 1 },
            },
            df: 5,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {
                          "projet.load_user": { tf: 1 },
                          "projet.ai.previous_state": { tf: 1 },
                          "projet.models.init_db": { tf: 1 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
                e: {
                  docs: {
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.datetime": { tf: 1 },
                  },
                  df: 2,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {
                          "projet.models.Game": { tf: 1.4142135623730951 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: { "projet.views.dashboard": { tf: 1 } },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.ai.random_action": { tf: 1 },
                          "projet.models.Qtable.max": { tf: 1 },
                          "projet.models.Qtable.best": { tf: 1 },
                          "projet.train.train_ai": { tf: 1 },
                          "projet.train.start_train_ai": { tf: 1 },
                          "projet.train.test_ai": { tf: 1 },
                          "projet.train.start_test_ai": { tf: 1 },
                          "projet.utils.fill_paddock": { tf: 1 },
                        },
                        df: 8,
                      },
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "projet.utils.called": { tf: 1 },
                      "projet.utils.timer": { tf: 1 },
                      "projet.utils.admin_required": { tf: 1 },
                    },
                    df: 3,
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.update_quality": { tf: 1 },
                        "projet.models.Qtable": { tf: 2 },
                        "projet.models.Qtable.up": { tf: 1 },
                        "projet.models.Qtable.down": { tf: 1 },
                        "projet.models.Qtable.left": { tf: 1 },
                        "projet.models.Qtable.right": { tf: 1 },
                        "projet.utils.move_converted": {
                          tf: 1.7320508075688772,
                        },
                      },
                      df: 8,
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "projet.ai.update_discount_factor": { tf: 1 },
                          },
                          df: 1,
                          _: {
                            docs: {},
                            df: 0,
                            f: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                c: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      r: {
                                        docs: {
                                          "projet.ai.update_discount_factor": {
                                            tf: 1,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "projet.ai.update_discount_factor": { tf: 1 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              f: {
                docs: {},
                df: 0,
                f: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.utils.fill_paddock": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                p: { docs: { "projet.ai.update_epsilon": { tf: 1 } }, df: 1 },
              },
            },
            o: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models.Game.board_to_array": { tf: 1 },
                      "projet.models.Game.board_array": { tf: 1 },
                    },
                    df: 2,
                  },
                },
              },
              w: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "projet.models.Qtable": { tf: 1 },
                    "projet.models.Qtable.down": { tf: 1 },
                    "projet.models.Qtable.get_quality": { tf: 1 },
                    "projet.models.Qtable.set_quality": { tf: 1 },
                  },
                  df: 4,
                },
              },
            },
            b: { docs: { "projet.utils.state_str": { tf: 1 } }, df: 1 },
          },
          i: {
            docs: {},
            df: 0,
            d: {
              docs: {
                "projet.load_user": { tf: 1.7320508075688772 },
                "projet.ai.previous_state": { tf: 1 },
                "projet.models.Game": { tf: 1.4142135623730951 },
                "projet.models.Game.user_id_1": { tf: 1 },
                "projet.models.History.game_id": { tf: 1 },
                "projet.views.game": { tf: 1 },
              },
              df: 6,
            },
            n: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "projet.load_user": { tf: 1 },
                  "projet.ai.random_action": { tf: 1.4142135623730951 },
                  "projet.ai.reward": { tf: 1 },
                  "projet.ai.previous_state": { tf: 1.4142135623730951 },
                  "projet.ai.other_player": { tf: 1.4142135623730951 },
                  "projet.ai.pos_player": { tf: 1.7320508075688772 },
                  "projet.ai.get_move_random": { tf: 1.4142135623730951 },
                  "projet.exceptions.InvalidPositionException": {
                    tf: 1.4142135623730951,
                  },
                  "projet.exceptions.InvalidPlayerException": { tf: 1 },
                  "projet.exceptions.InvalidMoveException": {
                    tf: 1.4142135623730951,
                  },
                  "projet.models.Game": { tf: 2.6457513110645907 },
                  "projet.models.Game.winner": { tf: 1 },
                  "projet.models.Game.move": { tf: 1 },
                  "projet.models.Qtable": { tf: 2 },
                  "projet.models.Qtable.get_quality": { tf: 1 },
                  "projet.train.train_ai": { tf: 1 },
                  "projet.train.start_train_ai": { tf: 1 },
                  "projet.train.test_ai": { tf: 1 },
                  "projet.train.start_test_ai": { tf: 1 },
                  "projet.utils.fill_paddock": { tf: 1 },
                  "projet.utils.is_movement_valid": { tf: 1 },
                  "projet.utils.all_valid_movements": { tf: 1 },
                  "projet.utils.state_parsed": { tf: 1.7320508075688772 },
                  "projet.views.game": { tf: 1 },
                },
                df: 24,
              },
              v: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {
                          "projet.exceptions.InvalidPositionException": {
                            tf: 1,
                          },
                          "projet.exceptions.InvalidPlayerException": {
                            tf: 1.4142135623730951,
                          },
                          "projet.exceptions.InvalidMoveException": { tf: 1 },
                          "projet.exceptions.InvalidActionException": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 4,
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      x: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "projet.models.Qtable.get_quality":
                                                    { tf: 1 },
                                                  "projet.models.Qtable.set_quality":
                                                    { tf: 1 },
                                                },
                                                df: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "projet.models.init_db": { tf: 1 },
                      "projet.models.User.__init__": { tf: 1 },
                      "projet.models.Game.__init__": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.History.__init__": { tf: 1 },
                    },
                    df: 5,
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {
                          "projet.models.User.__init__": { tf: 1 },
                          "projet.models.Game.__init__": { tf: 1 },
                          "projet.models.Qtable.__init__": { tf: 1 },
                          "projet.models.History.__init__": { tf: 1 },
                        },
                        df: 4,
                        e: {
                          docs: {},
                          df: 0,
                          "'": {
                            docs: {
                              "projet.models.User.__init__": { tf: 1 },
                              "projet.models.Game.__init__": { tf: 1 },
                              "projet.models.Qtable.__init__": { tf: 1 },
                              "projet.models.History.__init__": { tf: 1 },
                            },
                            df: 4,
                          },
                        },
                      },
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "projet.models.User.id": { tf: 1 },
                              "projet.models.Game.id": { tf: 1 },
                            },
                            df: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
              f: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "projet.train.train_ai": { tf: 1 },
                        "projet.utils.state_parsed": { tf: 1 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.utils.is_email_valid": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 1 },
                    },
                    df: 2,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              "'": {
                docs: { "projet.ai.update_game_finished": { tf: 1 } },
                df: 1,
              },
            },
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        n: { docs: { "projet.models.User": { tf: 1 } }, df: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
          a: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              g: {
                docs: {
                  "projet.load_user": { tf: 1 },
                  "projet.ai.update_game_finished": { tf: 1 },
                  "projet.ai.random_action": { tf: 1 },
                  "projet.ai.update_quality": { tf: 1 },
                  "projet.ai.reward": { tf: 1 },
                  "projet.ai.previous_state": { tf: 1 },
                  "projet.ai.other_player": { tf: 1 },
                  "projet.ai.pos_player": { tf: 1 },
                  "projet.ai.q_state": { tf: 1 },
                  "projet.ai.set_parameters": { tf: 1 },
                  "projet.ai.get_move_random": { tf: 1 },
                  "projet.models.User": { tf: 1 },
                  "projet.models.Game": { tf: 1 },
                  "projet.models.Game.move": { tf: 1 },
                  "projet.models.Qtable": { tf: 1 },
                  "projet.models.Qtable.get_quality": { tf: 1 },
                  "projet.models.Qtable.set_quality": { tf: 1 },
                  "projet.models.Qtable.max": { tf: 1 },
                  "projet.models.Qtable.best": { tf: 1 },
                  "projet.train.train_ai": { tf: 1 },
                  "projet.train.start_train_ai": { tf: 1 },
                  "projet.train.test_ai": { tf: 1 },
                  "projet.train.start_test_ai": { tf: 1 },
                  "projet.utils.is_email_valid": { tf: 1 },
                  "projet.utils.fill_paddock": { tf: 1 },
                  "projet.utils.is_movement_valid": { tf: 1 },
                  "projet.utils.move_converted": { tf: 1 },
                  "projet.utils.called": { tf: 1 },
                  "projet.utils.parse_users": { tf: 1 },
                  "projet.utils.user_is_admin": { tf: 1 },
                  "projet.utils.beautify_board": { tf: 1 },
                  "projet.utils.state_is_valid": { tf: 1 },
                  "projet.utils.all_valid_movements": { tf: 1 },
                  "projet.utils.state_parsed": { tf: 1 },
                  "projet.utils.state_str": { tf: 1 },
                  "projet.views.game": { tf: 1 },
                },
                df: 36,
              },
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  y: {
                    docs: {
                      "projet.models.Game.board_to_array": { tf: 1 },
                      "projet.models.Game.board_array": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                    },
                    df: 3,
                  },
                },
              },
            },
            c: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.update_quality": { tf: 1.4142135623730951 },
                        "projet.ai.reward": { tf: 1 },
                        "projet.exceptions.InvalidActionException": {
                          tf: 1.7320508075688772,
                        },
                        "projet.models.Qtable.get_quality": {
                          tf: 2.23606797749979,
                        },
                        "projet.models.Qtable.set_quality": { tf: 2 },
                        "projet.models.Qtable.max": { tf: 1.4142135623730951 },
                        "projet.models.Qtable.best": { tf: 1.4142135623730951 },
                      },
                      df: 8,
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: { "projet.ai.set_parameters": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              p: { docs: { "projet.ai.set_parameters": { tf: 1 } }, df: 1 },
            },
            t: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    b: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "projet.exceptions.InvalidPositionException": {
                              tf: 1,
                            },
                            "projet.exceptions.InvalidPlayerException": {
                              tf: 1,
                            },
                            "projet.exceptions.InvalidMoveException": { tf: 1 },
                            "projet.exceptions.InvalidActionException": {
                              tf: 1,
                            },
                            "projet.models.User.__init__": {
                              tf: 1.4142135623730951,
                            },
                            "projet.models.Game.__init__": {
                              tf: 1.4142135623730951,
                            },
                            "projet.models.Qtable.__init__": {
                              tf: 1.4142135623730951,
                            },
                            "projet.models.History.__init__": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 8,
                        },
                      },
                    },
                  },
                },
              },
            },
            d: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.models.User": { tf: 1 },
                      "projet.models.User.is_admin": { tf: 1.4142135623730951 },
                      "projet.utils.user_is_admin": { tf: 1.4142135623730951 },
                      "projet.utils.admin_required": { tf: 1 },
                    },
                    df: 4,
                    _: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: { "projet.models.User.is_admin": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              d: {
                docs: {
                  "projet.models.User.is_admin": { tf: 1.4142135623730951 },
                },
                df: 1,
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {
                      "projet.models.User.__init__": { tf: 1.4142135623730951 },
                      "projet.models.Game.__init__": { tf: 1.4142135623730951 },
                      "projet.models.Qtable.__init__": {
                        tf: 1.4142135623730951,
                      },
                      "projet.models.History.__init__": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 4,
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                o: {
                  docs: {
                    "projet.models.User.id": { tf: 1 },
                    "projet.models.Game.id": { tf: 1 },
                  },
                  df: 2,
                },
                h: {
                  docs: {
                    "projet.views.game_create": { tf: 1 },
                    "projet.views.game": { tf: 1 },
                    "projet.views.logout": { tf: 1 },
                  },
                  df: 3,
                },
              },
            },
            i: {
              docs: {
                "projet.models.Game": { tf: 1 },
                "projet.models.Game.vs_ai": { tf: 1 },
                "projet.models.History": { tf: 1 },
                "projet.train.train_ai": { tf: 1.4142135623730951 },
                "projet.train.start_train_ai": { tf: 1.4142135623730951 },
                "projet.train.test_ai": { tf: 1.4142135623730951 },
                "projet.train.start_test_ai": { tf: 1.4142135623730951 },
              },
              df: 7,
            },
            n: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                w: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.utils.fill_paddock": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {
              "projet.ai.random_action": { tf: 1 },
              "projet.ai.update_quality": { tf: 1 },
              "projet.models.Qtable.max": { tf: 1 },
              "projet.models.Qtable.best": { tf: 1 },
              "projet.models.History.movement": { tf: 1 },
            },
            df: 5,
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "projet.load_user": { tf: 1 },
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.reward": { tf: 1 },
                        "projet.ai.previous_state": { tf: 1 },
                        "projet.ai.other_player": { tf: 1 },
                        "projet.ai.pos_player": { tf: 1.4142135623730951 },
                        "projet.ai.q_state": { tf: 1.4142135623730951 },
                        "projet.ai.info": { tf: 1 },
                        "projet.ai.get_move_random": { tf: 1.4142135623730951 },
                        "projet.models.Game.is_finished": {
                          tf: 1.4142135623730951,
                        },
                        "projet.models.Game.winner": { tf: 1.4142135623730951 },
                        "projet.models.Game.pos_player_1": {
                          tf: 1.4142135623730951,
                        },
                        "projet.models.Game.pos_player_2": {
                          tf: 1.4142135623730951,
                        },
                        "projet.models.Qtable.get_quality": {
                          tf: 1.4142135623730951,
                        },
                        "projet.models.Qtable.max": { tf: 1.7320508075688772 },
                        "projet.models.Qtable.best": { tf: 1.4142135623730951 },
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.start_train_ai": {
                          tf: 1.4142135623730951,
                        },
                        "projet.train.test_ai": { tf: 1 },
                        "projet.train.start_test_ai": {
                          tf: 1.4142135623730951,
                        },
                        "projet.utils.is_email_valid": { tf: 1 },
                        "projet.utils.fill_paddock": { tf: 1 },
                        "projet.utils.move_converted": { tf: 1 },
                        "projet.utils.parse_users": { tf: 1 },
                        "projet.utils.user_is_admin": { tf: 1 },
                        "projet.utils.beautify_board": { tf: 1 },
                        "projet.utils.state_is_valid": { tf: 1 },
                        "projet.utils.all_valid_movements": {
                          tf: 1.4142135623730951,
                        },
                        "projet.utils.state_parsed": { tf: 1 },
                        "projet.utils.state_str": { tf: 1 },
                      },
                      df: 30,
                    },
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {
                          "projet.ai.q_state": { tf: 1 },
                          "projet.utils.state_parsed": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
              w: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {
                        "projet.ai.update_quality": { tf: 1.7320508075688772 },
                        "projet.ai.reward": { tf: 1.7320508075688772 },
                        "projet.models.Qtable.set_quality": { tf: 2 },
                        "projet.models.Qtable.max": { tf: 1 },
                      },
                      df: 4,
                    },
                  },
                },
              },
              a: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: { "projet.ai.update_discount_factor": { tf: 1 } },
                    df: 1,
                  },
                },
                d: {
                  docs: {
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.models.User.nb_game_win": { tf: 1 },
                  },
                  df: 4,
                },
              },
              l: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            h: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                p: {
                                  docs: {
                                    "projet.models.User.__init__": { tf: 1 },
                                    "projet.models.Game.__init__": { tf: 1 },
                                    "projet.models.Qtable.__init__": { tf: 1 },
                                    "projet.models.History.__init__": { tf: 1 },
                                  },
                                  df: 4,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: { "projet.utils.move_converted": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
              q: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "projet.views.game_create": { tf: 1 },
                        "projet.views.game": { tf: 1 },
                        "projet.views.logout": { tf: 1 },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.get_move_random": { tf: 1.4142135623730951 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                s: {
                  docs: {
                    "projet.exceptions.InvalidPositionException": { tf: 1 },
                    "projet.exceptions.InvalidPlayerException": { tf: 1 },
                    "projet.exceptions.GameFinishedException": { tf: 1 },
                    "projet.exceptions.InvalidMoveException": { tf: 1 },
                    "projet.exceptions.InvalidActionException": { tf: 1 },
                    "projet.models.Qtable.get_quality": { tf: 1 },
                    "projet.models.Qtable.set_quality": { tf: 1 },
                  },
                  df: 7,
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.models.Qtable": { tf: 1 },
                      "projet.models.Qtable.right": { tf: 1 },
                      "projet.models.Qtable.get_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                    },
                    df: 4,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                t: { docs: { "projet.views.index": { tf: 1 } }, df: 1 },
              },
              u: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.views.index": { tf: 1 },
                    "projet.views.login": { tf: 1 },
                    "projet.views.signup": { tf: 1 },
                    "projet.views.logout": { tf: 1 },
                  },
                  df: 4,
                },
              },
            },
          },
          g: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.load_user": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1.4142135623730951 },
                    },
                    df: 2,
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.ai.update_game_finished": { tf: 2 },
                    "projet.ai.update_epsilon": { tf: 1.4142135623730951 },
                    "projet.ai.update_discount_factor": { tf: 1 },
                    "projet.ai.previous_state": { tf: 1 },
                    "projet.ai.pos_player": { tf: 1 },
                    "projet.ai.get_move_random": { tf: 1.4142135623730951 },
                    "projet.exceptions.GameFinishedException": { tf: 1 },
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.models.User.nb_game_win": { tf: 1 },
                    "projet.models.Game": { tf: 1.4142135623730951 },
                    "projet.models.Game.datetime": { tf: 1 },
                    "projet.models.Game.is_finished": {
                      tf: 1.4142135623730951,
                    },
                    "projet.models.Game.winner": { tf: 1 },
                    "projet.models.Qtable": { tf: 1 },
                    "projet.models.Qtable.state": { tf: 1 },
                    "projet.models.History.game_id": { tf: 1 },
                    "projet.models.History.state": { tf: 1 },
                    "projet.train.train_ai": { tf: 1.4142135623730951 },
                    "projet.train.start_train_ai": { tf: 1 },
                    "projet.train.test_ai": { tf: 1.4142135623730951 },
                    "projet.train.start_test_ai": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1 },
                    "projet.utils.state_str": { tf: 1.7320508075688772 },
                    "projet.views.game_create": { tf: 1 },
                    "projet.views.game": { tf: 1.7320508075688772 },
                  },
                  df: 26,
                  _: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.ai.update_game_finished": { tf: 1 },
                          "projet.ai.pos_player": { tf: 1 },
                          "projet.ai.get_move_random": { tf: 1 },
                          "projet.utils.state_str": { tf: 1 },
                        },
                        df: 4,
                      },
                    },
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {
                          "projet.ai.previous_state": { tf: 1 },
                          "projet.views.game": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                  s: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.ai.pos_player": { tf: 1 } }, df: 1 },
                  },
                  i: {
                    docs: {},
                    df: 0,
                    d: { docs: { "projet.models.History": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "projet.ai.update_epsilon": { tf: 1 },
                        "projet.ai.update_discount_factor": { tf: 1 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
            t: {
              docs: { "projet.models.Qtable": { tf: 1.4142135623730951 } },
              df: 1,
            },
            e: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "projet.train.start_train_ai": { tf: 1.4142135623730951 },
                      "projet.train.start_test_ai": { tf: 1.4142135623730951 },
                    },
                    df: 2,
                  },
                },
              },
            },
          },
          q: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.ai.update_game_finished": { tf: 1 },
                      "projet.ai.update_quality": { tf: 1.4142135623730951 },
                      "projet.ai.q_state": { tf: 1.7320508075688772 },
                      "projet.models.Qtable": { tf: 1 },
                    },
                    df: 4,
                  },
                },
              },
            },
            "[": {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                ",": {
                  docs: {},
                  df: 0,
                  a: { docs: { "projet.ai.update_quality": { tf: 2 } }, df: 1 },
                },
              },
            },
            _: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.ai.update_quality": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {},
                    df: 0,
                    _: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: { "projet.ai.update_quality": { tf: 1 } },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "projet.models.Qtable": { tf: 2 },
                          "projet.models.Qtable.up": { tf: 1 },
                          "projet.models.Qtable.down": { tf: 1 },
                          "projet.models.Qtable.left": { tf: 1 },
                          "projet.models.Qtable.right": { tf: 1 },
                          "projet.models.Qtable.get_quality": {
                            tf: 1.7320508075688772,
                          },
                          "projet.models.Qtable.max": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 7,
                      },
                    },
                  },
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "projet.train.train_ai": { tf: 1 } },
                    df: 1,
                    h: {
                      docs: {
                        "projet.ai.update_game_finished": { tf: 1 },
                        "projet.exceptions.GameFinishedException": { tf: 1 },
                        "projet.models.Game.is_finished": {
                          tf: 1.4142135623730951,
                        },
                        "projet.models.Game.winner": { tf: 1 },
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1 },
                      },
                      df: 6,
                    },
                  },
                },
                a: {
                  docs: {},
                  df: 0,
                  l: { docs: { "projet.train.test_ai": { tf: 1 } }, df: 1 },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                c: {
                  docs: { "projet.ai.update_game_finished": { tf: 1 } },
                  df: 1,
                },
                m: {
                  docs: { "projet.utils.state_is_valid": { tf: 1 } },
                  df: 1,
                  u: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {
                          "projet.ai.update_epsilon": { tf: 1 },
                          "projet.ai.update_discount_factor": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "projet.models.Game.board": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.ai.update_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1 },
                    },
                    df: 3,
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "projet.ai.update_discount_factor": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              l: {
                docs: {},
                df: 0,
                s: {
                  docs: {
                    "projet.models.User": { tf: 1 },
                    "projet.models.User.is_human": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1 },
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.vs_ai": { tf: 1 },
                    "projet.models.Game.is_finished": { tf: 1 },
                    "projet.utils.is_email_valid": { tf: 1 },
                    "projet.utils.user_is_admin": { tf: 1 },
                  },
                  df: 8,
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                c: {
                  docs: { "projet.utils.called": { tf: 1 } },
                  df: 1,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "projet.utils.called": { tf: 1.7320508075688772 },
                            "projet.utils.timer": { tf: 1 },
                          },
                          df: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          s: {
            docs: {
              "projet.models.Game.pos_player_1": { tf: 1 },
              "projet.models.Game.pos_player_2": { tf: 1 },
            },
            df: 2,
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.ai.update_game_finished": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1.7320508075688772 },
                  },
                  df: 2,
                },
              },
              v: {
                docs: {},
                df: 0,
                e: { docs: { "projet.models.History": { tf: 1 } }, df: 1 },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: { "projet.train.test_ai": { tf: 1 } },
                  df: 1,
                  e: {
                    docs: {
                      "projet.ai.update_game_finished": {
                        tf: 1.4142135623730951,
                      },
                      "projet.ai.reward": { tf: 1.4142135623730951 },
                      "projet.ai.previous_state": { tf: 1.7320508075688772 },
                      "projet.ai.pos_player": { tf: 1 },
                      "projet.ai.q_state": { tf: 1.7320508075688772 },
                      "projet.ai.info": { tf: 1 },
                      "projet.ai.get_move_random": { tf: 1 },
                      "projet.models.Game": { tf: 1 },
                      "projet.models.Game.board": { tf: 1 },
                      "projet.models.Qtable": { tf: 2.449489742783178 },
                      "projet.models.Qtable.state": { tf: 1 },
                      "projet.models.Qtable.up": { tf: 1 },
                      "projet.models.Qtable.down": { tf: 1 },
                      "projet.models.Qtable.left": { tf: 1 },
                      "projet.models.Qtable.right": { tf: 1 },
                      "projet.models.History": { tf: 1 },
                      "projet.models.History.state": { tf: 1 },
                      "projet.utils.state_is_valid": { tf: 2.23606797749979 },
                      "projet.utils.state_parsed": { tf: 1.7320508075688772 },
                      "projet.utils.state_str": { tf: 1.7320508075688772 },
                      "projet.views.game": { tf: 1 },
                    },
                    df: 21,
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.train.start_train_ai": { tf: 1 },
                      "projet.train.start_test_ai": { tf: 1 },
                      "projet.views.start_train": { tf: 1 },
                      "projet.views.start_test": { tf: 1 },
                    },
                    df: 4,
                  },
                },
              },
              r: {
                docs: {
                  "projet.ai.random_action": { tf: 1 },
                  "projet.ai.update_quality": { tf: 1 },
                  "projet.ai.reward": { tf: 1.4142135623730951 },
                  "projet.ai.q_state": { tf: 1 },
                  "projet.ai.set_parameters": { tf: 1 },
                  "projet.exceptions.InvalidActionException": { tf: 1 },
                  "projet.models.Qtable": { tf: 1 },
                  "projet.models.Qtable.get_quality": { tf: 1 },
                  "projet.models.Qtable.set_quality": { tf: 1 },
                  "projet.models.Qtable.best": { tf: 1 },
                  "projet.train.train_ai": { tf: 1 },
                  "projet.train.test_ai": { tf: 1 },
                  "projet.utils.move_converted": { tf: 1 },
                  "projet.utils.parse_users": { tf: 1 },
                  "projet.utils.beautify_board": { tf: 1 },
                  "projet.utils.state_parsed": { tf: 1 },
                  "projet.utils.state_str": { tf: 1 },
                },
                df: 17,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    g: {
                      docs: {
                        "projet.models.User": { tf: 1.7320508075688772 },
                        "projet.models.Game": { tf: 1 },
                        "projet.models.Game.board": { tf: 1 },
                        "projet.models.Game.board_to_string": { tf: 1 },
                        "projet.models.Qtable.state": { tf: 1 },
                        "projet.models.History.state": { tf: 1 },
                        "projet.train.train_ai": { tf: 1.4142135623730951 },
                        "projet.train.test_ai": { tf: 1.4142135623730951 },
                        "projet.utils.is_email_valid": { tf: 1 },
                        "projet.utils.state_parsed": { tf: 2 },
                        "projet.utils.state_str": { tf: 1.4142135623730951 },
                      },
                      df: 11,
                    },
                  },
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "projet.ai.update_discount_factor": { tf: 1 } },
                    df: 1,
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.ai.update_discount_factor": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
                n: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    p: { docs: { "projet.views.signup": { tf: 1 } }, df: 1 },
                  },
                },
              },
              m: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models.User.__init__": { tf: 1 },
                      "projet.models.Game.__init__": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.History.__init__": { tf: 1 },
                    },
                    df: 4,
                  },
                },
              },
              z: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.models.Game.size": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                  },
                  df: 2,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "projet.ai.set_parameters": { tf: 1 },
                  "projet.models.User.__init__": { tf: 1 },
                  "projet.models.Game.__init__": { tf: 1 },
                  "projet.models.Qtable.__init__": { tf: 1 },
                  "projet.models.Qtable.set_quality": {
                    tf: 1.7320508075688772,
                  },
                  "projet.models.History.__init__": { tf: 1 },
                  "projet.train.start_train_ai": { tf: 1 },
                  "projet.train.start_test_ai": { tf: 1 },
                },
                df: 8,
              },
              s: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "projet.train.train_ai": { tf: 1 },
                          "projet.train.start_train_ai": { tf: 1 },
                          "projet.train.test_ai": { tf: 1 },
                          "projet.train.start_test_ai": { tf: 1 },
                        },
                        df: 4,
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                d: { docs: { "projet.views.game": { tf: 1 } }, df: 1 },
              },
            },
            u: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {
                            "projet.utils.fill_paddock": {
                              tf: 1.7320508075688772,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            h: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  s: { docs: { "projet.ai.random_action": { tf: 1 } }, df: 1 },
                },
              },
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  k: {
                    docs: {
                      "projet.utils.is_email_valid": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                      "projet.utils.is_movement_valid": { tf: 1 },
                      "projet.utils.user_is_admin": { tf: 1 },
                      "projet.utils.admin_required": { tf: 1 },
                      "projet.utils.state_is_valid": { tf: 1.4142135623730951 },
                    },
                    df: 6,
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    l: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                  },
                },
                l: { docs: { "projet.utils.called": { tf: 1 } }, df: 1 },
              },
              s: {
                docs: {},
                df: 0,
                e: {
                  docs: { "projet.ai.reward": { tf: 1.4142135623730951 } },
                  df: 1,
                },
              },
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.models.Qtable": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.ai.other_player": { tf: 1 },
                          "projet.ai.pos_player": { tf: 1 },
                          "projet.ai.info": { tf: 1 },
                          "projet.ai.get_move_random": { tf: 1 },
                          "projet.models.Qtable": { tf: 1 },
                          "projet.models.Qtable.state": { tf: 1 },
                          "projet.models.History.state": { tf: 1 },
                          "projet.utils.state_is_valid": { tf: 1 },
                        },
                        df: 8,
                        _: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "projet.ai.previous_state": { tf: 1 },
                                    "projet.models.Game": { tf: 1 },
                                  },
                                  df: 2,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.ai.q_state": { tf: 1 },
                      "projet.views.game_create": { tf: 1 },
                    },
                    df: 2,
                    i: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "projet.models.Game": { tf: 1 },
                            "projet.models.Game.datetime": { tf: 1 },
                          },
                          df: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "projet.exceptions.InvalidMoveException": {
                            tf: 1.4142135623730951,
                          },
                          "projet.utils.move_converted": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        c: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "projet.models.User.__init__": { tf: 1 },
                              "projet.models.Game.__init__": { tf: 1 },
                              "projet.models.Qtable.__init__": { tf: 1 },
                              "projet.models.History.__init__": { tf: 1 },
                            },
                            df: 4,
                            o: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {
                                  "projet.models.User.__init__": { tf: null },
                                  "projet.models.Game.__init__": { tf: null },
                                  "projet.models.Qtable.__init__": { tf: null },
                                  "projet.models.History.__init__": {
                                    tf: null,
                                  },
                                },
                                df: 4,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                v: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.models.Game.board_to_array": { tf: 1 },
                          "projet.models.Game.board_to_string": { tf: 1 },
                          "projet.models.Game.board_array": { tf: 1 },
                          "projet.utils.move_converted": { tf: 1 },
                          "projet.utils.state_str": { tf: 1.4142135623730951 },
                        },
                        df: 5,
                      },
                    },
                  },
                },
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: { docs: { "projet.models.Qtable": { tf: 1 } }, df: 1 },
                    },
                  },
                },
                c: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "projet.utils.state_parsed": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
              l: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "projet.models.User.__init__": { tf: 1 },
                        "projet.models.Game.__init__": { tf: 1 },
                        "projet.models.Qtable.__init__": { tf: 1 },
                        "projet.models.History.__init__": { tf: 1 },
                      },
                      df: 4,
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: { "projet.utils.fill_paddock": { tf: 2 } },
                    df: 1,
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "projet.models.User.__init__": { tf: 1 },
                      "projet.models.Game.__init__": { tf: 1 },
                      "projet.models.Qtable.__init__": { tf: 1 },
                      "projet.models.History.__init__": { tf: 1 },
                    },
                    df: 4,
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "projet.utils.fill_paddock": { tf: 3.4641016151377544 },
                  },
                  df: 1,
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "projet.ai.random_action": { tf: 1 },
                      "projet.models.Qtable.get_quality": { tf: 1 },
                      "projet.models.Qtable.set_quality": { tf: 1 },
                      "projet.models.Qtable.max": { tf: 1.7320508075688772 },
                      "projet.models.Qtable.best": { tf: 1 },
                      "projet.utils.is_email_valid": { tf: 1.4142135623730951 },
                      "projet.utils.is_movement_valid": { tf: 1 },
                      "projet.utils.state_is_valid": { tf: 1.4142135623730951 },
                      "projet.utils.all_valid_movements": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 9,
                    _: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          v: {
                            docs: {
                              "projet.models.Qtable.max": { tf: 1 },
                              "projet.models.Qtable.best": { tf: 1 },
                            },
                            df: 2,
                          },
                        },
                      },
                    },
                  },
                },
                u: {
                  docs: {
                    "projet.ai.update_discount_factor": { tf: 1 },
                    "projet.ai.set_parameters": { tf: 1 },
                    "projet.models.User.__init__": { tf: 1 },
                    "projet.models.Game.__init__": { tf: 1 },
                    "projet.models.Qtable": { tf: 2 },
                    "projet.models.Qtable.__init__": { tf: 1 },
                    "projet.models.Qtable.up": { tf: 1 },
                    "projet.models.Qtable.down": { tf: 1 },
                    "projet.models.Qtable.left": { tf: 1 },
                    "projet.models.Qtable.right": { tf: 1 },
                    "projet.models.History.__init__": { tf: 1 },
                    "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                  },
                  df: 12,
                },
              },
              r: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    b: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {
                          "projet.ai.update_epsilon": { tf: 1 },
                          "projet.ai.update_discount_factor": { tf: 1 },
                          "projet.models.User.is_admin": { tf: 1 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  i: { docs: { "projet.models.Game": { tf: 1 } }, df: 1 },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                w: { docs: { "projet.views.game": { tf: 1 } }, df: 1 },
              },
            },
          },
          b: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "projet.ai.random_action": { tf: 1.4142135623730951 },
                      "projet.ai.reward": { tf: 1 },
                      "projet.models.Game": { tf: 1 },
                      "projet.models.Game.size": { tf: 1 },
                      "projet.models.Game.board_to_array": { tf: 1 },
                      "projet.models.Game.board_to_string": { tf: 1 },
                      "projet.models.Game.board_array": { tf: 1 },
                      "projet.models.Game.move": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 2.8284271247461903 },
                      "projet.utils.is_movement_valid": {
                        tf: 1.4142135623730951,
                      },
                      "projet.utils.beautify_board": { tf: 2 },
                      "projet.utils.all_valid_movements": {
                        tf: 1.4142135623730951,
                      },
                      "projet.utils.state_parsed": { tf: 1.4142135623730951 },
                    },
                    df: 13,
                    "'": {
                      docs: {
                        "projet.models.Game": { tf: 1 },
                        "projet.models.Game.board": { tf: 1 },
                      },
                      df: 2,
                    },
                    "(": {
                      2: {
                        5: {
                          docs: { "projet.models.Qtable": { tf: 1 } },
                          df: 1,
                        },
                        docs: {},
                        df: 0,
                      },
                      docs: {},
                      df: 0,
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "projet.models.Game.is_finished": { tf: 1 },
                    "projet.utils.is_email_valid": { tf: 1 },
                    "projet.utils.user_is_admin": { tf: 1 },
                    "projet.utils.state_is_valid": { tf: 1 },
                  },
                  df: 4,
                  e: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "projet.models.User": { tf: 1 },
                          "projet.models.Game": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
              t: { docs: { "projet.models.User.is_human": { tf: 1 } }, df: 1 },
            },
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                w: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: { "projet.ai.random_action": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.models.Qtable.best": { tf: 1.4142135623730951 },
                  },
                  df: 1,
                },
              },
              a: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      f: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: { "projet.utils.beautify_board": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                e: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            o: {
              docs: { "projet.utils.all_valid_movements": { tf: 1 } },
              df: 1,
              s: {
                docs: {},
                df: 0,
                _: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: { "projet.ai.random_action": { tf: 1 } },
                          df: 1,
                          e: {
                            docs: {},
                            df: 0,
                            r: {
                              1: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: { "projet.models.Game": { tf: 1 } },
                                    df: 1,
                                  },
                                  i: {
                                    docs: { "projet.models.Game": { tf: 1 } },
                                    df: 1,
                                  },
                                },
                              },
                              2: {
                                docs: {},
                                df: 0,
                                _: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: { "projet.models.Game": { tf: 1 } },
                                    df: 1,
                                  },
                                  i: {
                                    docs: { "projet.models.Game": { tf: 1 } },
                                    df: 1,
                                  },
                                },
                              },
                              docs: {},
                              df: 0,
                              _: {
                                1: {
                                  docs: {
                                    "projet.utils.state_parsed": { tf: 1 },
                                  },
                                  df: 1,
                                  "(": {
                                    2: {
                                      docs: {
                                        "projet.models.Qtable": { tf: 1 },
                                      },
                                      df: 1,
                                    },
                                    docs: {},
                                    df: 0,
                                  },
                                },
                                2: {
                                  docs: {
                                    "projet.utils.state_parsed": { tf: 1 },
                                  },
                                  df: 1,
                                  "(": {
                                    2: {
                                      docs: {
                                        "projet.models.Qtable": { tf: 1 },
                                      },
                                      df: 1,
                                    },
                                    docs: {},
                                    df: 0,
                                  },
                                },
                                docs: {},
                                df: 0,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.ai.random_action": { tf: 1 },
                      "projet.ai.pos_player": { tf: 1.4142135623730951 },
                      "projet.exceptions.InvalidPositionException": {
                        tf: 1.4142135623730951,
                      },
                      "projet.models.Game": { tf: 2 },
                      "projet.models.Game.pos_player_1_x": { tf: 1 },
                      "projet.models.Game.pos_player_1_y": { tf: 1 },
                      "projet.models.Game.pos_player_2_x": { tf: 1 },
                      "projet.models.Game.pos_player_2_y": { tf: 1 },
                      "projet.models.Game.pos_player_1": { tf: 1 },
                      "projet.models.Game.pos_player_2": { tf: 1 },
                      "projet.utils.all_valid_movements": { tf: 1 },
                      "projet.utils.state_parsed": { tf: 1.4142135623730951 },
                    },
                    df: 12,
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "projet.ai.reward": { tf: 1.7320508075688772 } },
                    df: 1,
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                y: {
                  docs: {
                    "projet.ai.set_parameters": { tf: 1 },
                    "projet.models.User.games": { tf: 1 },
                    "projet.models.User.nb_game_played": { tf: 1 },
                    "projet.utils.state_parsed": { tf: 1 },
                  },
                  df: 4,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "projet.ai.random_action": { tf: 1.7320508075688772 },
                        "projet.ai.reward": { tf: 2 },
                        "projet.ai.previous_state": { tf: 1 },
                        "projet.ai.other_player": { tf: 2 },
                        "projet.ai.pos_player": { tf: 2 },
                        "projet.ai.get_move_random": { tf: 1.4142135623730951 },
                        "projet.exceptions.InvalidPositionException": {
                          tf: 1.4142135623730951,
                        },
                        "projet.exceptions.InvalidPlayerException": {
                          tf: 1.7320508075688772,
                        },
                        "projet.models.Game": { tf: 2.23606797749979 },
                        "projet.models.Game.board": { tf: 1.4142135623730951 },
                        "projet.models.Game.pos_player_1_x": { tf: 1 },
                        "projet.models.Game.pos_player_1_y": { tf: 1 },
                        "projet.models.Game.pos_player_2_x": { tf: 1 },
                        "projet.models.Game.pos_player_2_y": { tf: 1 },
                        "projet.models.Game.current_player": { tf: 1 },
                        "projet.models.Game.pos_player_1": { tf: 1 },
                        "projet.models.Game.pos_player_2": { tf: 1 },
                        "projet.models.Game.move": { tf: 1.7320508075688772 },
                        "projet.models.History": { tf: 1 },
                        "projet.models.History.current_player": { tf: 1 },
                        "projet.models.History.movement": { tf: 1 },
                        "projet.utils.is_movement_valid": {
                          tf: 1.4142135623730951,
                        },
                        "projet.utils.all_valid_movements": { tf: 2 },
                        "projet.utils.state_parsed": { tf: 1.7320508075688772 },
                      },
                      df: 24,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                v: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {
                          "projet.ai.update_quality": {
                            tf: 1.7320508075688772,
                          },
                          "projet.ai.reward": { tf: 1 },
                          "projet.ai.previous_state": { tf: 1 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
                s: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.models.User.__init__": { tf: 1 },
                          "projet.models.Game.__init__": { tf: 1 },
                          "projet.models.Qtable.__init__": { tf: 1 },
                          "projet.models.History.__init__": { tf: 1 },
                        },
                        df: 4,
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "projet.models.User.id": { tf: 1 },
                          "projet.models.Game.id": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "projet.ai.set_parameters": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {
                            "projet.models.User": { tf: 1.4142135623730951 },
                            "projet.models.User.password": { tf: 1 },
                          },
                          df: 2,
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "projet.train.start_train_ai": { tf: 1 },
                          "projet.train.start_test_ai": { tf: 1 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
                s: { docs: { "projet.utils.parse_users": { tf: 1 } }, df: 1 },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "projet.utils.fill_paddock": { tf: 1.7320508075688772 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            u: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "projet.models.Game.pos_player_1": { tf: 1 },
                    "projet.models.Game.pos_player_2": { tf: 1 },
                    "projet.models.Game.move": { tf: 1 },
                    "projet.utils.is_movement_valid": { tf: 1 },
                    "projet.utils.move_converted": { tf: 1 },
                    "projet.utils.parse_users": { tf: 1.4142135623730951 },
                    "projet.utils.state_parsed": { tf: 1.4142135623730951 },
                  },
                  df: 7,
                  e: {
                    docs: {},
                    df: 0,
                    "[": {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "projet.ai.random_action": { tf: 1 },
                              "projet.ai.get_move_random": { tf: 1 },
                            },
                            df: 2,
                          },
                        },
                      },
                    },
                    "(": {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            ",": {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {
                                      "projet.utils.all_valid_movements": {
                                        tf: 1,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.current_player": { tf: 1 },
                    "projet.models.Game.move": { tf: 1 },
                    "projet.models.History.current_player": { tf: 1 },
                    "projet.utils.state_parsed": { tf: 1 },
                  },
                  df: 5,
                  "(": {
                    1: { docs: { "projet.models.Qtable": { tf: 1 } }, df: 1 },
                    docs: {},
                    df: 0,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                k: {
                  docs: { "projet.ai.reward": { tf: 1.4142135623730951 } },
                  df: 1,
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                l: { docs: { "projet.ai.previous_state": { tf: 1 } }, df: 1 },
              },
              k: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: { docs: { "projet.utils.timer": { tf: 1 } }, df: 1 },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "projet.ai.set_parameters": { tf: 1 },
                      "projet.train.train_ai": { tf: 1.4142135623730951 },
                      "projet.train.start_train_ai": { tf: 1.7320508075688772 },
                      "projet.views.start_train": { tf: 1 },
                      "projet.views.start_test": { tf: 1 },
                    },
                    df: 5,
                    _: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: { "projet.train.start_train_ai": { tf: 1 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.models.User": { tf: 1 },
                    "projet.models.User.is_human": { tf: 1 },
                    "projet.models.User.is_admin": { tf: 1 },
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.vs_ai": { tf: 1 },
                    "projet.models.Game.is_finished": { tf: 1 },
                    "projet.utils.is_email_valid": { tf: 1 },
                    "projet.utils.user_is_admin": { tf: 1 },
                  },
                  df: 8,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "projet.train.test_ai": { tf: 1.4142135623730951 },
                    "projet.train.start_test_ai": { tf: 1.7320508075688772 },
                    "projet.utils.state_is_valid": { tf: 1 },
                  },
                  df: 3,
                  _: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: { "projet.train.start_test_ai": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              m: {
                docs: {},
                df: 0,
                p: { docs: { "projet.utils.fill_paddock": { tf: 1 } }, df: 1 },
              },
            },
            i: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: { docs: { "projet.utils.timer": { tf: 1 } }, df: 1 },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            p: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "projet.ai.random_action": { tf: 1 },
                        "projet.models.Qtable.best": { tf: 1 },
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.start_train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1 },
                        "projet.train.start_test_ai": { tf: 1 },
                        "projet.utils.fill_paddock": { tf: 1 },
                      },
                      df: 7,
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "projet.ai.reward": { tf: 1 },
                  "projet.ai.previous_state": { tf: 1 },
                },
                df: 2,
                _: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        t: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    w: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {
                            "projet.ai.q_state": { tf: 1 },
                            "projet.models.User": { tf: 1 },
                            "projet.models.User.is_admin": { tf: 1 },
                            "projet.models.Game": { tf: 1 },
                            "projet.models.Game.vs_ai": { tf: 1 },
                            "projet.models.Game.is_finished": { tf: 1 },
                            "projet.models.Game.winner": { tf: 1 },
                            "projet.utils.is_email_valid": { tf: 1 },
                            "projet.utils.user_is_admin": { tf: 1 },
                          },
                          df: 9,
                        },
                      },
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "projet.utils.fill_paddock": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            b: {
              docs: {},
              df: 0,
              j: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.utils.state_str": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            u: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "projet.ai.random_action": { tf: 1 },
                        "projet.ai.reward": { tf: 1 },
                        "projet.ai.previous_state": { tf: 1 },
                        "projet.ai.other_player": { tf: 1.4142135623730951 },
                        "projet.ai.pos_player": { tf: 1 },
                        "projet.ai.get_move_random": { tf: 1 },
                        "projet.exceptions.InvalidPlayerException": { tf: 1 },
                        "projet.models.User.nb_game_played": { tf: 1 },
                        "projet.models.User.nb_game_win": { tf: 1 },
                        "projet.models.Game": { tf: 1 },
                        "projet.models.Game.current_player": { tf: 1 },
                        "projet.models.Game.winner": { tf: 1 },
                        "projet.models.Game.move": { tf: 1 },
                        "projet.models.History.current_player": { tf: 1 },
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.start_train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1.4142135623730951 },
                        "projet.train.start_test_ai": { tf: 1 },
                        "projet.utils.all_valid_movements": { tf: 1 },
                      },
                      df: 19,
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              w: {
                docs: {
                  "projet.ai.update_quality": { tf: 1.4142135623730951 },
                  "projet.ai.reward": { tf: 1 },
                },
                df: 2,
                _: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        t: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                      },
                    },
                  },
                },
              },
              x: {
                docs: {},
                df: 0,
                t: { docs: { "projet.ai.update_epsilon": { tf: 1 } }, df: 1 },
              },
              e: {
                docs: {},
                df: 0,
                d: {
                  docs: { "projet.ai.update_discount_factor": { tf: 1 } },
                  df: 1,
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "projet.models.User": { tf: 1.4142135623730951 },
                    "projet.models.User.__init__": { tf: 1 },
                    "projet.models.User.name": { tf: 1 },
                    "projet.models.Game.__init__": { tf: 1 },
                    "projet.models.Qtable.__init__": { tf: 1 },
                    "projet.models.History.__init__": { tf: 1 },
                  },
                  df: 6,
                },
              },
            },
            _: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {
                        "projet.train.train_ai": { tf: 1 },
                        "projet.train.start_train_ai": { tf: 1 },
                        "projet.train.test_ai": { tf: 1 },
                        "projet.train.start_test_ai": { tf: 1 },
                      },
                      df: 4,
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            p: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "projet.ai.update_epsilon": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                  },
                },
              },
            },
            x: {
              docs: { "projet.models.Qtable": { tf: 1 } },
              df: 1,
              i: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  t: { docs: { "projet.ai.q_state": { tf: 1 } }, df: 1 },
                },
              },
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "projet.exceptions.InvalidPositionException": { tf: 1 },
                        "projet.exceptions.InvalidPlayerException": { tf: 1 },
                        "projet.exceptions.GameFinishedException": { tf: 1 },
                        "projet.exceptions.InvalidMoveException": { tf: 1 },
                        "projet.exceptions.InvalidActionException": { tf: 1 },
                      },
                      df: 5,
                    },
                  },
                },
              },
              a: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "projet.models.User.__init__": { tf: 1 },
                        "projet.models.Game.__init__": { tf: 1 },
                        "projet.models.Qtable.__init__": { tf: 1 },
                        "projet.models.History.__init__": { tf: 1 },
                      },
                      df: 4,
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: { "projet.utils.fill_paddock": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: { "projet.utils.fill_paddock": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "projet.models.User": { tf: 1.4142135623730951 },
                      "projet.models.User.email": { tf: 1 },
                      "projet.models.User.is_admin": { tf: 1 },
                      "projet.utils.is_email_valid": { tf: 2 },
                    },
                    df: 4,
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "projet.models.Game.board": { tf: 1 },
                      "projet.utils.fill_paddock": { tf: 2 },
                    },
                    df: 2,
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              v: { docs: { "projet.models.User.is_admin": { tf: 1 } }, df: 1 },
              c: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {
                        "projet.utils.fill_paddock": { tf: 1.4142135623730951 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                h: { docs: { "projet.ai.update_epsilon": { tf: 1 } }, df: 1 },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: { "projet.ai.previous_state": { tf: 1 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                h: {
                  docs: {
                    "projet.models.User": { tf: 1 },
                    "projet.models.User.password": { tf: 1 },
                  },
                  df: 2,
                },
              },
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  l: { docs: { "projet.views.game": { tf: 1 } }, df: 1 },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: { "projet.models.User.is_human": { tf: 1 } },
                    df: 1,
                  },
                },
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                k: { docs: { "projet.ai.reward": { tf: 1 } }, df: 1 },
                d: {
                  docs: { "projet.utils.move_converted": { tf: 1 } },
                  df: 1,
                },
              },
              n: {
                docs: { "projet.models.User.nb_game_win": { tf: 1 } },
                df: 1,
              },
            },
            i: {
              docs: {},
              df: 0,
              n: {
                docs: { "projet.ai.reward": { tf: 1 } },
                df: 1,
                n: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: { "projet.models.Game.winner": { tf: 1 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                "'": {
                  docs: {
                    "projet.models.Game": { tf: 1 },
                    "projet.models.Game.current_player": { tf: 1 },
                    "projet.models.Game.move": { tf: 1 },
                    "projet.models.History.current_player": { tf: 1 },
                  },
                  df: 4,
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: { docs: { "projet.utils.fill_paddock": { tf: 1 } }, df: 1 },
              },
            },
          },
          x: {
            docs: {
              "projet.exceptions.InvalidPositionException": {
                tf: 1.4142135623730951,
              },
              "projet.exceptions.InvalidMoveException": {
                tf: 1.4142135623730951,
              },
              "projet.models.Game": { tf: 1.4142135623730951 },
              "projet.models.Game.pos_player_1_x": { tf: 1 },
              "projet.models.Game.pos_player_2_x": { tf: 1 },
              "projet.models.Game.pos_player_1": { tf: 1 },
              "projet.models.Game.pos_player_2": { tf: 1 },
              "projet.models.Game.move": { tf: 1 },
            },
            df: 8,
          },
          y: {
            docs: {
              "projet.exceptions.InvalidPositionException": {
                tf: 1.4142135623730951,
              },
              "projet.exceptions.InvalidMoveException": {
                tf: 1.4142135623730951,
              },
              "projet.models.Game": { tf: 1.4142135623730951 },
              "projet.models.Game.pos_player_1_y": { tf: 1 },
              "projet.models.Game.pos_player_2_y": { tf: 1 },
              "projet.models.Game.pos_player_1": { tf: 1 },
              "projet.models.Game.pos_player_2": { tf: 1 },
              "projet.models.Game.move": { tf: 1 },
            },
            df: 8,
            i: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "projet.train.train_ai": { tf: 1 },
                      "projet.train.test_ai": { tf: 1 },
                    },
                    df: 2,
                  },
                },
              },
            },
          },
          k: {
            docs: {},
            df: 0,
            w: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "projet.models.User.__init__": { tf: 1.4142135623730951 },
                      "projet.models.Game.__init__": { tf: 1.4142135623730951 },
                      "projet.models.Qtable.__init__": {
                        tf: 1.4142135623730951,
                      },
                      "projet.models.History.__init__": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 4,
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              y: {
                docs: {
                  "projet.models.User.__init__": { tf: 1 },
                  "projet.models.User.id": { tf: 1 },
                  "projet.models.Game.__init__": { tf: 1 },
                  "projet.models.Game.id": { tf: 1 },
                  "projet.models.Qtable.__init__": { tf: 1 },
                  "projet.models.History.__init__": { tf: 1 },
                },
                df: 6,
              },
            },
          },
        },
      },
    },
    pipeline: ["trimmer", "stopWordFilter", "stemmer"],
    _isPrebuiltIndex: true,
  };

  // mirrored in build-search-index.js (part 1)
  // Also split on html tags. this is a cheap heuristic, but good enough.
  elasticlunr.tokenizer.setSeperator(/[\s\-.;&]+|<[^>]*>/);

  let searchIndex;
  if (docs._isPrebuiltIndex) {
    console.info("using precompiled search index");
    searchIndex = elasticlunr.Index.load(docs);
  } else {
    console.time("building search index");
    // mirrored in build-search-index.js (part 2)
    searchIndex = elasticlunr(function () {
      this.addField("qualname");
      this.addField("fullname");
      this.addField("doc");
      this.setRef("fullname");
    });
    for (let doc of docs) {
      searchIndex.addDoc(doc);
    }
    console.timeEnd("building search index");
  }

  return (term) =>
    searchIndex.search(term, {
      fields: {
        qualname: { boost: 4 },
        fullname: { boost: 2 },
        doc: { boost: 1 },
      },
      expand: true,
    });
})();
