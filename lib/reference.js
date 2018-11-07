"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var READ = 0x1;
var WRITE = 0x2;
var RW = READ | WRITE;

/**
 * A Reference represents a single occurrence of an identifier in code.
 * @class Reference
 */

var Reference = function () {
  function Reference(ident, scope, flag, writeExpr, maybeImplicitGlobal, partial, init) {
    _classCallCheck(this, Reference);

    /**
     * Identifier syntax node.
     * @member {esprima#Identifier} Reference#identifier
     */
    this.identifier = ident;
    /**
     * Reference to the enclosing Scope.
     * @member {Scope} Reference#from
     */
    this.from = scope;
    /**
     * Whether the reference comes from a dynamic scope (such as 'eval',
     * 'with', etc.), and may be trapped by dynamic scopes.
     * @member {boolean} Reference#tainted
     */
    this.tainted = false;
    /**
     * The variable this reference is resolved with.
     * @member {Variable} Reference#resolved
     */
    this.resolved = null;
    /**
     * The read-write mode of the reference. (Value is one of {@link
     * Reference.READ}, {@link Reference.RW}, {@link Reference.WRITE}).
     * @member {number} Reference#flag
     * @private
     */
    this.flag = flag;
    if (this.isWrite()) {
      /**
       * If reference is writeable, this is the tree being written to it.
       * @member {esprima#Node} Reference#writeExpr
       */
      this.writeExpr = writeExpr;
      /**
       * Whether the Reference might refer to a partial value of writeExpr.
       * @member {boolean} Reference#partial
       */
      this.partial = partial;
      /**
       * Whether the Reference is to write of initialization.
       * @member {boolean} Reference#init
       */
      this.init = init;
    }
    this.__maybeImplicitGlobal = maybeImplicitGlobal;
  }

  /**
   * Whether the reference is static.
   * @method Reference#isStatic
   * @return {boolean}
   */


  _createClass(Reference, [{
    key: "isStatic",
    value: function isStatic() {
      return !this.tainted && this.resolved && this.resolved.scope.isStatic();
    }

    /**
     * Whether the reference is writeable.
     * @method Reference#isWrite
     * @return {boolean}
     */

  }, {
    key: "isWrite",
    value: function isWrite() {
      return !!(this.flag & Reference.WRITE);
    }

    /**
     * Whether the reference is readable.
     * @method Reference#isRead
     * @return {boolean}
     */

  }, {
    key: "isRead",
    value: function isRead() {
      return !!(this.flag & Reference.READ);
    }

    /**
     * Whether the reference is read-only.
     * @method Reference#isReadOnly
     * @return {boolean}
     */

  }, {
    key: "isReadOnly",
    value: function isReadOnly() {
      return this.flag === Reference.READ;
    }

    /**
     * Whether the reference is write-only.
     * @method Reference#isWriteOnly
     * @return {boolean}
     */

  }, {
    key: "isWriteOnly",
    value: function isWriteOnly() {
      return this.flag === Reference.WRITE;
    }

    /**
     * Whether the reference is read-write.
     * @method Reference#isReadWrite
     * @return {boolean}
     */

  }, {
    key: "isReadWrite",
    value: function isReadWrite() {
      return this.flag === Reference.RW;
    }
  }, {
    key: "locationEquals",
    value: function locationEquals(targetIdentifier) {
      var sourceLineStart = this.identifier.loc.start.line;
      var sourceColumnStart = this.identifier.loc.start.column;
      var sourceLineEnd = this.identifier.loc.end.line;
      var sourceColumnEnd = this.identifier.loc.end.column;

      var targetLineStart = targetIdentifier.loc.start.line;
      var targetColumnStart = targetIdentifier.loc.start.column;
      var targetLineEnd = targetIdentifier.loc.end.line;
      var targetColumnEnd = targetIdentifier.loc.end.column;

      return sourceLineStart === targetLineStart && sourceColumnStart === targetColumnStart && sourceLineEnd === targetLineEnd && sourceColumnEnd === targetColumnEnd;
    }
  }, {
    key: "isIdentifierEquals",
    value: function isIdentifierEquals(identifier) {
      if (this.identifier.name === identifier.name) {
        if (this.identifier.range && identifier.range && this.rangeEquals(identifier.range)) {
          return true;
        } else if (this.identifier.loc && identifier.loc && this.locationEquals(identifier)) {
          return true;
        }
      }
      return false;
    }
  }]);

  return Reference;
}();

