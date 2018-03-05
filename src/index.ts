const hbs = require('clayhandlebars')();

import { IContext, IRouterDestination, IRouteMatch, Helpers, IRouterResponse } from '@scvo/router';

export class HandlebarsRouterDestination implements IRouterDestination {
    name: string = "handlebars";

    constructor(public routerLayouts: IRouterLayouts, handlebarsHelpers: IHandlebarsHelpers) {
        Helpers.register(hbs);
        Object.keys(handlebarsHelpers).forEach((name) => {
            hbs.registerHelper(name, handlebarsHelpers[name]);
        });
    }

    public async execute(routeMatch: IRouteMatch): Promise<IRouterResponse> {
        try {
            //console.log('#### ROUTEMATCH.render() -> Rendering');
            var routeLayouts: IRouteLayouts = routeMatch.route.destination.config;
            var layouts: ILayoutPair = this.getLayouts(routeLayouts, routeMatch.request.fullUrl);

            var sections: IRouteLayout = {};
            Object.keys(layouts.routeLayout).forEach((sectionName: string) => {
                var template = layouts.routeLayout[sectionName];
                var compiled = hbs.compile(template);
                var output = compiled(this);
                sections[sectionName] = output;
            });

            //console.log('#### ROUTEMATCH.render() -> Route templates rendered');
            //console.log('#### ROUTEMATCH.render() -> Rendering  full layout');
            
            var template = layouts.routerLayout.template;
            template = template.replace(/(<!--{section:)([a-z0-9_-]+)(}-->)/ig, (match, m1, m2, m3) => {
                if (sections.hasOwnProperty(m2)) {
                    return sections[m2];
                } else { 
                    return match;
                }
            });
            var compiled = hbs.compile(template);

            //console.log('#### ROUTEMATCH.render() -> All rendered');
           
            var response: IRouterResponse = {
                statusCode: 200,
                contentType: layouts.routerLayout.contentType,
                contentBody: compiled(routeMatch)
            };

            return response;
        } catch(err) {
            console.error('#### RouteMatch -> Failed to render:', err);
            throw err;
        }
    }
    
    private getLayouts(routeLayouts: IRouteLayouts, url: string): ILayoutPair {
        try {
            var layoutName = 'default';

            //console.log('#### ROUTEMATCH.getLayoutName() -> Getting layout name');
            Object.keys(routeLayouts).forEach((name: string) => {
                if (name === 'default' || layoutName !== 'default') return;
                if (this.routerLayouts.hasOwnProperty(name)) {
                    var pattern = this.routerLayouts[name].pattern;
                    var regex = new RegExp(pattern, 'ig');
                    if (regex.test(url)) {
                        layoutName = name;
                    }
                }
            });
            //console.log('#### ROUTEMATCH.getLayoutName() -> Layout name:', this.layoutName);
            return {
                routerLayout: this.routerLayouts[layoutName],
                routeLayout: routeLayouts[layoutName]   
            };
        } catch(err) {
            console.error('#### RouteMatch -> Failed to get layout name:', err);
            throw err;
        }
    }
}

export interface IRouterLayouts {
    default: IRouterLayout;
    [name: string]: IRouterLayout;
}

export interface IRouterLayout {
    template: string;
    sections: string[];
    pattern: string;
    contentType: string;
    doNotStripDomains: boolean;
}

export interface IRouteLayouts {
    [name: string]: IRouteLayout;
}

export interface IRouteLayout {
    [section: string]: string;
}

export interface ILayoutPair {
    routerLayout: IRouterLayout;
    routeLayout: IRouteLayout;
}

export interface IHandlebarsHelpers {
    [name: string]: (...args: any[]) => any;
}
