'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _estraverse = require('estraverse');

var _esrecurse = require('esrecurse');

var _esrecurse2 = _interopRequireDefault(_esrecurse);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _variable = require('./variable');

var _variable2 = _interopRequireDefault(_variable);

var _patternVisitor = require('./pattern-visitor');

var _patternVisitor2 = _interopRequireDefault(_patternVisitor);

var _definition = require('./definition');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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


function traverseIdentifierInPattern(options, rootPattern, referencer, callback) {
    // Call the callback at left hand identifier nodes, and Collect right hand nodes.
    var visitor = new _patternVisitor2.default(options, rootPattern, callback);
    visitor.visit(rootPattern);

    // Process the right hand nodes recursively.
    if (referencer != null) {
        visitor.rightHandNodes.forEach(referencer.visit, referencer);
    }
}

// Importing ImportDeclaration.
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-moduledeclarationinstantiation
// https://github.com/estree/estree/blob/master/es6.md#importdeclaration
// FIXME: Now, we don't create module environment, because the context is
// implementation dependent.

var Importer = function (_esrecurse$Visitor) {
    _inherits(Importer, _esrecurse$Visitor);

    function Importer(declaration, referencer) {
        _classCallCheck(this, Importer);

        var _this = _possibleConstructorReturn(this, (Importer.__proto__ || Object.getPrototypeOf(Importer)).call(this, null, referencer.options));

        _this.declaration = declaration;
        _this.referencer = referencer;
        return _this;
    }

    _createClass(Importer, [{
        key: 'visitImport',
        value: function visitImport(id, specifier) {
            var _this2 = this;

            this.referencer.visitPattern(id, function (pattern) {
                _this2.referencer.currentScope().__define(pattern, new _definition.Definition(_variable2.default.ImportBinding, pattern, specifier, _this2.declaration, null, null));
            });
        }
    }, {
        key: 'ImportNamespaceSpecifier',
        value: function ImportNamespaceSpecifier(node) {
            var local = node.local || node.id;
            if (local) {
                this.visitImport(local, node);
            }
        }
    }, {
        key: 'ImportDefaultSpecifier',
        value: function ImportDefaultSpecifier(node) {
            var local = node.local || node.id;
            this.visitImport(local, node);
        }
    }, {
        key: 'ImportSpecifier',
        value: function ImportSpecifier(node) {
            var local = node.local || node.id;
            if (node.name) {
                this.visitImport(node.name, node);
            } else {
                this.visitImport(local, node);
            }
        }
    }]);

    return Importer;
}(_esrecurse2.default.Visitor);

// Referencing variables and creating bindings.