/**
 * @constant Reference.READ
 * @private
 */


exports.default = Reference;
Reference.READ = READ;
/**
 * @constant Reference.WRITE
 * @private
 */
Reference.WRITE = WRITE;
/**
 * @constant Reference.RW
 * @private
 */
Reference.RW = RW;

/* vim: set sw=4 ts=4 et tw=80 : */
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW5jZS5qcyJdLCJuYW1lcyI6WyJSRUFEIiwiV1JJVEUiLCJSVyIsIlJlZmVyZW5jZSIsImlkZW50Iiwic2NvcGUiLCJmbGFnIiwid3JpdGVFeHByIiwibWF5YmVJbXBsaWNpdEdsb2JhbCIsInBhcnRpYWwiLCJpbml0IiwiaWRlbnRpZmllciIsImZyb20iLCJ0YWludGVkIiwicmVzb2x2ZWQiLCJpc1dyaXRlIiwiX19tYXliZUltcGxpY2l0R2xvYmFsIiwiaXNTdGF0aWMiLCJ0YXJnZXRJZGVudGlmaWVyIiwic291cmNlTGluZVN0YXJ0IiwibG9jIiwic3RhcnQiLCJsaW5lIiwic291cmNlQ29sdW1uU3RhcnQiLCJjb2x1bW4iLCJzb3VyY2VMaW5lRW5kIiwiZW5kIiwic291cmNlQ29sdW1uRW5kIiwidGFyZ2V0TGluZVN0YXJ0IiwidGFyZ2V0Q29sdW1uU3RhcnQiLCJ0YXJnZXRMaW5lRW5kIiwidGFyZ2V0Q29sdW1uRW5kIiwibmFtZSIsInJhbmdlIiwicmFuZ2VFcXVhbHMiLCJsb2NhdGlvbkVxdWFscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsSUFBTUEsT0FBTyxHQUFiO0FBQ0EsSUFBTUMsUUFBUSxHQUFkO0FBQ0EsSUFBTUMsS0FBS0YsT0FBT0MsS0FBbEI7O0FBRUE7Ozs7O0lBSXFCRSxTO0FBQ2pCLHFCQUFZQyxLQUFaLEVBQW1CQyxLQUFuQixFQUEwQkMsSUFBMUIsRUFBaUNDLFNBQWpDLEVBQTRDQyxtQkFBNUMsRUFBaUVDLE9BQWpFLEVBQTBFQyxJQUExRSxFQUFnRjtBQUFBOztBQUM1RTs7OztBQUlBLFNBQUtDLFVBQUwsR0FBa0JQLEtBQWxCO0FBQ0E7Ozs7QUFJQSxTQUFLUSxJQUFMLEdBQVlQLEtBQVo7QUFDQTs7Ozs7QUFLQSxTQUFLUSxPQUFMLEdBQWUsS0FBZjtBQUNBOzs7O0FBSUEsU0FBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNBOzs7Ozs7QUFNQSxTQUFL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c291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG5jb25zdCBSRUFEID0gMHgxO1xuY29uc3QgV1JJVEUgPSAweDI7XG5jb25zdCBSVyA9IFJFQUQgfCBXUklURTtcblxuLyoqXG4gKiBBIFJlZmVyZW5jZSByZXByZXNlbnRzIGEgc2luZ2xlIG9jY3VycmVuY2Ugb2YgYW4gaWRlbnRpZmllciBpbiBjb2RlLlxuICogQGNsYXNzIFJlZmVyZW5jZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWZlcmVuY2Uge1xuICAgIGNvbnN0cnVjdG9yKGlkZW50LCBzY29wZSwgZmxhZywgIHdyaXRlRXhwciwgbWF5YmVJbXBsaWNpdEdsb2JhbCwgcGFydGlhbCwgaW5pdCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSWRlbnRpZmllciBzeW50YXggbm9kZS5cbiAgICAgICAgICogQG1lbWJlciB7ZXNwcmltYSNJZGVudGlmaWVyfSBSZWZlcmVuY2UjaWRlbnRpZmllclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gaWRlbnQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGVuY2xvc2luZyBTY29wZS5cbiAgICAgICAgICogQG1lbWJlciB7U2NvcGV9IFJlZmVyZW5jZSNmcm9tXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZyb20gPSBzY29wZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBjb21lcyBmcm9tIGEgZHluYW1pYyBzY29wZSAoc3VjaCBhcyAnZXZhbCcsXG4gICAgICAgICAqICd3aXRoJywgZXRjLiksIGFuZCBtYXkgYmUgdHJhcHBlZCBieSBkeW5hbWljIHNjb3Blcy5cbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI3RhaW50ZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGFpbnRlZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHZhcmlhYmxlIHRoaXMgcmVmZXJlbmNlIGlzIHJlc29sdmVkIHdpdGguXG4gICAgICAgICAqIEBtZW1iZXIge1ZhcmlhYmxlfSBSZWZlcmVuY2UjcmVzb2x2ZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzb2x2ZWQgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHJlYWQtd3JpdGUgbW9kZSBvZiB0aGUgcmVmZXJlbmNlLiAoVmFsdWUgaXMgb25lIG9mIHtAbGlua1xuICAgICAgICAgKiBSZWZlcmVuY2UuUkVBRH0sIHtAbGluayBSZWZlcmVuY2UuUld9LCB7QGxpbmsgUmVmZXJlbmNlLldSSVRFfSkuXG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn0gUmVmZXJlbmNlI2ZsYWdcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxhZyA9IGZsYWc7XG4gICAgICAgIGlmICh0aGlzLmlzV3JpdGUoKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJZiByZWZlcmVuY2UgaXMgd3JpdGVhYmxlLCB0aGlzIGlzIHRoZSB0cmVlIGJlaW5nIHdyaXR0ZW4gdG8gaXQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtlc3ByaW1hI05vZGV9IFJlZmVyZW5jZSN3cml0ZUV4cHJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy53cml0ZUV4cHIgPSB3cml0ZUV4cHI7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFdoZXRoZXIgdGhlIFJlZmVyZW5jZSBtaWdodCByZWZlciB0byBhIHBhcnRpYWwgdmFsdWUgb2Ygd3JpdGVFeHByLlxuICAgICAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI3BhcnRpYWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWFsID0gcGFydGlhbDtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogV2hldGhlciB0aGUgUmVmZXJlbmNlIGlzIHRvIHdyaXRlIG9mIGluaXRpYWxpemF0aW9uLlxuICAgICAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn0gUmVmZXJlbmNlI2luaXRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbml0ID0gaW5pdDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fbWF5YmVJbXBsaWNpdEdsb2JhbCA9IG1heWJlSW1wbGljaXRHbG9iYWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHN0YXRpYy5cbiAgICAgKiBAbWV0aG9kIFJlZmVyZW5jZSNpc1N0YXRpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdGF0aWMoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy50YWludGVkICYmIHRoaXMucmVzb2x2ZWQgJiYgdGhpcy5yZXNvbHZlZC5zY29wZS5pc1N0YXRpYygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBpcyB3cml0ZWFibGUuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNXcml0ZVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNXcml0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuZmxhZyAmIFJlZmVyZW5jZS5XUklURSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHJlYWRhYmxlLlxuICAgICAqIEBtZXRob2QgUmVmZXJlbmNlI2lzUmVhZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNSZWFkKCkge1xuICAgICAgICByZXR1cm4gISEodGhpcy5mbGFnICYgUmVmZXJlbmNlLlJFQUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJlZmVyZW5jZSBpcyByZWFkLW9ubHkuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNSZWFkT25seVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNSZWFkT25seSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhZyA9PT0gUmVmZXJlbmNlLlJFQUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHdyaXRlLW9ubHkuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNXcml0ZU9ubHlcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzV3JpdGVPbmx5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGFnID09PSBSZWZlcmVuY2UuV1JJVEU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmVmZXJlbmNlIGlzIHJlYWQtd3JpdGUuXG4gICAgICogQG1ldGhvZCBSZWZlcmVuY2UjaXNSZWFkV3JpdGVcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzUmVhZFdyaXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGFnID09PSBSZWZlcmVuY2UuUlc7XG4gICAgfVxuXG4gICAgbG9jYXRpb25FcXVhbHModGFyZ2V0SWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBzb3VyY2VMaW5lU3RhcnQgPSB0aGlzLmlkZW50aWZpZXIubG9jLnN0YXJ0LmxpbmU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUNvbHVtblN0YXJ0ID0gdGhpcy5pZGVudGlmaWVyLmxvYy5zdGFydC5jb2x1bW47XG4gICAgICAgIGNvbnN0IHNvdXJjZUxpbmVFbmQgPSB0aGlzLmlkZW50aWZpZXIubG9jLmVuZC5saW5lO1xuICAgICAgICBjb25zdCBzb3VyY2VDb2x1bW5FbmQgPSB0aGlzLmlkZW50aWZpZXIubG9jLmVuZC5jb2x1bW47XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0TGluZVN0YXJ0ID0gdGFyZ2V0SWRlbnRpZmllci5sb2Muc3RhcnQubGluZTtcbiAgICAgICAgY29uc3QgdGFyZ2V0Q29sdW1uU3RhcnQgPSB0YXJnZXRJZGVudGlmaWVyLmxvYy5zdGFydC5jb2x1bW47XG4gICAgICAgIGNvbnN0IHRhcmdldExpbmVFbmQgPSB0YXJnZXRJZGVudGlmaWVyLmxvYy5lbmQubGluZTtcbiAgICAgICAgY29uc3QgdGFyZ2V0Q29sdW1uRW5kID0gdGFyZ2V0SWRlbnRpZmllci5sb2MuZW5kLmNvbHVtbjtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHNvdXJjZUxpbmVTdGFydCA9PT0gdGFyZ2V0TGluZVN0YXJ0ICYmXG4gICAgICAgICAgc291cmNlQ29sdW1uU3RhcnQgPT09IHRhcmdldENvbHVtblN0YXJ0ICYmXG4gICAgICAgICAgc291cmNlTGluZUVuZCA9PT0gdGFyZ2V0TGluZUVuZCAmJlxuICAgICAgICAgIHNvdXJjZUNvbHVtbkVuZCA9PT0gdGFyZ2V0Q29sdW1uRW5kXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaXNJZGVudGlmaWVyRXF1YWxzKGlkZW50aWZpZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaWRlbnRpZmllci5uYW1lID09PSBpZGVudGlmaWVyLm5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlkZW50aWZpZXIucmFuZ2UgJiYgaWRlbnRpZmllci5yYW5nZSAmJlxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VFcXVhbHMoaWRlbnRpZmllci5yYW5nZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pZGVudGlmaWVyLmxvYyAmJiBpZGVudGlmaWVyLmxvYyAmJlxuICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25FcXVhbHMoaWRlbnRpZmllcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjb25zdGFudCBSZWZlcmVuY2UuUkVBRFxuICogQHByaXZhdGVcbiAqL1xuUmVmZXJlbmNlLlJFQUQgPSBSRUFEO1xuLyoqXG4gKiBAY29uc3RhbnQgUmVmZXJlbmNlLldSSVRFXG4gKiBAcHJpdmF0ZVxuICovXG5SZWZlcmVuY2UuV1JJVEUgPSBXUklURTtcbi8qKlxuICogQGNvbnN0YW50IFJlZmVyZW5jZS5SV1xuICogQHByaXZhdGVcbiAqL1xuUmVmZXJlbmNlLlJXID0gUlc7XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXX0=
