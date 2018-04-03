import { RouterDestination, RouteMatch, RouterResponse } from '@scvo/router';
export declare class HandlebarsRouterDestination extends RouterDestination {
    name: string;
    constructor(handlebarsHelpers: HandlebarsHelpers);
    execute(routeMatch: RouteMatch): Promise<RouterResponse>;
    private getLayouts(routerLayouts, routeLayouts, url);
}
export interface RouterLayoutMap {
    default: RouterLayout;
    [name: string]: RouterLayout;
}
export interface RouterLayout {
    template: string;
    sections: string[];
    pattern: string;
    contentType: string;
    doNotStripDomains: boolean;
}
export interface RouteLayoutMap {
    [name: string]: RouteLayout;
}
export interface RouteLayout {
    [section: string]: string;
}
export interface LayoutPair {
    routerLayout: RouterLayout;
    routeLayout: RouteLayout;
}
export interface HandlebarsHelpers {
    [name: string]: (...args: any[]) => any;
}