var Referencer = function (_esrecurse$Visitor2) {
    _inherits(Referencer, _esrecurse$Visitor2);

    function Referencer(options, scopeManager) {
        _classCallCheck(this, Referencer);

        var _this3 = _possibleConstructorReturn(this, (Referencer.__proto__ || Object.getPrototypeOf(Referencer)).call(this, null, options));

        _this3.options = options;
        _this3.scopeManager = scopeManager;
        _this3.parent = null;
        _this3.isInnerMethodDefinition = false;
        return _this3;
    }

    _createClass(Referencer, [{
        key: 'currentScope',
        value: function currentScope() {
            return this.scopeManager.__currentScope;
        }
    }, {
        key: 'close',
        value: function close(node) {
            while (this.currentScope() && node === this.currentScope().block) {
                this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
            }
        }
    }, {
        key: 'pushInnerMethodDefinition',
        value: function pushInnerMethodDefinition(isInnerMethodDefinition) {
            var previous = this.isInnerMethodDefinition;
            this.isInnerMethodDefinition = isInnerMethodDefinition;
            return previous;
        }
    }, {
        key: 'popInnerMethodDefinition',
        value: function popInnerMethodDefinition(isInnerMethodDefinition) {
            this.isInnerMethodDefinition = isInnerMethodDefinition;
        }
    }, {
        key: 'materializeTDZScope',
        value: function materializeTDZScope(node, iterationNode) {
            // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-runtime-semantics-forin-div-ofexpressionevaluation-abstract-operation
            // TDZ scope hides the declaration's names.
            this.scopeManager.__nestTDZScope(node, iterationNode);
            this.visitVariableDeclaration(this.currentScope(), _variable2.default.TDZ, iterationNode.left, 0, true);
        }
    }, {
        key: 'materializeIterationScope',
        value: function materializeIterationScope(node) {
            var _this4 = this;

            // Generate iteration scope for upper ForIn/ForOf Statements.
            var letOrConstDecl;
            this.scopeManager.__nestForScope(node);
            letOrConstDecl = node.left;
            this.visitVariableDeclaration(this.currentScope(), _variable2.default.Variable, letOrConstDecl, 0);
            this.visitPattern(letOrConstDecl.declarations[0].id, function (pattern) {
                _this4.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
            });
        }
    }, {
        key: 'referencingDefaultValue',
        value: function referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
            var scope = this.currentScope();
            assignments.forEach(function (assignment) {
                scope.__referencing(pattern, _reference2.default.WRITE, assignment.right, maybeImplicitGlobal, pattern !== assignment.left, init);
            });
        }
    }, {
        key: 'visitPattern',
        value: function visitPattern(node, options, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = { processRightHandNodes: false };
            }
            traverseIdentifierInPattern(this.options, node, options.processRightHandNodes ? this : null, callback);
        }
    }, {
        key: 'visitFunction',
        value: function visitFunction(node) {
            var _this5 = this;

            var i, iz;
            // FunctionDeclaration name is defined in upper scope
            // NOTE: Not referring variableScope. It is intended.
            // Since
            //  in ES5, FunctionDeclaration should be in FunctionBody.
            //  in ES6, FunctionDeclaration should be block scoped.
            if (node.type === _estraverse.Syntax.FunctionDeclaration) {
                // id is defined in upper scope
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.FunctionName, node.id, node, null, null, null));
            }

            // FunctionExpression with name creates its special scope;
            // FunctionExpressionNameScope.
            if (node.type === _estraverse.Syntax.FunctionExpression && node.id) {
                this.scopeManager.__nestFunctionExpressionNameScope(node);
            }

            // Consider this function is in the MethodDefinition.
            this.scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);

            // Process parameter declarations.
            for (i = 0, iz = node.params.length; i < iz; ++i) {
                this.visitPattern(node.params[i], { processRightHandNodes: true }, function (pattern, info) {
                    _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, i, info.rest));

                    _this5.referencingDefaultValue(pattern, info.assignments, null, true);
                });
            }

            // if there's a rest argument, add that
            if (node.rest) {
                this.visitPattern({
                    type: 'RestElement',
                    argument: node.rest
                }, function (pattern) {
                    _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, node.params.length, true));
                });
            }

            // Skip BlockStatement to prevent creating BlockStatement scope.
            if (node.body.type === _estraverse.Syntax.BlockStatement) {
                this.visitChildren(node.body);
            } else {
                this.visit(node.body);
            }

            this.close(node);
        }
    }, {
        key: 'visitClass',
        value: function visitClass(node) {
            if (node.type === _estraverse.Syntax.ClassDeclaration) {
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node, null, null, null));
            }

            // FIXME: Maybe consider TDZ.
            this.visit(node.superClass);

            this.scopeManager.__nestClassScope(node);

            if (node.id) {
                this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node));
            }
            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'visitProperty',
        value: function visitProperty(node) {
            var previous, isMethodDefinition;
            if (node.computed) {
                this.visit(node.key);
            }

            isMethodDefinition = node.type === _estraverse.Syntax.MethodDefinition;
            if (isMethodDefinition) {
                previous = this.pushInnerMethodDefinition(true);
            }
            this.visit(node.value);
            if (isMethodDefinition) {
                this.popInnerMethodDefinition(previous);
            }
        }
    }, {
        key: 'visitForIn',
        value: function visitForIn(node) {
            var _this6 = this;

            if (node.left.type === _estraverse.Syntax.VariableDeclaration && node.left.kind !== 'var') {
                this.materializeTDZScope(node.right, node);
                this.visit(node.right);
                this.close(node.right);

                this.materializeIterationScope(node);
                this.visit(node.body);
                this.close(node);
            } else {
                if (node.left.type === _estraverse.Syntax.VariableDeclaration) {
                    this.visit(node.left);
                    this.visitPattern(node.left.declarations[0].id, function (pattern) {
                        _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
                    });
                } else {
                    this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                        var maybeImplicitGlobal = null;
                        if (!_this6.currentScope().isStrict) {
                            maybeImplicitGlobal = {
                                pattern: pattern,
                                node: node
                            };
                        }
                        _this6.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                        _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, true, false);
                    });
                }
                this.visit(node.right);
                this.visit(node.body);
            }
        }
    }, {
        key: 'visitVariableDeclaration',
        value: function visitVariableDeclaration(variableTargetScope, type, node, index, fromTDZ) {
            var _this7 = this;

            // If this was called to initialize a TDZ scope, this needs to make definitions, but doesn't make references.
            var decl, init;

            decl = node.declarations[index];
            init = decl.init;
            this.visitPattern(decl.id, { processRightHandNodes: !fromTDZ }, function (pattern, info) {
                variableTargetScope.__define(pattern, new _definition.Definition(type, pattern, decl, node, index, node.kind));

                if (!fromTDZ) {
                    _this7.referencingDefaultValue(pattern, info.assignments, null, true);
                }
                if (init) {
                    _this7.currentScope().__referencing(pattern, _reference2.default.WRITE, init, null, !info.topLevel, true);
                }
            });
        }
    }, {
        key: 'AssignmentExpression',
        value: function AssignmentExpression(node) {
            var _this8 = this;

            if (_patternVisitor2.default.isPattern(node.left)) {
                if (node.operator === '=') {
                    this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                        var maybeImplicitGlobal = null;
                        if (!_this8.currentScope().isStrict) {
                            maybeImplicitGlobal = {
                                pattern: pattern,
                                node: node
                            };
                        }
                        _this8.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                        _this8.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, !info.topLevel, false);
                    });
                } else {
                    this.currentScope().__referencing(node.left, _reference2.default.RW, node.right);
                }
            } else {
                this.visit(node.left);
            }
            this.visit(node.right);
        }
    }, {
        key: 'CatchClause',
        value: function CatchClause(node) {
            var _this9 = this;

            this.scopeManager.__nestCatchScope(node);

            this.visitPattern(node.param, { processRightHandNodes: true }, function (pattern, info) {
                _this9.currentScope().__define(pattern, new _definition.Definition(_variable2.default.CatchClause, node.param, node, null, null, null));
                _this9.referencingDefaultValue(pattern, info.assignments, null, true);
            });
            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'Program',
        value: function Program(node) {
            this.scopeManager.__nestGlobalScope(node);

            if (this.scopeManager.__isNodejsScope()) {
                // Force strictness of GlobalScope to false when using node.js scope.
                this.currentScope().isStrict = false;
                this.scopeManager.__nestFunctionScope(node, false);
            }

            if (this.scopeManager.__isES6() && this.scopeManager.isModule()) {
                this.scopeManager.__nestModuleScope(node);
            }

            if (this.scopeManager.isStrictModeSupported() && this.scopeManager.isImpliedStrict()) {
                this.currentScope().isStrict = true;
            }

            this.visitChildren(node);
            this.close(node);
        }
    }, {
        key: 'Identifier',
        value: function Identifier(node) {
            this.currentScope().__referencing(node);
        }
    }, {
        key: 'UpdateExpression',
        value: function UpdateExpression(node) {
            if (_patternVisitor2.default.isPattern(node.argument)) {
                this.currentScope().__referencing(node.argument, _reference2.default.RW, null);
            } else {
                this.visitChildren(node);
            }
        }
    }, {
        key: 'MemberExpression',
        value: function MemberExpression(node) {
            this.visit(node.object);
            if (node.computed) {
                this.visit(node.property);
            }
        }
    }, {
        key: 'Property',
        value: function Property(node) {
            this.visitProperty(node);
        }
    }, {
        key: 'MethodDefinition',
        value: function MethodDefinition(node) {
            this.visitProperty(node);
        }
    }, {
        key: 'BreakStatement',
        value: function BreakStatement() {}
    }, {
        key: 'ContinueStatement',
        value: function ContinueStatement() {}
    }, {
        key: 'LabeledStatement',
        value: function LabeledStatement(node) {
            this.visit(node.body);
        }
    }, {
        key: 'ForStatement',
        value: function ForStatement(node) {
            // Create ForStatement declaration.
            // NOTE: In ES6, ForStatement dynamically generates
            // per iteration environment. However, escope is
            // a static analyzer, we only generate one scope for ForStatement.
            if (node.init && node.init.type === _estraverse.Syntax.VariableDeclaration && node.init.kind !== 'var') {
                this.scopeManager.__nestForScope(node);
            }

            this.visitChildren(node);

            this.close(node);
        }
    }, {
        key: 'ClassExpression',
        value: function ClassExpression(node) {
            this.visitClass(node);
        }
    }, {
        key: 'ClassDeclaration',
        value: function ClassDeclaration(node) {
            this.visitClass(node);
        }
    }, {
        key: 'CallExpression',
        value: function CallExpression(node) {
            // Check this is direct call to eval
            if (!this.scopeManager.__ignoreEval() && node.callee.type === _estraverse.Syntax.Identifier && node.callee.name === 'eval') {
                // NOTE: This should be `variableScope`. Since direct eval call always creates Lexical environment and
                // let / const should be enclosed into it. Only VariableDeclaration affects on the caller's environment.
                this.currentScope().variableScope.__detectEval();
            }
            this.visitChildren(node);
        }
    }, {
        key: 'BlockStatement',
        value: function BlockStatement(node) {
            if (this.scopeManager.__isES6()) {
                this.scopeManager.__nestBlockScope(node);
            }

            this.visitChildren(node);

            this.close(node);
        }
    }, {
        key: 'ThisExpression',
        value: function ThisExpression() {
            this.currentScope().variableScope.__detectThis();
        }
    }, {
        key: 'WithStatement',
        value: function WithStatement(node) {
            this.visit(node.object);
            // Then nest scope for WithStatement.
            this.scopeManager.__nestWithScope(node);

            this.visit(node.body);

            this.close(node);
        }
    }, {
        key: 'VariableDeclaration',
        value: function VariableDeclaration(node) {
            var variableTargetScope, i, iz, decl;
            variableTargetScope = node.kind === 'var' ? this.currentScope().variableScope : this.currentScope();
            for (i = 0, iz = node.declarations.length; i < iz; ++i) {
                decl = node.declarations[i];
                this.visitVariableDeclaration(variableTargetScope, _variable2.default.Variable, node, i);
                if (decl.init) {
                    this.visit(decl.init);
                }
            }
        }
    }, {
        key: 'JSXElement',
        value: function JSXElement(node) {
            this.visitChildren(node);
        }
    }, {
        key: 'JSXClosingElement',
        value: function JSXClosingElement(node) {
            this.close(node);
        }
    }, {
        key: 'JSXIdentifier',
        value: function JSXIdentifier(node) {
            node.type = "Identifier";
            var refsWithSameIdentifier = this.currentScope().references.filter(function (reference) {
                return reference.isIdentifierEquals(node);
            });

            if (refsWithSameIdentifier.length === 0) {
                this.currentScope().__referencing(node);
            }
        }

        // sec 13.11.8

    }, {
        key: 'SwitchStatement',
        value: function SwitchStatement(node) {
            var i, iz;

            this.visit(node.discriminant);

            if (this.scopeManager.__isES6()) {
                this.scopeManager.__nestSwitchScope(node);
            }

            for (i = 0, iz = node.cases.length; i < iz; ++i) {
                this.visit(node.cases[i]);
            }

            this.close(node);
        }
    }, {
        key: 'FunctionDeclaration',
        value: function FunctionDeclaration(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'FunctionExpression',
        value: function FunctionExpression(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'ForOfStatement',
        value: function ForOfStatement(node) {
            this.visitForIn(node);
        }
    }, {
        key: 'ForInStatement',
        value: function ForInStatement(node) {
            this.visitForIn(node);
        }
    }, {
        key: 'ArrowFunctionExpression',
        value: function ArrowFunctionExpression(node) {
            this.visitFunction(node);
        }
    }, {
        key: 'ImportDeclaration',
        value: function ImportDeclaration(node) {
            var importer;

            (0, _assert2.default)(this.scopeManager.__isES6() && this.scopeManager.isModule(), 'ImportDeclaration should appear when the mode is ES6 and in the module context.');

            importer = new Importer(node, this);
            importer.visit(node);
        }
    }, {
        key: 'visitExportDeclaration',
        value: function visitExportDeclaration(node) {
            if (node.source) {
                return;
            }
            if (node.declaration) {
                this.visit(node.declaration);
                return;
            }

            this.visitChildren(node);
        }
    }, {
        key: 'ExportDeclaration',
        value: function ExportDeclaration(node) {
            this.visitExportDeclaration(node);
        }
    }, {
        key: 'ExportNamedDeclaration',
        value: function ExportNamedDeclaration(node) {
            this.visitExportDeclaration(node);
        }
    }, {
        key: 'ExportSpecifier',
        value: function ExportSpecifier(node) {
            var local = node.id || node.local;
            this.visit(local);
        }
    }, {
        key: 'MetaProperty',
        value: function MetaProperty() {
            // do nothing.
        }
    }]);

    return Referencer;
}(_esrecurse2.default.Visitor);

