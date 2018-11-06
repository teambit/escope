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

        // JSXOpeningElement(node) {
        //     this.visitChildren(node);
        // }

    }, {
        key: 'JSXIdentifier',
        value: function JSXIdentifier(node) {
            node.type = "Identifier";
            var refsWithSameIdentifier = this.currentScope().references.filter(function (reference) {
                return reference.identifier.name === node.name;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW5jZXIuanMiXSwibmFtZXMiOlsidHJhdmVyc2VJZGVudGlmaWVySW5QYXR0ZXJuIiwib3B0aW9ucyIsInJvb3RQYXR0ZXJuIiwicmVmZXJlbmNlciIsImNhbGxiYWNrIiwidmlzaXRvciIsIlBhdHRlcm5WaXNpdG9yIiwidmlzaXQiLCJyaWdodEhhbmROb2RlcyIsImZvckVhY2giLCJJbXBvcnRlciIsImRlY2xhcmF0aW9uIiwiaWQiLCJzcGVjaWZpZXIiLCJ2aXNpdFBhdHRlcm4iLCJwYXR0ZXJuIiwiY3VycmVudFNjb3BlIiwiX19kZWZpbmUiLCJEZWZpbml0aW9uIiwiVmFyaWFibGUiLCJJbXBvcnRCaW5kaW5nIiwibm9kZSIsImxvY2FsIiwidmlzaXRJbXBvcnQiLCJuYW1lIiwiZXNyZWN1cnNlIiwiVmlzaXRvciIsIlJlZmVyZW5jZXIiLCJzY29wZU1hbmFnZXIiLCJwYXJlbnQiLCJpc0lubmVyTWV0aG9kRGVmaW5pdGlvbiIsIl9fY3VycmVudFNjb3BlIiwiYmxvY2siLCJfX2Nsb3NlIiwicHJldmlvdXMiLCJpdGVyYXRpb25Ob2RlIiwiX19uZXN0VERaU2NvcGUiLCJ2aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24iLCJURFoiLCJsZWZ0IiwibGV0T3JDb25zdERlY2wiLCJfX25lc3RGb3JTY29wZSIsImRlY2xhcmF0aW9ucyIsIl9fcmVmZXJlbmNpbmciLCJSZWZlcmVuY2UiLCJXUklURSIsInJpZ2h0IiwiYXNzaWdubWVudHMiLCJtYXliZUltcGxpY2l0R2xvYmFsIiwiaW5pdCIsInNjb3BlIiwiYXNzaWdubWVudCIsInByb2Nlc3NSaWdodEhhbmROb2RlcyIsImkiLCJpeiIsInR5cGUiLCJTeW50YXgiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiRnVuY3Rpb25OYW1lIiwiRnVuY3Rpb25FeHByZXNzaW9uIiwiX19uZXN0RnVuY3Rpb25FeHByZXNzaW9uTmFtZVNjb3BlIiwiX19uZXN0RnVuY3Rpb25TY29wZSIsInBhcmFtcyIsImxlbmd0aCIsImluZm8iLCJQYXJhbWV0ZXJEZWZpbml0aW9uIiwicmVzdCIsInJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlIiwiYXJndW1lbnQiLCJib2R5IiwiQmxvY2tTdGF0ZW1lbnQiLCJ2aXNpdENoaWxkcmVuIiwiY2xvc2UiLCJDbGFzc0RlY2xhcmF0aW9uIiwiQ2xhc3NOYW1lIiwic3VwZXJDbGFzcyIsIl9fbmVzdENsYXNzU2NvcGUiLCJpc01ldGhvZERlZmluaXRpb24iLCJjb21wdXRlZCIsImtleSIsIk1ldGhvZERlZmluaXRpb24iLCJwdXNoSW5uZXJNZXRob2REZWZpbml0aW9uIiwidmFsdWUiLCJwb3BJbm5lck1ldGhvZERlZmluaXRpb24iLCJWYXJpYWJsZURlY2xhcmF0aW9uIiwia2luZCIsIm1hdGVyaWFsaXplVERaU2NvcGUiLCJtYXRlcmlhbGl6ZUl0ZXJhdGlvblNjb3BlIiwiaXNTdHJpY3QiLCJ2YXJpYWJsZVRhcmdldFNjb3BlIiwiaW5kZXgiLCJmcm9tVERaIiwiZGVjbCIsInRvcExldmVsIiwiaXNQYXR0ZXJuIiwib3BlcmF0b3IiLCJSVyIsIl9fbmVzdENhdGNoU2NvcGUiLCJwYXJhbSIsIkNhdGNoQ2xhdXNlIiwiX19uZXN0R2xvYmFsU2NvcGUiLCJfX2lzTm9kZWpzU2NvcGUiLCJfX2lzRVM2IiwiaXNNb2R1bGUiLCJfX25lc3RNb2R1bGVTY29wZSIsImlzU3RyaWN0TW9kZVN1cHBvcnRlZCIsImlzSW1wbGllZFN0cmljdCIsIm9iamVjdCIsInByb3BlcnR5IiwidmlzaXRQcm9wZXJ0eSIsInZpc2l0Q2xhc3MiLCJfX2lnbm9yZUV2YWwiLCJjYWxsZWUiLCJJZGVudGlmaWVyIiwidmFyaWFibGVTY29wZSIsIl9fZGV0ZWN0RXZhbCIsIl9fbmVzdEJsb2NrU2NvcGUiLCJfX2RldGVjdFRoaXMiLCJfX25lc3RXaXRoU2NvcGUiLCJyZWZzV2l0aFNhbWVJZGVudGlmaWVyIiwicmVmZXJlbmNlcyIsImZpbHRlciIsInJlZmVyZW5jZSIsImlkZW50aWZpZXIiLCJkaXNjcmltaW5hbnQiLCJfX25lc3RTd2l0Y2hTY29wZSIsImNhc2VzIiwidmlzaXRGdW5jdGlvbiIsInZpc2l0Rm9ySW4iLCJpbXBvcnRlciIsInNvdXJjZSIsInZpc2l0RXhwb3J0RGVjbGFyYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBdUJBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7K2VBN0JBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0JBLFNBQVNBLDJCQUFULENBQXFDQyxPQUFyQyxFQUE4Q0MsV0FBOUMsRUFBMkRDLFVBQTNELEVBQXVFQyxRQUF2RSxFQUFpRjtBQUM3RTtBQUNBLFFBQUlDLFVBQVUsSUFBSUMsd0JBQUosQ0FBbUJMLE9BQW5CLEVBQTRCQyxXQUE1QixFQUF5Q0UsUUFBekMsQ0FBZDtBQUNBQyxZQUFRRSxLQUFSLENBQWNMLFdBQWQ7O0FBRUE7QUFDQSxRQUFJQyxjQUFjLElBQWxCLEVBQXdCO0FBQ3BCRSxnQkFBUUcsY0FBUixDQUF1QkMsT0FBdkIsQ0FBK0JOLFdBQVdJLEtBQTFDLEVBQWlESixVQUFqRDtBQUNIO0FBQ0o7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFFTU8sUTs7O0FBQ0Ysc0JBQVlDLFdBQVosRUFBeUJSLFVBQXpCLEVBQXFDO0FBQUE7O0FBQUEsd0hBQzNCLElBRDJCLEVBQ3JCQSxXQUFXRixPQURVOztBQUVqQyxjQUFLVSxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLGNBQUtSLFVBQUwsR0FBa0JBLFVBQWxCO0FBSGlDO0FBSXBDOzs7O29DQUVXUyxFLEVBQUlDLFMsRUFBVztBQUFBOztBQUN2QixpQkFBS1YsVUFBTCxDQUFnQlcsWUFBaEIsQ0FBNkJGLEVBQTdCLEVBQWlDLFVBQUNHLE9BQUQsRUFBYTtBQUMxQyx1QkFBS1osVUFBTCxDQUFnQmEsWUFBaEIsR0FBK0JDLFFBQS9CLENBQXdDRixPQUF4QyxFQUNJLElBQUlHLHNCQUFKLENBQ0lDLG1CQUFTQyxhQURiLEVBRUlMLE9BRkosRUFHSUYsU0FI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LENBQWtCMkUsUUFBbEIsRUFBdEMsRUFBb0UsaUZBQXBFOztBQUVBMEIsdUJBQVcsSUFBSXZILFFBQUosQ0FBYVcsSUFBYixFQUFtQixJQUFuQixDQUFYO0FBQ0E0RyxxQkFBUzFILEtBQVQsQ0FBZWMsSUFBZjtBQUNIOzs7K0NBRXNCQSxJLEVBQU07QUFDekIsZ0JBQUlBLEtBQUs2RyxNQUFULEVBQWlCO0FBQ2I7QUFDSDtBQUNELGdCQUFJN0csS0FBS1YsV0FBVCxFQUFzQjtBQUNsQixxQkFBS0osS0FBTCxDQUFXYyxLQUFLVixXQUFoQjtBQUNBO0FBQ0g7O0FBRUQsaUJBQUs0RCxhQUFMLENBQW1CbEQsSUFBbkI7QUFDSDs7OzBDQUVpQkEsSSxFQUFNO0FBQ3BCLGlCQUFLOEcsc0JBQUwsQ0FBNEI5RyxJQUE1QjtBQUNIOzs7K0NBRXNCQSxJLEVBQU07QUFDekIsaUJBQUs4RyxzQkFBTCxDQUE0QjlHLElBQTVCO0FBQ0g7Ozt3Q0FFZUEsSSxFQUFNO0FBQ2xCLGdCQUFJQyxRQUFTRCxLQUFLVCxFQUFMLElBQVdTLEtBQUtDLEtBQTdCO0FBQ0EsaUJBQUtmLEtBQUwsQ0FBV2UsS0FBWDtBQUNIOzs7dUNBRWM7QUFDWDtBQUNIOzs7O0VBN2ZtQ0csb0JBQVVDLE87O0FBZ2dCbEQ7OztrQkFoZ0JxQkMsVSIsImZpbGUiOiJyZWZlcmVuY2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgQ29weXJpZ2h0IChDKSAyMDE1IFl1c3VrZSBTdXp1a2kgPHV0YXRhbmUudGVhQGdtYWlsLmNvbT5cblxuICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFXG4gIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Q09QWVJJR0hUIEhPTERFUj4gQkUgTElBQkxFIEZPUiBBTllcbiAgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuICBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GXG4gIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuaW1wb3J0IHsgU3ludGF4IH0gZnJvbSAnZXN0cmF2ZXJzZSc7XG5pbXBvcnQgZXNyZWN1cnNlIGZyb20gJ2VzcmVjdXJzZSc7XG5pbXBvcnQgUmVmZXJlbmNlIGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCBWYXJpYWJsZSBmcm9tICcuL3ZhcmlhYmxlJztcbmltcG9ydCBQYXR0ZXJuVmlzaXRvciBmcm9tICcuL3BhdHRlcm4tdmlzaXRvcic7XG5pbXBvcnQgeyBQYXJhbWV0ZXJEZWZpbml0aW9uLCBEZWZpbml0aW9uIH0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuZnVuY3Rpb24gdHJhdmVyc2VJZGVudGlmaWVySW5QYXR0ZXJuKG9wdGlvbnMsIHJvb3RQYXR0ZXJuLCByZWZlcmVuY2VyLCBjYWxsYmFjaykge1xuICAgIC8vIENhbGwgdGhlIGNhbGxiYWNrIGF0IGxlZnQgaGFuZCBpZGVudGlmaWVyIG5vZGVzLCBhbmQgQ29sbGVjdCByaWdodCBoYW5kIG5vZGVzLlxuICAgIHZhciB2aXNpdG9yID0gbmV3IFBhdHRlcm5WaXNpdG9yKG9wdGlvbnMsIHJvb3RQYXR0ZXJuLCBjYWxsYmFjayk7XG4gICAgdmlzaXRvci52aXNpdChyb290UGF0dGVybik7XG5cbiAgICAvLyBQcm9jZXNzIHRoZSByaWdodCBoYW5kIG5vZGVzIHJlY3Vyc2l2ZWx5LlxuICAgIGlmIChyZWZlcmVuY2VyICE9IG51bGwpIHtcbiAgICAgICAgdmlzaXRvci5yaWdodEhhbmROb2Rlcy5mb3JFYWNoKHJlZmVyZW5jZXIudmlzaXQsIHJlZmVyZW5jZXIpO1xuICAgIH1cbn1cblxuLy8gSW1wb3J0aW5nIEltcG9ydERlY2xhcmF0aW9uLlxuLy8gaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtbW9kdWxlZGVjbGFyYXRpb25pbnN0YW50aWF0aW9uXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZXN0cmVlL2VzdHJlZS9ibG9iL21hc3Rlci9lczYubWQjaW1wb3J0ZGVjbGFyYXRpb25cbi8vIEZJWE1FOiBOb3csIHdlIGRvbid0IGNyZWF0ZSBtb2R1bGUgZW52aXJvbm1lbnQsIGJlY2F1c2UgdGhlIGNvbnRleHQgaXNcbi8vIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudC5cblxuY2xhc3MgSW1wb3J0ZXIgZXh0ZW5kcyBlc3JlY3Vyc2UuVmlzaXRvciB7XG4gICAgY29uc3RydWN0b3IoZGVjbGFyYXRpb24sIHJlZmVyZW5jZXIpIHtcbiAgICAgICAgc3VwZXIobnVsbCwgcmVmZXJlbmNlci5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5kZWNsYXJhdGlvbiA9IGRlY2xhcmF0aW9uO1xuICAgICAgICB0aGlzLnJlZmVyZW5jZXIgPSByZWZlcmVuY2VyO1xuICAgIH1cblxuICAgIHZpc2l0SW1wb3J0KGlkLCBzcGVjaWZpZXIpIHtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2VyLnZpc2l0UGF0dGVybihpZCwgKHBhdHRlcm4pID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlci5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShwYXR0ZXJuLFxuICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZS5JbXBvcnRCaW5kaW5nLFxuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICBzcGVjaWZpZXIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjbGFyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEltcG9ydE5hbWVzcGFjZVNwZWNpZmllcihub2RlKSB7XG4gICAgICAgIGxldCBsb2NhbCA9IChub2RlLmxvY2FsIHx8IG5vZGUuaWQpO1xuICAgICAgICBpZiAobG9jYWwpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRJbXBvcnQobG9jYWwsIG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgSW1wb3J0RGVmYXVsdFNwZWNpZmllcihub2RlKSB7XG4gICAgICAgIGxldCBsb2NhbCA9IChub2RlLmxvY2FsIHx8IG5vZGUuaWQpO1xuICAgICAgICB0aGlzLnZpc2l0SW1wb3J0KGxvY2FsLCBub2RlKTtcbiAgICB9XG5cbiAgICBJbXBvcnRTcGVjaWZpZXIobm9kZSkge1xuICAgICAgICBsZXQgbG9jYWwgPSAobm9kZS5sb2NhbCB8fCBub2RlLmlkKTtcbiAgICAgICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgICAgICAgdGhpcy52aXNpdEltcG9ydChub2RlLm5hbWUsIG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aXNpdEltcG9ydChsb2NhbCwgbm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIFJlZmVyZW5jaW5nIHZhcmlhYmxlcyBhbmQgY3JlYXRpbmcgYmluZGluZ3MuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWZlcmVuY2VyIGV4dGVuZHMgZXNyZWN1cnNlLlZpc2l0b3Ige1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMsIHNjb3BlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihudWxsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIgPSBzY29wZU1hbmFnZXI7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5pc0lubmVyTWV0aG9kRGVmaW5pdGlvbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGN1cnJlbnRTY29wZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVNYW5hZ2VyLl9fY3VycmVudFNjb3BlO1xuICAgIH1cblxuICAgIGNsb3NlKG5vZGUpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuY3VycmVudFNjb3BlKCkgJiYgbm9kZSA9PT0gdGhpcy5jdXJyZW50U2NvcGUoKS5ibG9jaykge1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19jdXJyZW50U2NvcGUgPSB0aGlzLmN1cnJlbnRTY29wZSgpLl9fY2xvc2UodGhpcy5zY29wZU1hbmFnZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVzaElubmVyTWV0aG9kRGVmaW5pdGlvbihpc0lubmVyTWV0aG9kRGVmaW5pdGlvbikge1xuICAgICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLmlzSW5uZXJNZXRob2REZWZpbml0aW9uO1xuICAgICAgICB0aGlzLmlzSW5uZXJNZXRob2REZWZpbml0aW9uID0gaXNJbm5lck1ldGhvZERlZmluaXRpb247XG4gICAgICAgIHJldHVybiBwcmV2aW91cztcbiAgICB9XG5cbiAgICBwb3BJbm5lck1ldGhvZERlZmluaXRpb24oaXNJbm5lck1ldGhvZERlZmluaXRpb24pIHtcbiAgICAgICAgdGhpcy5pc0lubmVyTWV0aG9kRGVmaW5pdGlvbiA9IGlzSW5uZXJNZXRob2REZWZpbml0aW9uO1xuICAgIH1cblxuICAgIG1hdGVyaWFsaXplVERaU2NvcGUobm9kZSwgaXRlcmF0aW9uTm9kZSkge1xuICAgICAgICAvLyBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1ydW50aW1lLXNlbWFudGljcy1mb3Jpbi1kaXYtb2ZleHByZXNzaW9uZXZhbHVhdGlvbi1hYnN0cmFjdC1vcGVyYXRpb25cbiAgICAgICAgLy8gVERaIHNjb3BlIGhpZGVzIHRoZSBkZWNsYXJhdGlvbidzIG5hbWVzLlxuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RURFpTY29wZShub2RlLCBpdGVyYXRpb25Ob2RlKTtcbiAgICAgICAgdGhpcy52aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5jdXJyZW50U2NvcGUoKSwgVmFyaWFibGUuVERaLCBpdGVyYXRpb25Ob2RlLmxlZnQsIDAsIHRydWUpO1xuICAgIH1cblxuICAgIG1hdGVyaWFsaXplSXRlcmF0aW9uU2NvcGUobm9kZSkge1xuICAgICAgICAvLyBHZW5lcmF0ZSBpdGVyYXRpb24gc2NvcGUgZm9yIHVwcGVyIEZvckluL0Zvck9mIFN0YXRlbWVudHMuXG4gICAgICAgIHZhciBsZXRPckNvbnN0RGVjbDtcbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0Rm9yU2NvcGUobm9kZSk7XG4gICAgICAgIGxldE9yQ29uc3REZWNsID0gbm9kZS5sZWZ0O1xuICAgICAgICB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmN1cnJlbnRTY29wZSgpLCBWYXJpYWJsZS5WYXJpYWJsZSwgbGV0T3JDb25zdERlY2wsIDApO1xuICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihsZXRPckNvbnN0RGVjbC5kZWNsYXJhdGlvbnNbMF0uaWQsIChwYXR0ZXJuKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcocGF0dGVybiwgUmVmZXJlbmNlLldSSVRFLCBub2RlLnJpZ2h0LCBudWxsLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgYXNzaWdubWVudHMsIG1heWJlSW1wbGljaXRHbG9iYWwsIGluaXQpIHtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSB0aGlzLmN1cnJlbnRTY29wZSgpO1xuICAgICAgICBhc3NpZ25tZW50cy5mb3JFYWNoKGFzc2lnbm1lbnQgPT4ge1xuICAgICAgICAgICAgc2NvcGUuX19yZWZlcmVuY2luZyhcbiAgICAgICAgICAgICAgICBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgIFJlZmVyZW5jZS5XUklURSxcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50LnJpZ2h0LFxuICAgICAgICAgICAgICAgIG1heWJlSW1wbGljaXRHbG9iYWwsXG4gICAgICAgICAgICAgICAgcGF0dGVybiAhPT0gYXNzaWdubWVudC5sZWZ0LFxuICAgICAgICAgICAgICAgIGluaXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB2aXNpdFBhdHRlcm4obm9kZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0ge3Byb2Nlc3NSaWdodEhhbmROb2RlczogZmFsc2V9XG4gICAgICAgIH1cbiAgICAgICAgdHJhdmVyc2VJZGVudGlmaWVySW5QYXR0ZXJuKFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG9wdGlvbnMucHJvY2Vzc1JpZ2h0SGFuZE5vZGVzID8gdGhpcyA6IG51bGwsXG4gICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgdmlzaXRGdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBpLCBpejtcbiAgICAgICAgLy8gRnVuY3Rpb25EZWNsYXJhdGlvbiBuYW1lIGlzIGRlZmluZWQgaW4gdXBwZXIgc2NvcGVcbiAgICAgICAgLy8gTk9URTogTm90IHJlZmVycmluZyB2YXJpYWJsZVNjb3BlLiBJdCBpcyBpbnRlbmRlZC5cbiAgICAgICAgLy8gU2luY2VcbiAgICAgICAgLy8gIGluIEVTNSwgRnVuY3Rpb25EZWNsYXJhdGlvbiBzaG91bGQgYmUgaW4gRnVuY3Rpb25Cb2R5LlxuICAgICAgICAvLyAgaW4gRVM2LCBGdW5jdGlvbkRlY2xhcmF0aW9uIHNob3VsZCBiZSBibG9jayBzY29wZWQuXG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09IFN5bnRheC5GdW5jdGlvbkRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAvLyBpZCBpcyBkZWZpbmVkIGluIHVwcGVyIHNjb3BlXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuRnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGdW5jdGlvbkV4cHJlc3Npb24gd2l0aCBuYW1lIGNyZWF0ZXMgaXRzIHNwZWNpYWwgc2NvcGU7XG4gICAgICAgIC8vIEZ1bmN0aW9uRXhwcmVzc2lvbk5hbWVTY29wZS5cbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gU3ludGF4LkZ1bmN0aW9uRXhwcmVzc2lvbiAmJiBub2RlLmlkKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RGdW5jdGlvbkV4cHJlc3Npb25OYW1lU2NvcGUobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zaWRlciB0aGlzIGZ1bmN0aW9uIGlzIGluIHRoZSBNZXRob2REZWZpbml0aW9uLlxuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RGdW5jdGlvblNjb3BlKG5vZGUsIHRoaXMuaXNJbm5lck1ldGhvZERlZmluaXRpb24pO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgcGFyYW1ldGVyIGRlY2xhcmF0aW9ucy5cbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBub2RlLnBhcmFtcy5sZW5ndGg7IGkgPCBpejsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihub2RlLnBhcmFtc1tpXSwge3Byb2Nlc3NSaWdodEhhbmROb2RlczogdHJ1ZX0sIChwYXR0ZXJuLCBpbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NvcGUoKS5fX2RlZmluZShwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICBuZXcgUGFyYW1ldGVyRGVmaW5pdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucmVzdFxuICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgaW5mby5hc3NpZ25tZW50cywgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZXJlJ3MgYSByZXN0IGFyZ3VtZW50LCBhZGQgdGhhdFxuICAgICAgICBpZiAobm9kZS5yZXN0KSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0UGF0dGVybih7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1Jlc3RFbGVtZW50JyxcbiAgICAgICAgICAgICAgICBhcmd1bWVudDogbm9kZS5yZXN0XG4gICAgICAgICAgICB9LCAocGF0dGVybikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUocGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBhcmFtZXRlckRlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucGFyYW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNraXAgQmxvY2tTdGF0ZW1lbnQgdG8gcHJldmVudCBjcmVhdGluZyBCbG9ja1N0YXRlbWVudCBzY29wZS5cbiAgICAgICAgaWYgKG5vZGUuYm9keS50eXBlID09PSBTeW50YXguQmxvY2tTdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihub2RlLmJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbG9zZShub2RlKTtcbiAgICB9XG5cbiAgICB2aXNpdENsYXNzKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gU3ludGF4LkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19kZWZpbmUobm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBWYXJpYWJsZS5DbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZJWE1FOiBNYXliZSBjb25zaWRlciBURFouXG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5zdXBlckNsYXNzKTtcblxuICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RDbGFzc1Njb3BlKG5vZGUpO1xuXG4gICAgICAgIGlmIChub2RlLmlkKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFyaWFibGUuQ2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgdmlzaXRQcm9wZXJ0eShub2RlKSB7XG4gICAgICAgIHZhciBwcmV2aW91cywgaXNNZXRob2REZWZpbml0aW9uO1xuICAgICAgICBpZiAobm9kZS5jb21wdXRlZCkge1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBpc01ldGhvZERlZmluaXRpb24gPSBub2RlLnR5cGUgPT09IFN5bnRheC5NZXRob2REZWZpbml0aW9uO1xuICAgICAgICBpZiAoaXNNZXRob2REZWZpbml0aW9uKSB7XG4gICAgICAgICAgICBwcmV2aW91cyA9IHRoaXMucHVzaElubmVyTWV0aG9kRGVmaW5pdGlvbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpc2l0KG5vZGUudmFsdWUpO1xuICAgICAgICBpZiAoaXNNZXRob2REZWZpbml0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnBvcElubmVyTWV0aG9kRGVmaW5pdGlvbihwcmV2aW91cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdEZvckluKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubGVmdC50eXBlID09PSBTeW50YXguVmFyaWFibGVEZWNsYXJhdGlvbiAmJiBub2RlLmxlZnQua2luZCAhPT0gJ3ZhcicpIHtcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxpemVURFpTY29wZShub2RlLnJpZ2h0LCBub2RlKTtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5yaWdodCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKG5vZGUucmlnaHQpO1xuXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsaXplSXRlcmF0aW9uU2NvcGUobm9kZSk7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuYm9keSk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG5vZGUubGVmdC50eXBlID09PSBTeW50YXguVmFyaWFibGVEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5sZWZ0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihub2RlLmxlZnQuZGVjbGFyYXRpb25zWzBdLmlkLCAocGF0dGVybikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcocGF0dGVybiwgUmVmZXJlbmNlLldSSVRFLCBub2RlLnJpZ2h0LCBudWxsLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obm9kZS5sZWZ0LCB7cHJvY2Vzc1JpZ2h0SGFuZE5vZGVzOiB0cnVlfSwgKHBhdHRlcm4sIGluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1heWJlSW1wbGljaXRHbG9iYWwgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNjb3BlKCkuaXNTdHJpY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlSW1wbGljaXRHbG9iYWwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgaW5mby5hc3NpZ25tZW50cywgbWF5YmVJbXBsaWNpdEdsb2JhbCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcocGF0dGVybiwgUmVmZXJlbmNlLldSSVRFLCBub2RlLnJpZ2h0LCBtYXliZUltcGxpY2l0R2xvYmFsLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUucmlnaHQpO1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKHZhcmlhYmxlVGFyZ2V0U2NvcGUsIHR5cGUsIG5vZGUsIGluZGV4LCBmcm9tVERaKSB7XG4gICAgICAgIC8vIElmIHRoaXMgd2FzIGNhbGxlZCB0byBpbml0aWFsaXplIGEgVERaIHNjb3BlLCB0aGlzIG5lZWRzIHRvIG1ha2UgZGVmaW5pdGlvbnMsIGJ1dCBkb2Vzbid0IG1ha2UgcmVmZXJlbmNlcy5cbiAgICAgICAgdmFyIGRlY2wsIGluaXQ7XG5cbiAgICAgICAgZGVjbCA9IG5vZGUuZGVjbGFyYXRpb25zW2luZGV4XTtcbiAgICAgICAgaW5pdCA9IGRlY2wuaW5pdDtcbiAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4oZGVjbC5pZCwge3Byb2Nlc3NSaWdodEhhbmROb2RlczogIWZyb21URFp9LCAocGF0dGVybiwgaW5mbykgPT4ge1xuICAgICAgICAgICAgdmFyaWFibGVUYXJnZXRTY29wZS5fX2RlZmluZShwYXR0ZXJuLFxuICAgICAgICAgICAgICAgIG5ldyBEZWZpbml0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICBkZWNsLFxuICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5raW5kXG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIGlmICghZnJvbVREWikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmZXJlbmNpbmdEZWZhdWx0VmFsdWUocGF0dGVybiwgaW5mby5hc3NpZ25tZW50cywgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5pdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhwYXR0ZXJuLCBSZWZlcmVuY2UuV1JJVEUsIGluaXQsIG51bGwsICFpbmZvLnRvcExldmVsLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgQXNzaWdubWVudEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICBpZiAoUGF0dGVyblZpc2l0b3IuaXNQYXR0ZXJuKG5vZGUubGVmdCkpIHtcbiAgICAgICAgICAgIGlmIChub2RlLm9wZXJhdG9yID09PSAnPScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0UGF0dGVybihub2RlLmxlZnQsIHtwcm9jZXNzUmlnaHRIYW5kTm9kZXM6IHRydWV9LCAocGF0dGVybiwgaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF5YmVJbXBsaWNpdEdsb2JhbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50U2NvcGUoKS5pc1N0cmljdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVJbXBsaWNpdEdsb2JhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2luZ0RlZmF1bHRWYWx1ZShwYXR0ZXJuLCBpbmZvLmFzc2lnbm1lbnRzLCBtYXliZUltcGxpY2l0R2xvYmFsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhwYXR0ZXJuLCBSZWZlcmVuY2UuV1JJVEUsIG5vZGUucmlnaHQsIG1heWJlSW1wbGljaXRHbG9iYWwsICFpbmZvLnRvcExldmVsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhub2RlLmxlZnQsIFJlZmVyZW5jZS5SVywgbm9kZS5yaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUubGVmdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXNpdChub2RlLnJpZ2h0KTtcbiAgICB9XG5cbiAgICBDYXRjaENsYXVzZShub2RlKSB7XG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdENhdGNoU2NvcGUobm9kZSk7XG5cbiAgICAgICAgdGhpcy52aXNpdFBhdHRlcm4obm9kZS5wYXJhbSwge3Byb2Nlc3NSaWdodEhhbmROb2RlczogdHJ1ZX0sIChwYXR0ZXJuLCBpbmZvKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fZGVmaW5lKHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgbmV3IERlZmluaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIFZhcmlhYmxlLkNhdGNoQ2xhdXNlLFxuICAgICAgICAgICAgICAgICAgICBub2RlLnBhcmFtLFxuICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB0aGlzLnJlZmVyZW5jaW5nRGVmYXVsdFZhbHVlKHBhdHRlcm4sIGluZm8uYXNzaWdubWVudHMsIG51bGwsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy52aXNpdChub2RlLmJvZHkpO1xuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgUHJvZ3JhbShub2RlKSB7XG4gICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEdsb2JhbFNjb3BlKG5vZGUpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzTm9kZWpzU2NvcGUoKSkge1xuICAgICAgICAgICAgLy8gRm9yY2Ugc3RyaWN0bmVzcyBvZiBHbG9iYWxTY29wZSB0byBmYWxzZSB3aGVuIHVzaW5nIG5vZGUuanMgc2NvcGUuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLmlzU3RyaWN0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RGdW5jdGlvblNjb3BlKG5vZGUsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkgJiYgdGhpcy5zY29wZU1hbmFnZXIuaXNNb2R1bGUoKSkge1xuICAgICAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0TW9kdWxlU2NvcGUobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zY29wZU1hbmFnZXIuaXNTdHJpY3RNb2RlU3VwcG9ydGVkKCkgJiYgdGhpcy5zY29wZU1hbmFnZXIuaXNJbXBsaWVkU3RyaWN0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuaXNTdHJpY3QgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIElkZW50aWZpZXIobm9kZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcobm9kZSk7XG4gICAgfVxuXG4gICAgVXBkYXRlRXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIGlmIChQYXR0ZXJuVmlzaXRvci5pc1BhdHRlcm4obm9kZS5hcmd1bWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkuX19yZWZlcmVuY2luZyhub2RlLmFyZ3VtZW50LCBSZWZlcmVuY2UuUlcsIG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbihub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5vYmplY3QpO1xuICAgICAgICBpZiAobm9kZS5jb21wdXRlZCkge1xuICAgICAgICAgICAgdGhpcy52aXNpdChub2RlLnByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFByb3BlcnR5KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdFByb3BlcnR5KG5vZGUpO1xuICAgIH1cblxuICAgIE1ldGhvZERlZmluaXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0UHJvcGVydHkobm9kZSk7XG4gICAgfVxuXG4gICAgQnJlYWtTdGF0ZW1lbnQoKSB7fVxuXG4gICAgQ29udGludWVTdGF0ZW1lbnQoKSB7fVxuXG4gICAgTGFiZWxlZFN0YXRlbWVudChub2RlKSB7XG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcbiAgICB9XG5cbiAgICBGb3JTdGF0ZW1lbnQobm9kZSkge1xuICAgICAgICAvLyBDcmVhdGUgRm9yU3RhdGVtZW50IGRlY2xhcmF0aW9uLlxuICAgICAgICAvLyBOT1RFOiBJbiBFUzYsIEZvclN0YXRlbWVudCBkeW5hbWljYWxseSBnZW5lcmF0ZXNcbiAgICAgICAgLy8gcGVyIGl0ZXJhdGlvbiBlbnZpcm9ubWVudC4gSG93ZXZlciwgZXNjb3BlIGlzXG4gICAgICAgIC8vIGEgc3RhdGljIGFuYWx5emVyLCB3ZSBvbmx5IGdlbmVyYXRlIG9uZSBzY29wZSBmb3IgRm9yU3RhdGVtZW50LlxuICAgICAgICBpZiAobm9kZS5pbml0ICYmIG5vZGUuaW5pdC50eXBlID09PSBTeW50YXguVmFyaWFibGVEZWNsYXJhdGlvbiAmJiBub2RlLmluaXQua2luZCAhPT0gJ3ZhcicpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdEZvclNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgQ2xhc3NFeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdENsYXNzKG5vZGUpO1xuICAgIH1cblxuICAgIENsYXNzRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0Q2xhc3Mobm9kZSk7XG4gICAgfVxuXG4gICAgQ2FsbEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgICAvLyBDaGVjayB0aGlzIGlzIGRpcmVjdCBjYWxsIHRvIGV2YWxcbiAgICAgICAgaWYgKCF0aGlzLnNjb3BlTWFuYWdlci5fX2lnbm9yZUV2YWwoKSAmJiBub2RlLmNhbGxlZS50eXBlID09PSBTeW50YXguSWRlbnRpZmllciAmJiBub2RlLmNhbGxlZS5uYW1lID09PSAnZXZhbCcpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IFRoaXMgc2hvdWxkIGJlIGB2YXJpYWJsZVNjb3BlYC4gU2luY2UgZGlyZWN0IGV2YWwgY2FsbCBhbHdheXMgY3JlYXRlcyBMZXhpY2FsIGVudmlyb25tZW50IGFuZFxuICAgICAgICAgICAgLy8gbGV0IC8gY29uc3Qgc2hvdWxkIGJlIGVuY2xvc2VkIGludG8gaXQuIE9ubHkgVmFyaWFibGVEZWNsYXJhdGlvbiBhZmZlY3RzIG9uIHRoZSBjYWxsZXIncyBlbnZpcm9ubWVudC5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkudmFyaWFibGVTY29wZS5fX2RldGVjdEV2YWwoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZSk7XG4gICAgfVxuXG4gICAgQmxvY2tTdGF0ZW1lbnQobm9kZSkge1xuICAgICAgICBpZiAodGhpcy5zY29wZU1hbmFnZXIuX19pc0VTNigpKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3BlTWFuYWdlci5fX25lc3RCbG9ja1Njb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuXG4gICAgICAgIHRoaXMuY2xvc2Uobm9kZSk7XG4gICAgfVxuXG4gICAgVGhpc0V4cHJlc3Npb24oKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNjb3BlKCkudmFyaWFibGVTY29wZS5fX2RldGVjdFRoaXMoKTtcbiAgICB9XG5cbiAgICBXaXRoU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdChub2RlLm9iamVjdCk7XG4gICAgICAgIC8vIFRoZW4gbmVzdCBzY29wZSBmb3IgV2l0aFN0YXRlbWVudC5cbiAgICAgICAgdGhpcy5zY29wZU1hbmFnZXIuX19uZXN0V2l0aFNjb3BlKG5vZGUpO1xuXG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5ib2R5KTtcblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIFZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB2YXIgdmFyaWFibGVUYXJnZXRTY29wZSwgaSwgaXosIGRlY2w7XG4gICAgICAgIHZhcmlhYmxlVGFyZ2V0U2NvcGUgPSAobm9kZS5raW5kID09PSAndmFyJykgPyB0aGlzLmN1cnJlbnRTY29wZSgpLnZhcmlhYmxlU2NvcGUgOiB0aGlzLmN1cnJlbnRTY29wZSgpO1xuICAgICAgICBmb3IgKGkgPSAwLCBpeiA9IG5vZGUuZGVjbGFyYXRpb25zLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIGRlY2wgPSBub2RlLmRlY2xhcmF0aW9uc1tpXTtcbiAgICAgICAgICAgIHRoaXMudmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKHZhcmlhYmxlVGFyZ2V0U2NvcGUsIFZhcmlhYmxlLlZhcmlhYmxlLCBub2RlLCBpKTtcbiAgICAgICAgICAgIGlmIChkZWNsLmluaXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0KGRlY2wuaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBKU1hFbGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIEpTWE9wZW5pbmdFbGVtZW50KG5vZGUpIHtcbiAgICAvLyAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIC8vIH1cblxuICAgIEpTWElkZW50aWZpZXIobm9kZSkge1xuICAgICAgICBub2RlLnR5cGUgPSBcIklkZW50aWZpZXJcIjtcbiAgICAgICAgY29uc3QgcmVmc1dpdGhTYW1lSWRlbnRpZmllciA9IHRoaXMuY3VycmVudFNjb3BlKCkucmVmZXJlbmNlcy5maWx0ZXIocmVmZXJlbmNlID0+IHJlZmVyZW5jZS5pZGVudGlmaWVyLm5hbWUgPT09IG5vZGUubmFtZSk7XG5cbiAgICAgICAgaWYgKHJlZnNXaXRoU2FtZUlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY29wZSgpLl9fcmVmZXJlbmNpbmcobm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG5cblxuICAgIC8vIHNlYyAxMy4xMS44XG4gICAgU3dpdGNoU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdmFyIGksIGl6O1xuXG4gICAgICAgIHRoaXMudmlzaXQobm9kZS5kaXNjcmltaW5hbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVNYW5hZ2VyLl9fbmVzdFN3aXRjaFNjb3BlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMCwgaXogPSBub2RlLmNhc2VzLmxlbmd0aDsgaSA8IGl6OyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMudmlzaXQobm9kZS5jYXNlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsb3NlKG5vZGUpO1xuICAgIH1cblxuICAgIEZ1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RnVuY3Rpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEZvck9mU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEZvckluU3RhdGVtZW50KG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZvckluKG5vZGUpO1xuICAgIH1cblxuICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEZ1bmN0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGltcG9ydGVyO1xuXG4gICAgICAgIGFzc2VydCh0aGlzLnNjb3BlTWFuYWdlci5fX2lzRVM2KCkgJiYgdGhpcy5zY29wZU1hbmFnZXIuaXNNb2R1bGUoKSwgJ0ltcG9ydERlY2xhcmF0aW9uIHNob3VsZCBhcHBlYXIgd2hlbiB0aGUgbW9kZSBpcyBFUzYgYW5kIGluIHRoZSBtb2R1bGUgY29udGV4dC4nKTtcblxuICAgICAgICBpbXBvcnRlciA9IG5ldyBJbXBvcnRlcihub2RlLCB0aGlzKTtcbiAgICAgICAgaW1wb3J0ZXIudmlzaXQobm9kZSk7XG4gICAgfVxuXG4gICAgdmlzaXRFeHBvcnREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0KG5vZGUuZGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgdGhpcy52aXNpdEV4cG9ydERlY2xhcmF0aW9uKG5vZGUpO1xuICAgIH1cblxuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICB0aGlzLnZpc2l0RXhwb3J0RGVjbGFyYXRpb24obm9kZSk7XG4gICAgfVxuXG4gICAgRXhwb3J0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgbGV0IGxvY2FsID0gKG5vZGUuaWQgfHwgbm9kZS5sb2NhbCk7XG4gICAgICAgIHRoaXMudmlzaXQobG9jYWwpO1xuICAgIH1cblxuICAgIE1ldGFQcm9wZXJ0eSgpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZy5cbiAgICB9XG59XG5cbi8qIHZpbTogc2V0IHN3PTQgdHM9NCBldCB0dz04MCA6ICovXG4iXX0=