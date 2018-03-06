"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var hbs = require('clayhandlebars')();
var router_1 = require("@scvo/router");
var HandlebarsRouterDestination = /** @class */ (function () {
    function HandlebarsRouterDestination(handlebarsHelpers) {
        this.name = "handlebars";
        router_1.Helpers.register(hbs);
        Object.keys(handlebarsHelpers).forEach(function (name) {
            hbs.registerHelper(name, handlebarsHelpers[name]);
        });
    }
    HandlebarsRouterDestination.prototype.execute = function (routeMatch) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var routerLayouts, routeLayouts, layouts, partials, sections, template, compiled, response;
            return __generator(this, function (_a) {
                try {
                    routerLayouts = routeMatch.context.metaData.handlebarsLayouts;
                    routeLayouts = routeMatch.route.destination.config;
                    layouts = this.getLayouts(routerLayouts, routeLayouts, routeMatch.request.fullUrl);
                    partials = routeMatch.context.metaData.handlebarsPartials;
                    Object.keys(partials).forEach(function (name) {
                        hbs.registerPartial(name, partials[name]);
                    });
                    sections = {};
                    Object.keys(layouts.routeLayout).forEach(function (sectionName) {
                        var template = layouts.routeLayout[sectionName];
                        var compiled = hbs.compile(template);
                        var output = compiled(_this);
                        sections[sectionName] = output;
                    });
                    template = layouts.routerLayout.template;
                    template = template.replace(/(<!--{section:)([a-z0-9_-]+)(}-->)/ig, function (match, m1, m2, m3) {
                        if (sections.hasOwnProperty(m2)) {
                            return sections[m2];
                        }
                        else {
                            return match;
                        }
                    });
                    compiled = hbs.compile(template);
                    response = {
                        statusCode: 200,
                        contentType: layouts.routerLayout.contentType,
                        body: compiled(routeMatch),
                        headers: {},
                        cookies: routeMatch.request.cookies
                    };
                    return [2 /*return*/, response];
                }
                catch (err) {
                    console.error('#### RouteMatch -> Failed to render:', err);
                    throw err;
                }
                return [2 /*return*/];
            });
        });
    };
    HandlebarsRouterDestination.prototype.getLayouts = function (routerLayouts, routeLayouts, url) {
        try {
            var layoutName = 'default';
            //console.log('#### ROUTEMATCH.getLayoutName() -> Getting layout name');
            Object.keys(routeLayouts).forEach(function (name) {
                if (name === 'default' || layoutName !== 'default')
                    return;
                if (routerLayouts.hasOwnProperty(name)) {
                    var pattern = routerLayouts[name].pattern;
                    var regex = new RegExp(pattern, 'ig');
                    if (regex.test(url)) {
                        layoutName = name;
                    }
                }
            });
            //console.log('#### ROUTEMATCH.getLayoutName() -> Layout name:', this.layoutName);
            return {
                routerLayout: routerLayouts[layoutName],
                routeLayout: routeLayouts[layoutName]
            };
        }
        catch (err) {
            console.error('#### RouteMatch -> Failed to get layout name:', err);
            throw err;
        }
    };
    return HandlebarsRouterDestination;
}());
exports.HandlebarsRouterDestination = HandlebarsRouterDestination;
//# sourceMappingURL=index.js.map