/* vim: set sw=4 ts=4 et tw=80 : */


exports.default = Referencer;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW5jZXIuanMiXSwibmFtZXMiOlsidHJhdmVyc2VJZGVudGlmaWVySW5QYXR0ZXJuIiwib3B0aW9ucyIsInJvb3RQYXR0ZXJuIiwicmVmZXJlbmNlciIsImNhbGxiYWNrIiwidmlzaXRvciIsIlBhdHRlcm5WaXNpdG9yIiwidmlzaXQiLCJyaWdodEhhbmROb2RlcyIsImZvckVhY2giLCJJbXBvcnRlciIsImRlY2xhcmF0aW9uIiwiaWQiLCJzcGVjaWZpZXIiLCJ2aXNpdFBhdHRlcm4iLCJwYXR0ZXJuIiwiY3VycmVudFNjb3BlIiwiX19kZWZpbmUiLCJEZWZpbml0aW9uIiwiVmFyaWFibGUiLCJJbXBvcnRCaW5kaW5nIiwibm9kZSIsImxvY2FsIiwidmlzaXRJbXBvcnQiLCJuYW1lIiwiZXNyZWN1cnNlIiwiVmlzaXRvciIsIlJlZmVyZW5jZXIiLCJzY29wZU1hbmFnZXIiLCJwYXJlbnQiLCJpc0lubmVyTWV0aG9kRGVmaW5pdGlvbiIsIl9fY3VycmVudFNjb3BlIiwiYmxvY2siLCJfX2Nsb3NlIiwicHJldmlvdXMiLCJpdGVyYXRpb25Ob2RlIiwiX19uZXN0VERaU2NvcGUiLCJ2aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24iLCJURFoiLCJsZWZ0IiwibGV0T3JDb25zdERlY2wiLCJfX25lc3RGb3JTY29wZSIsImRlY2xhcmF0aW9ucyIsIl9fcmVmZXJlbmNpbmciLCJSZWZlcmVuY2UiLCJXUklURSIsInJpZ2h0IiwiYXNzaWdubWVudHMiLCJtYXliZUltcGxpY2l0R2xvYmFsIiwiaW5pdCIsInNjb3BlIiwiYXNzaWdubWVudCIsInByb2Nlc3NSaWdodEhhbmROb2RlcyIsImkiLCJpeiIsInR5cGUiLCJTeW50YXgiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiRnVuY3Rpb25OYW1lIiwiRnVuY3Rpb25FeHByZXNzaW9uIiwiX19uZXN0RnVuY3Rpb25FeHByZXNzaW9uTmFtZVNjb3BlIiwiX19uZXN0RnVuY3Rpb25TY29wZSIsInBhcmFtcyIsImxlbmd0aCIsImluZm8iLCJQYXJhbWV0ZXJEZWZpbml0aW9uIiwicmVzdCIsInJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlIiwiYXJndW1lbnQiLCJib2R5IiwiQmxvY2tTdGF0ZW1lbnQiLCJ2aXNpdENoaWxkcmVuIiwiY2xvc2UiLCJDbGFzc0RlY2xhcmF0aW9uIiwiQ2xhc3NOYW1lIiwic3VwZXJDbGFzcyIsIl9fbmVzdENsYXNzU2NvcGUiLCJpc01ldGhvZERlZmluaXRpb24iLCJjb21wdXRlZCIsImtleSIsIk1ldGhvZERlZmluaXRpb24iLCJwdXNoSW5uZXJNZXRob2REZWZpbml0aW9uIiwidmFsdWUiLCJwb3BJbm5lck1ldGhvZERlZmluaXRpb24iLCJWYXJpYWJsZURlY2xhcmF0aW9uIiwia2luZCIsIm1hdGVyaWFsaXplVERaU2NvcGUiLCJtYXRlcmlhbGl6ZUl0ZXJhdGlvblNjb3BlIiwiaXNTdHJpY3QiLCJ2YXJpYWJsZVRhcmdldFNjb3BlIiwiaW5kZXgiLCJmcm9tVERaIiwiZGVjbCIsInRvcExldmVsIiwiaXNQYXR0ZXJuIiwib3BlcmF0b3IiLCJSVyIsIl9fbmVzdENhdGNoU2NvcGUiLCJwYXJhbSIsIkNhdGNoQ2xhdXNlIiwiX19uZXN0R2xvYmFsU2NvcGUiLCJfX2lzTm9kZWpzU2NvcGUiLCJfX2lzRVM2IiwiaXNNb2R1bGUiLCJfX25lc3RNb2R1bGVTY29wZSIsImlzU3RyaWN0TW9kZVN1cHBvcnRlZCIsImlzSW1wbGllZFN0cmljdCIsIm9iamVjdCIsInByb3BlcnR5IiwidmlzaXRQcm9wZXJ0eSIsInZpc2l0Q2xhc3MiLCJfX2lnbm9yZUV2YWwiLCJjYWxsZWUiLCJJZGVudGlmaWVyIiwidmFyaWFibGVTY29wZSIsIl9fZGV0ZWN0RXZhbCIsIl9fbmVzdEJsb2NrU2NvcGUiLCJfX2RldGVjdFRoaXMiLCJfX25lc3RXaXRoU2NvcGUiLCJyZWZzV2l0aFNhbWVJZGVudGlmaWVyIiwicmVmZXJlbmNlcyIsImZpbHRlciIsInJlZmVyZW5jZSIsImlzSWRlbnRpZmllckVxdWFscyIsImRpc2NyaW1pbmFudCIsIl9fbmVzdFN3aXRjaFNjb3BlIiwiY2FzZXMiLCJ2aXNpdEZ1bmN0aW9uIiwidmlzaXRGb3JJbiIsImltcG9ydGVyIiwic291cmNlIiwidmlzaXRFeHBvcnREZWNsYXJhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUF1QkE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7OzsrZUE3QkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQkEsU0FBU0EsMkJBQVQsQ0FBcUNDLE9BQXJDLEVBQThDQyxXQUE5QyxFQUEyREMsVUFBM0QsRUFBdUVDLFFBQXZFLEVBQWlGO0FBQzdFO0FBQ0EsUUFBSUMsVUFBVSxJQUFJQyx3QkFBSixDQUFtQkwsT0FBbkIsRUFBNEJDLFdBQTVCLEVBQXlDRSxRQUF6QyxDQUFkO0FBQ0FDLFlBQVFFLEtBQVIsQ0FBY0wsV0FBZDs7QUFFQTtBQUNBLFFBQUlDLGNBQWMsSUFBbEIsRUFBd0I7QUFDcEJFLGdCQUFRRyxjQUFSLENBQXVCQyxPQUF2QixDQUErQk4sV0FBV0ksS0FBMUMsRUFBaURKLFVBQWpEO0FBQ0g7QUFDSjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVNTyxROzs7QUFDRixzQkFBWUMsV0FBWixFQUF5QlIsVUFBekIsRUFBcUM7QUFBQTs7QUFBQSx3SEFDM0IsSUFEMkIsRUFDckJBLFdBQVdGLE9BRFU7O0FBRWpDLGNBQUtVLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsY0FBS1IsVUFBTCxHQUFrQkEsVUFBbEI7QUFIaUM7QUFJcEM7Ozs7b0NBRVdTLEUsRUFBSUMsUyxFQUFXO0FBQUE7O0FBQ3ZCLGlCQUFLVixVQUFMLENBQWdCVyxZQUFoQixDQUE2QkYsRUFBN0IsRUFBaUMsVUFBQ0csT0FBRCxFQUFhO0FBQzFDLHVCQUFLWixVQUFMLENBQWdCYSxZQUFoQixHQUErQkMsUUFBL0IsQ0FBd0NGLE9BQXhDLEVBQ0ksSUFBSUcsc0JBQUosQ0FDSUMsbUJBQVNDLGFBRGIsRUFFSUwsT0FGSixF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Q0FBa0IwRSxPQUFsQixNQUErQixLQUFLMUUsWUFBTCxDQUFrQjJFLFFBQWxCLEVBQXRDLEVBQW9FLGlGQUFwRTs7QUFFQTBCLHVCQUFXLElBQUl2SCxRQUFKLENBQWFXLElBQWIsRUFBbUIsSUFBbkIsQ0FBWDtBQUNBNEcscUJBQVMxSCxLQUFULENBQWVjLElBQWY7QUFDSDs7OytDQUVzQkEsSSxFQUFNO0FBQ3pCLGdCQUFJQSxLQUFLNkcsTUFBVCxFQUFpQjtBQUNiO0FBQ0g7QUFDRCxnQkFBSTdHLEtBQUtWLFdBQVQsRUFBc0I7QUFDbEIscUJBQUtKLEtBQUwsQ0FBV2MsS0FBS1YsV0FBaEI7QUFDQTtBQUNIOztBQUVELGlCQUFLNEQsYUFBTCxDQUFtQmxELElBQW5CO0FBQ0g7OzswQ0FFaUJBLEksRUFBTTtBQUNwQixpQkFBSzhHLHNCQUFMLENBQTRCOUcsSUFBNUI7QUFDSDs7OytDQUVzQkEsSSxFQUFNO0FBQ3pCLGlCQUFLOEcsc0JBQUwsQ0FBNEI5RyxJQUE1QjtBQUNIOzs7d0NBRWVBLEksRUFBTTtBQUNsQixnQkFBSUMsUUFBU0QsS0FBS1QsRUFBTCxJQUFXUyxLQUFLQyxLQUE3QjtBQUNBLGlCQUFLZixLQUFMLENBQVdlLEtBQVg7QUFDSDs7O3VDQUVjO0FBQ1g7QUFDSDs7OztFQTdmbUNHLG9CQUFVQyxPOztBQWdnQmxEOzs7a0JBaGdCcUJDLFUiLCJmaWxlIjoicmVmZXJlbmNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gIENvcHlyaWdodCAoQykgMjAxNSBZdXN1a2UgU3V6dWtpIDx1dGF0YW5lLnRlYUBnbWFpbC5jb20+XG5cbiAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbiAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiAgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRVxuICBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgPENPUFlSSUdIVCBIT0xERVI+IEJFIExJQUJMRSBGT1IgQU5ZXG4gIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4gIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbiAgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EXG4gIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRlxuICBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuKi9cbmltcG9ydCB7IFN5bnRheCB9IGZyb20gJ2VzdHJhdmVyc2UnO1xuaW1wb3J0IGVzcmVjdXJzZSBmcm9tICdlc3JlY3Vyc2UnO1xuaW1wb3J0IFJlZmVyZW5jZSBmcm9tICcuL3JlZmVyZW5jZSc7XG5pbXBvcnQgVmFyaWFibGUgZnJvbSAnLi92YXJpYWJsZSc7XG5pbXBvcnQgUGF0dGVyblZpc2l0b3IgZnJvbSAnLi9wYXR0ZXJuLXZpc2l0b3InO1xuaW1wb3J0IHsgUGFyYW1ldGVyRGVmaW5pdGlvbiwgRGVmaW5pdGlvbiB9IGZyb20gJy4vZGVmaW5pdGlvbic7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmZ1bmN0aW9uIHRyYXZlcnNlSWRlbnRpZmllckluUGF0dGVybihvcHRpb25zLCByb290UGF0dGVybiwgcmVmZXJlbmNlciwgY2FsbGJhY2spIHtcbiAgICAvLyBDYWxsIHRoZSBjYWxsYmFjayBhdCBsZWZ0IGhhbmQgaWRlbnRpZmllciBub2RlcywgYW5kIENvbGxlY3QgcmlnaHQgaGFuZCBub2Rlcy5cbiAgICB2YXIgdmlzaXRvciA9IG5ldyBQYXR0ZXJuVmlzaXRvcihvcHRpb25zLCByb290UGF0dGVybiwgY2FsbGJhY2spO1xuICAgIHZpc2l0b3IudmlzaXQocm9vdFBhdHRlcm4pO1xuXG4gICAgLy8gUHJvY2VzcyB0aGUgcmlnaHQgaGFuZCBub2RlcyByZWN1cnNpdmVseS5cbiAgICBpZiAocmVmZXJlbmNlciAhPSBudWxsKSB7XG4gICAgICAgIHZpc2l0b3IucmlnaHRIYW5kTm9kZXMuZm9yRWFjaChyZWZlcmVuY2VyLnZpc2l0LCByZWZlcmVuY2VyKTtcbiAgICB9XG59XG5cbi8vIEltcG9ydGluZyBJbXBvcnREZWNsYXJhdGlvbi5cbi8vIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW1vZHVsZWRlY2xhcmF0aW9uaW5zdGFudGlhdGlvblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2VzdHJlZS9lc3RyZWUvYmxvYi9tYXN0ZXIvZXM2Lm1kI2ltcG9ydGRlY2xhcmF0aW9uXG4vLyBGSVhNRTogTm93LCB3ZSBkb24ndCBjcmVhdGUgbW9kdWxlIGVudmlyb25tZW50LCBiZWNhdXNlIHRoZSBjb250ZXh0IGlzXG4vLyBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnQuXG5cbmNsYXNzIEltcG9ydGVyIGV4dGVuZHMgZXNyZWN1cnNlLlZpc2l0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGRlY2xhcmF0aW9uLCByZWZlcmVuY2VyKSB7XG4gICAgICAgIHN1cGVyKG51bGwsIHJlZmVyZW5jZXIub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGVjbGFyYXRpb24gPSBkZWNsYXJhdGlvbjtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2VyID0gcmVmZXJlbmNlcjtcbiAgICB9XG5cbiAgICB2aXNpdEltcG9ydChpZCwgc3BlY2lmaWVyKSB7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlci52aXNpdFBhdHRlcm4oaWQsIChwYXR0ZXJuKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlZmVyZW5jZXIuY3VycmVudFNjb3BlKCkuX19kZWZpbmUocGF0dGVybixcbiAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuSW1wb3J0QmluZGluZyxcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWVyLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2xhcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIobm9kZSkge1xuICAgICAgICBsZXQgbG9jYWwgPSAobm9kZS5sb2NhbCB8fCBub2RlLmlkKTtcbiAgICAgICAgaWYgKGxvY2FsKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0SW1wb3J0KGxvY2FsLCBub2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEltcG9ydERlZmF1bHRTcGVjaWZpZXIobm9kZSkge1xuICAgICAgICBsZXQgbG9jYWwgPSAobm9kZS5sb2NhbCB8fCBub2RlLmlkKTtcbiAgICAgICAgdGhpcy52aXNpdEltcG9ydChsb2NhbCwgbm9kZSk7XG4gICAgfVxuXG4gICAgSW1wb3J0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUubG9jYWwgfHwgbm9kZS5pZCk7XG4gICAgICAgIGlmIChub2RlLm5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRJbXBvcnQobm9kZS5uYW1lLCBub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRJbXBvcnQobG9jYWwsIG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBSZWZlcmVuY2luZyB2YXJpYWJsZXMgYW5kIGNyZWF0aW5nIGJpbmRpbmdzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVmZXJlbmNlciBleHRlbmRzIGVzcmVjdXJzZS5WaXNpdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zLCBzY29wZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIobnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyID0gc2NvcGVNYW5hZ2VyO1xuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJbm5lck1ldGhvZERlZmluaXRpb24gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjdXJyZW50U2NvcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3BlTWFuYWdlci5fX2N1cnJlbnRTY29wZTtcbiAgICB9XG5cbiAgICBjbG9zZShub2RlKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLmN1cnJlbnRTY29wZSgpICYmIG5vZGUgPT09IHRoaXMuY3VycmVudFNjb3BlKCkuYmxvY2spIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fY3VycmVudFNjb3BlID0gdGhpcy5jdXJyZW50U2NvcGUoKS5fX2Nsb3NlKHRoaXMuc2NvcGVNYW5hZ2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1c2hJbm5lck1ldGhvZERlZmluaXRpb24oaXNJbm5lck1ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5pc0lubmVyTWV0aG9kRGVmaW5pdGlvbjtcbiAgICAgICAgdGhpcy5pc0lubmVyTWV0aG9kRGVmaW5pdGlvbiA9IGlzSW5uZXJNZXRob2REZWZpbml0aW9uO1xuICAgICAgICByZXR1cm4gcHJldmlvdXM7XG4gICAgfVxuXG4gICAgcG9wSW5uZXJNZXRob2REZWZpbml0aW9uKGlzSW5uZXJNZXRob2REZWZpbml0aW9uKSB7XG4gICAgICAgIHRoaXMuaXNJbm5lck1ldGhvZERlZmluaXRpb24gPSBpc0lubmVyTWV0aG9kRGVmaW5pdGlvbjtcbiAgICB9XG5cbiAgICBtYXRlcmlhbGl6ZVREWlNjb3BlKG5vZGUsIGl0ZXJhdGlvbk5vZGUpIHtcbiAgICAgICAgLy8gaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtcnVudGltZS1zZW1hbnRpY3MtZm9yaW4tZGl2LW9mZXhwcmVzc2lvbmV2YWx1YXRpb24tYWJzdHJhY3Qtb3BlcmF0aW9uXG4gICAgICAgIC8vIFREWiBzY29wZSBoaWRlcyB0aGUgZGVjbGFyYXRpb24ncyBuYW1lcy5cbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0VERaU2NvcGUobm9kZSwgaXRlcmF0aW9uTm9kZSk7XG4gICAgICAgIHRoaXMudmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuY3VycmVudFNjb3BlKCksIFZhcmlhYmxlLlREWiwgaXRlcmF0aW9uTm9kZS5sZWZ0LCAwLCB0cnVlKTtcbiAgICB9XG5cbiAgICBtYXRlcmlhbGl6ZUl0ZXJhdGlvblNjb3BlKG5vZGUpIHtcbiAgICAgICAgLy8gR2VuZXJhdGUgaXRlcmF0aW9uIHNjb3BlIGZvciB1cHBlciBGb3JJbi9Gb3JPZiBTdGF0ZW1lbnRzLlxuICAgICAgICB2YXIgbGV0T3JDb25zdERlY2w7XG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEZvclNjb3BlKG5vZGUpO1xuICAgICAgICBsZXRPckNvbnN0RGVjbCA9IG5vZGUubGVmdDtcbiAgICAgICAgdGhpcy52aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5jdXJyZW50U2NvcGUoKSwgVmFyaWFibGUuVmFyaWFibGUsIGxldE9yQ29uc3REZWNsLCAwKTtcbiAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obGV0T3JDb25zdERlY2wuZGVjbGFyYXRpb25zWzBdLmlkLCAocGF0dGVybikgPT4ge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKHBhdHRlcm4sIFJlZmVyZW5jZS5XUklURSwgbm9kZS5yaWdodCwgbnVsbCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGFzc2lnbm1lbnRzLCBtYXliZUltcGxpY2l0R2xvYmFsLCBpbml0KSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gdGhpcy5jdXJyZW50U2NvcGUoKTtcbiAgICAgICAgYXNzaWdubWVudHMuZm9yRWFjaChhc3NpZ25tZW50ID0+IHtcbiAgICAgICAgICAgIHNjb3BlLl9fcmVmZXJlbmNpbmcoXG4gICAgICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgICAgICBSZWZlcmVuY2UuV1JJVEUsXG4gICAgICAgICAgICAgICAgYXNzaWdubWVudC5yaWdodCxcbiAgICAgICAgICAgICAgICBtYXliZUltcGxpY2l0R2xvYmFsLFxuICAgICAgICAgICAgICAgIHBhdHRlcm4gIT09IGFzc2lnbm1lbnQubGVmdCxcbiAgICAgICAgICAgICAgICBpbml0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmlzaXRQYXR0ZXJuKG5vZGUsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6IGZhbHNlfVxuICAgICAgICB9XG4gICAgICAgIHRyYXZlcnNlSWRlbnRpZmllckluUGF0dGVybihcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBvcHRpb25zLnByb2Nlc3NSaWdodEhhbmROb2RlcyA/IHRoaXMgOiBudWxsLFxuICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHZpc2l0RnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgaSwgaXo7XG4gICAgICAgIC8vIEZ1bmN0aW9uRGVjbGFyYXRpb24gbmFtZSBpcyBkZWZpbmVkIGluIHVwcGVyIHNjb3BlXG4gICAgICAgIC8vIE5PVEU6IE5vdCByZWZlcnJpbmcgdmFyaWFibGVTY29wZS4gSXQgaXMgaW50ZW5kZWQuXG4gICAgICAgIC8vIFNpbmNlXG4gICAgICAgIC8vICBpbiBFUzUsIEZ1bmN0aW9uRGVjbGFyYXRpb24gc2hvdWxkIGJlIGluIEZ1bmN0aW9uQm9keS5cbiAgICAgICAgLy8gIGluIEVTNiwgRnVuY3Rpb25EZWNsYXJhdGlvbiBzaG91bGQgYmUgYmxvY2sgc2NvcGVkLlxuICAgICAgICBpZiAobm9kZS50eXBlID09PSBTeW50YXguRnVuY3Rpb25EZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgLy8gaWQgaXMgZGVmaW5lZCBpbiB1cHBlciBzY29wZVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlLkZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRnVuY3Rpb25FeHByZXNzaW9uIHdpdGggbmFtZSBjcmVhdGVzIGl0cyBzcGVjaWFsIHNjb3BlO1xuICAgICAgICAvLyBGdW5jdGlvbkV4cHJlc3Npb25OYW1lU2NvcGUuXG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09IFN5bnRheC5GdW5jdGlvbkV4cHJlc3Npb24gJiYgbm9kZS5pZCkge1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0RnVuY3Rpb25FeHByZXNzaW9uTmFtZVNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uc2lkZXIgdGhpcyBmdW5jdGlvbiBpcyBpbiB0aGUgTWV0aG9kRGVmaW5pdGlvbi5cbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0RnVuY3Rpb25TY29wZShub2RlLCB0aGlzLmlzSW5uZXJNZXRob2REZWZpbml0aW9uKTtcblxuICAgICAgICAvLyBQcm9jZXNzIHBhcmFtZXRlciBkZWNsYXJhdGlvbnMuXG4gICAgICAgIGZvciAoaSA9IDAsIGl6ID0gbm9kZS5wYXJhbXMubGVuZ3RoOyBpIDwgaXo7ICsraSkge1xuICAgICAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obm9kZS5wYXJhbXNbaV0sIHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6IHRydWV9LCAocGF0dGVybiwgaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUocGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBhcmFtZXRlckRlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnJlc3RcbiAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGluZm8uYXNzaWdubWVudHMsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGEgcmVzdCBhcmd1bWVudCwgYWRkIHRoYXRcbiAgICAgICAgaWYgKG5vZGUucmVzdCkge1xuICAgICAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4oe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdSZXN0RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgYXJndW1lbnQ6IG5vZGUucmVzdFxuICAgICAgICAgICAgfSwgKHBhdHRlcm4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQYXJhbWV0ZXJEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnBhcmFtcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTa2lwIEJsb2NrU3RhdGVtZW50IHRvIHByZXZlbnQgY3JlYXRpbmcgQmxvY2tTdGF0ZW1lbnQgc2NvcGUuXG4gICAgICAgIGlmIChub2RlLmJvZHkudHlwZSA9PT0gU3ludGF4LkJsb2NrU3RhdGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5ib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgdmlzaXRDbGFzcyhub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09IFN5bnRheC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuQ2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGSVhNRTogTWF5YmUgY29uc2lkZXIgVERaLlxuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuc3VwZXJDbGFzcyk7XG5cbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0Q2xhc3NTY29wZShub2RlKTtcblxuICAgICAgICBpZiAobm9kZS5pZCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlLkNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIHZpc2l0UHJvcGVydHkobm9kZSkge1xuICAgICAgICB2YXIgcHJldmlvdXMsIGlzTWV0aG9kRGVmaW5pdGlvbjtcbiAgICAgICAgaWYgKG5vZGUuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5rZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNNZXRob2REZWZpbml0aW9uID0gbm9kZS50eXBlID09PSBTeW50YXguTWV0aG9kRGVmaW5pdGlvbjtcbiAgICAgICAgaWYgKGlzTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgcHJldmlvdXMgPSB0aGlzLnB1c2hJbm5lck1ldGhvZERlZmluaXRpb24odHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXNpdChub2RlLnZhbHVlKTtcbiAgICAgICAgaWYgKGlzTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wb3BJbm5lck1ldGhvZERlZmluaXRpb24ocHJldmlvdXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmlzaXRGb3JJbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLmxlZnQudHlwZSA9PT0gU3ludGF4LlZhcmlhYmxlRGVjbGFyYXRpb24gJiYgbm9kZS5sZWZ0LmtpbmQgIT09ICd2YXInKSB7XG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsaXplVERaU2NvcGUobm9kZS5yaWdodCwgbm9kZSk7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUucmlnaHQpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZShub2RlLnJpZ2h0KTtcblxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbGl6ZUl0ZXJhdGlvblNjb3BlKG5vZGUpO1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChub2RlLmxlZnQudHlwZSA9PT0gU3ludGF4LlZhcmlhYmxlRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUubGVmdCk7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obm9kZS5sZWZ0LmRlY2xhcmF0aW9uc1swXS5pZCwgKHBhdHRlcm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKHBhdHRlcm4sIFJlZmVyZW5jZS5XUklURSwgbm9kZS5yaWdodCwgbnVsbCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKG5vZGUubGVmdCwge3Byb2Nlc3NSaWdodEhhbmROb2RlczogdHJ1ZX0sIChwYXR0ZXJuLCBpbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXliZUltcGxpY2l0R2xvYmFsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTY29wZSgpLmlzU3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUltcGxpY2l0R2xvYmFsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGluZm8uYXNzaWdubWVudHMsIG1heWJlSW1wbGljaXRHbG9iYWwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKHBhdHRlcm4sIFJlZmVyZW5jZS5XUklURSwgbm9kZS5yaWdodCwgbWF5YmVJbXBsaWNpdEdsb2JhbCwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLnJpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbih2YXJpYWJsZVRhcmdldFNjb3BlLCB0eXBlLCBub2RlLCBpbmRleCwgZnJvbVREWikge1xuICAgICAgICAvLyBJZiB0aGlzIHdhcyBjYWxsZWQgdG8gaW5pdGlhbGl6ZSBhIFREWiBzY29wZSwgdGhpcyBuZWVkcyB0byBtYWtlIGRlZmluaXRpb25zLCBidXQgZG9lc24ndCBtYWtlIHJlZmVyZW5jZXMuXG4gICAgICAgIHZhciBkZWNsLCBpbml0O1xuXG4gICAgICAgIGRlY2wgPSBub2RlLmRlY2xhcmF0aW9uc1tpbmRleF07XG4gICAgICAgIGluaXQgPSBkZWNsLmluaXQ7XG4gICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKGRlY2wuaWQsIHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6ICFmcm9tVERafSwgKHBhdHRlcm4sIGluZm8pID0+IHtcbiAgICAgICAgICAgIHZhcmlhYmxlVGFyZ2V0U2NvcGUuX19kZWZpbmUocGF0dGVybixcbiAgICAgICAgICAgICAgICBuZXcgRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgZGVjbCxcbiAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUua2luZFxuICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBpZiAoIWZyb21URFopIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGluZm8uYXNzaWdubWVudHMsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcocGF0dGVybiwgUmVmZXJlbmNlLldSSVRFLCBpbml0LCBudWxsLCAhaW5mby50b3BMZXZlbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEFzc2lnbm1lbnRFeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgaWYgKFBhdHRlcm5WaXNpdG9yLmlzUGF0dGVybihub2RlLmxlZnQpKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5vcGVyYXRvciA9PT0gJz0nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obm9kZS5sZWZ0LCB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiB0cnVlfSwgKHBhdHRlcm4sIGluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1heWJlSW1wbGljaXRHbG9iYWwgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNjb3BlKCkuaXNTdHJpY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlSW1wbGljaXRHbG9iYWwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgaW5mby5hc3NpZ25tZW50cywgbWF5YmVJbXBsaWNpdEdsb2JhbCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcocGF0dGVybiwgUmVmZXJlbmNlLldSSVRFLCBub2RlLnJpZ2h0LCBtYXliZUltcGxpY2l0R2xvYmFsLCAhaW5mby50b3BMZXZlbCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcobm9kZS5sZWZ0LCBSZWZlcmVuY2UuUlcsIG5vZGUucmlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmxlZnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5yaWdodCk7XG4gICAgfVxuXG4gICAgQ2F0Y2hDbGF1c2Uobm9kZSkge1xuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RDYXRjaFNjb3BlKG5vZGUpO1xuXG4gICAgICAgIHRoaXMudmlzaXRQYXR0ZXJuKG5vZGUucGFyYW0sIHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6IHRydWV9LCAocGF0dGVybiwgaW5mbykgPT4ge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShwYXR0ZXJuLFxuICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZS5DYXRjaENsYXVzZSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJhbSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBpbmZvLmFzc2lnbm1lbnRzLCBudWxsLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIFByb2dyYW0obm9kZSkge1xuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RHbG9iYWxTY29wZShub2RlKTtcblxuICAgICAgICBpZiAodGhpcy5zY29wZU1hbmFnZXIuX19pc05vZGVqc1Njb3BlKCkpIHtcbiAgICAgICAgICAgIC8vIEZvcmNlIHN0cmljdG5lc3Mgb2YgR2xvYmFsU2NvcGUgdG8gZmFsc2Ugd2hlbiB1c2luZyBub2RlLmpzIHNjb3BlLlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5pc1N0cmljdCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0RnVuY3Rpb25TY29wZShub2RlLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zY29wZU1hbmFnZXIuX19pc0VTNigpICYmIHRoaXMuc2NvcGVNYW5hZ2VyLmlzTW9kdWxlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdE1vZHVsZVNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2NvcGVNYW5hZ2VyLmlzU3RyaWN0TW9kZVN1cHBvcnRlZCgpICYmIHRoaXMuc2NvcGVNYW5hZ2VyLmlzSW1wbGllZFN0cmljdCgpKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLmlzU3RyaWN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICBJZGVudGlmaWVyKG5vZGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX3JlZmVyZW5jaW5nKG5vZGUpO1xuICAgIH1cblxuICAgIFVwZGF0ZUV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICBpZiAoUGF0dGVyblZpc2l0b3IuaXNQYXR0ZXJuKG5vZGUuYXJndW1lbnQpKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcobm9kZS5hcmd1bWVudCwgUmVmZXJlbmNlLlJXLCBudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE1lbWJlckV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0KG5vZGUub2JqZWN0KTtcbiAgICAgICAgaWYgKG5vZGUuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5wcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBQcm9wZXJ0eShub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXRQcm9wZXJ0eShub2RlKTtcbiAgICB9XG5cbiAgICBNZXRob2REZWZpbml0aW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdFByb3BlcnR5KG5vZGUpO1xuICAgIH1cblxuICAgIEJyZWFrU3RhdGVtZW50KCkge31cblxuICAgIENvbnRpbnVlU3RhdGVtZW50KCkge31cblxuICAgIExhYmVsZWRTdGF0ZW1lbnQobm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG4gICAgfVxuXG4gICAgRm9yU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgLy8gQ3JlYXRlIEZvclN0YXRlbWVudCBkZWNsYXJhdGlvbi5cbiAgICAgICAgLy8gTk9URTogSW4gRVM2LCBGb3JTdGF0ZW1lbnQgZHluYW1pY2FsbHkgZ2VuZXJhdGVzXG4gICAgICAgIC8vIHBlciBpdGVyYXRpb24gZW52aXJvbm1lbnQuIEhvd2V2ZXIsIGVzY29wZSBpc1xuICAgICAgICAvLyBhIHN0YXRpYyBhbmFseXplciwgd2Ugb25seSBnZW5lcmF0ZSBvbmUgc2NvcGUgZm9yIEZvclN0YXRlbWVudC5cbiAgICAgICAgaWYgKG5vZGUuaW5pdCAmJiBub2RlLmluaXQudHlwZSA9PT0gU3ludGF4LlZhcmlhYmxlRGVjbGFyYXRpb24gJiYgbm9kZS5pbml0LmtpbmQgIT09ICd2YXInKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RGb3JTY29wZShub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIENsYXNzRXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXRDbGFzcyhub2RlKTtcbiAgICB9XG5cbiAgICBDbGFzc0RlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdENsYXNzKG5vZGUpO1xuICAgIH1cblxuICAgIENhbGxFeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgLy8gQ2hlY2sgdGhpcyBpcyBkaXJlY3QgY2FsbCB0byBldmFsXG4gICAgICAgIGlmICghdGhpcy5zY29wZU1hbmFnZXIuX19pZ25vcmVFdmFsKCkgJiYgbm9kZS5jYWxsZWUudHlwZSA9PT0gU3ludGF4LklkZW50aWZpZXIgJiYgbm9kZS5jYWxsZWUubmFtZSA9PT0gJ2V2YWwnKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBUaGlzIHNob3VsZCBiZSBgdmFyaWFibGVTY29wZWAuIFNpbmNlIGRpcmVjdCBldmFsIGNhbGwgYWx3YXlzIGNyZWF0ZXMgTGV4aWNhbCBlbnZpcm9ubWVudCBhbmRcbiAgICAgICAgICAgIC8vIGxldCAvIGNvbnN0IHNob3VsZCBiZSBlbmNsb3NlZCBpbnRvIGl0LiBPbmx5IFZhcmlhYmxlRGVjbGFyYXRpb24gYWZmZWN0cyBvbiB0aGUgY2FsbGVyJ3MgZW52aXJvbm1lbnQuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLnZhcmlhYmxlU2NvcGUuX19kZXRlY3RFdmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIEJsb2NrU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc2NvcGVNYW5hZ2VyLl9faXNFUzYoKSkge1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0QmxvY2tTY29wZShub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIFRoaXNFeHByZXNzaW9uKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLnZhcmlhYmxlU2NvcGUuX19kZXRlY3RUaGlzKCk7XG4gICAgfVxuXG4gICAgV2l0aFN0YXRlbWVudChub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5vYmplY3QpO1xuICAgICAgICAvLyBUaGVuIG5lc3Qgc2NvcGUgZm9yIFdpdGhTdGF0ZW1lbnQuXG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdFdpdGhTY29wZShub2RlKTtcblxuICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICBWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIHZhcmlhYmxlVGFyZ2V0U2NvcGUsIGksIGl6LCBkZWNsO1xuICAgICAgICB2YXJpYWJsZVRhcmdldFNjb3BlID0gKG5vZGUua2luZCA9PT0gJ3ZhcicpID8gdGhpcy5jdXJyZW50U2NvcGUoKS52YXJpYWJsZVNjb3BlIDogdGhpcy5jdXJyZW50U2NvcGUoKTtcbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBub2RlLmRlY2xhcmF0aW9ucy5sZW5ndGg7IGkgPCBpejsgKytpKSB7XG4gICAgICAgICAgICBkZWNsID0gbm9kZS5kZWNsYXJhdGlvbnNbaV07XG4gICAgICAgICAgICB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbih2YXJpYWJsZVRhcmdldFNjb3BlLCBWYXJpYWJsZS5WYXJpYWJsZSwgbm9kZSwgaSk7XG4gICAgICAgICAgICBpZiAoZGVjbC5pbml0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdChkZWNsLmluaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgSlNYRWxlbWVudChub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlKTtcbiAgICB9XG5cbiAgICBKU1hDbG9zaW5nRWxlbWVudChub2RlKSB7XG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgSlNYSWRlbnRpZmllcihub2RlKSB7XG4gICAgICAgIG5vZGUudHlwZSA9IFwiSWRlbnRpZmllclwiO1xuICAgICAgICBjb25zdCByZWZzV2l0aFNhbWVJZGVudGlmaWVyID0gdGhpcy5jdXJyZW50U2NvcGUoKS5yZWZlcmVuY2VzLmZpbHRlcihyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLmlzSWRlbnRpZmllckVxdWFscyhub2RlKSk7XG5cbiAgICAgICAgaWYgKHJlZnNXaXRoU2FtZUlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcobm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG5cblxuICAgIC8vIHNlYyAxMy4xMS44XG4gICAgU3dpdGNoU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdmFyIGksIGl6O1xuXG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5kaXNjcmltaW5hbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdFN3aXRjaFNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBub2RlLmNhc2VzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5jYXNlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIEZ1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RnVuY3Rpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEZvck9mU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEZvckluU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGltcG9ydGVyO1xuXG4gICAgICAgIGFzc2VydCh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkgJiYgdGhpcy5zY29wZU1hbmFnZXIuaXNNb2R1bGUoKSwgJ0ltcG9ydERlY2xhcmF0aW9uIHNob3VsZCBhcHBlYXIgd2hlbiB0aGUgbW9kZSBpcyBFUzYgYW5kIGluIHRoZSBtb2R1bGUgY29udGV4dC4nKTtcblxuICAgICAgICBpbXBvcnRlciA9IG5ldyBJbXBvcnRlcihub2RlLCB0aGlzKTtcbiAgICAgICAgaW1wb3J0ZXIudmlzaXQobm9kZSk7XG4gICAgfVxuXG4gICAgdmlzaXRFeHBvcnREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuZGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RXhwb3J0RGVjbGFyYXRpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRXhwb3J0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUuaWQgfHwgbm9kZS5sb2NhbCk7XG4gICAgICAgIHRoaXMudmlzaXQobG9jYWwpO1xuICAgIH1cblxuICAgIE1ldGFQcm9wZXJ0eSgpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZy5cbiAgICB9XG59XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXX0=
