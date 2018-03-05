import { IRouterDestination, IRouteMatch, IRouterResponse } from '@scvo/router';
export declare class HandlebarsRouterDestination implements IRouterDestination {
    routerLayouts: IRouterLayouts;
    name: string;
    constructor(routerLayouts: IRouterLayouts, handlebarsHelpers: IHandlebarsHelpers);
    execute(routeMatch: IRouteMatch): Promise<IRouterResponse>;
    private getLayouts(routeLayouts, url);
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
