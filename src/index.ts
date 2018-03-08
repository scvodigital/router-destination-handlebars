const hbs = require('clayhandlebars')();

import { 
    IContext, IRouterDestination, IRouteMatch, 
    Helpers, IRouterResponse, RouteDestinationError
} from '@scvo/router';

export class HandlebarsRouterDestination implements IRouterDestination {
    name: string = "handlebars";

    constructor(handlebarsHelpers: IHandlebarsHelpers) {
        Helpers.register(hbs);
        Object.keys(handlebarsHelpers).forEach((name) => {
            hbs.registerHelper(name, handlebarsHelpers[name]);
        });
    }

    public async execute(routeMatch: IRouteMatch): Promise<IRouterResponse> {
        try {
            var routerLayouts: IRouterLayouts = routeMatch.context.metaData.handlebarsLayouts;
            var routeLayouts: IRouteLayouts = routeMatch.route.destination.config;
            var layouts: ILayoutPair = this.getLayouts(routerLayouts, routeLayouts, routeMatch.request.fullUrl);

            var partials = routeMatch.context.metaData.handlebarsPartials;
            Object.keys(partials).forEach((name: string) => {
                hbs.registerPartial(name, partials[name]);
            });

            var sections: IRouteLayout = {};
            Object.keys(layouts.routeLayout).forEach((sectionName: string) => {
                var template, compiled, output;
                try {
                    template = layouts.routeLayout[sectionName];
                    compiled = hbs.compile(template);
                    output = compiled(routeMatch);
                    sections[sectionName] = output;
                } catch(err) {
                    err = new RouteDestinationError(err, {
                        statusCode: 500,
                        sourceRoute: routeMatch,
                        destination: routeMatch.route.destination,
                        redirectTo: routeMatch.route.errorRoute,
                        data: { 
                            sectionName: sectionName, 
                            template: !template ? undefined : template.length < 256 ? template : template.substr(0, 255), 
                            compiled: !compiled ? undefined : compiled.length < 256 ? compiled : compiled.substr(0, 255), 
                            output: !output ? undefined : output.length < 256 ? output : output.substr(0, 255) 
                        }
                    });
                    throw err;
                }
            });

            var template, compiled, output;
            try {
                template = layouts.routerLayout.template;
                compiled = hbs.compile(template);
                output = compiled(routeMatch);
                output = output.replace(/(<!--{section:)([a-z0-9_-]+)(}-->)/ig, (match, m1, m2, m3) => {
                    if (sections.hasOwnProperty(m2)) {
                        return sections[m2];
                    } else { 
                        return match;
                    }
                });
            } catch(err) {
                err = new RouteDestinationError(err, {
                    statusCode: 500,
                    sourceRoute: routeMatch,
                    destination: routeMatch.route.destination,
                    redirectTo: routeMatch.route.errorRoute,
                    data: { 
                        template: !template ? undefined : template.length < 256 ? template : template.substr(0, 255), 
                        compiled: !compiled ? undefined : compiled.length < 256 ? compiled : compiled.substr(0, 255), 
                        output: !output ? undefined : output.length < 256 ? output : output.substr(0, 255) 
                    }
                });
                throw err;
            }

            var response: IRouterResponse = {
                statusCode: 200,
                contentType: layouts.routerLayout.contentType,
                body: output,
                headers: {},
                cookies: routeMatch.request.cookies
            };

            return response;
        } catch(err) {
            console.error('#### RouteMatch -> Failed to render:', err);
            throw err;
        }
    }
    
    private getLayouts(routerLayouts: IRouterLayouts, routeLayouts: IRouteLayouts, url: string): ILayoutPair {
        try {
            var layoutName = 'default';

            //console.log('#### ROUTEMATCH.getLayoutName() -> Getting layout name');
            Object.keys(routeLayouts).forEach((name: string) => {
                if (name === 'default' || layoutName !== 'default') return;
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
