/* tslint:disable:no-any */
const hbs = require('clayhandlebars')();

import {RouterConfiguration, RouterDestination, RouteMatch, Helpers, RouterResponse, RouteDestinationError} from '@scvo/router';

export class HandlebarsRouterDestination extends RouterDestination {
  name = 'handlebars';

  constructor(handlebarsHelpers: HandlebarsHelpers) {
    super();
    Helpers.register(hbs);
    Object.keys(handlebarsHelpers).forEach((name) => {
      hbs.registerHelper(name, handlebarsHelpers[name]);
    });
  }

  async execute(routeMatch: RouteMatch): Promise<RouterResponse> {
    try {
      const routerLayouts: RouterLayoutMap =
          routeMatch.context.metaData.handlebarsLayouts;
      const routeLayouts: RouteLayoutMap = routeMatch.route.destination.config;
      const layouts: LayoutPair = this.getLayouts(
          routerLayouts, routeLayouts, routeMatch.request.fullUrl);

      const partials = routeMatch.context.metaData.handlebarsPartials;
      Object.keys(partials).forEach((name: string) => {
        hbs.registerPartial(name, partials[name]);
      });

      const sections: RouteLayout = {};
      Object.keys(layouts.routeLayout).forEach((sectionName: string) => {
        let template = '', compiled: (data: RouteMatch) => string, output = '';
        try {
          template = layouts.routeLayout[sectionName];
          template = template.replace(/{{instance_id}}/ig, '{-{intance_id}-}');
          compiled = hbs.compile(template);
          output = compiled(routeMatch);
          sections[sectionName] = output;
        } catch (err) {
          err = new RouteDestinationError(err, {
            statusCode: 500,
            sourceRoute: routeMatch,
            destination: routeMatch.route.destination,
            redirectTo: routeMatch.route.errorRoute,
            data: {
              sectionName,
              template: template ?
                  template.length < 256 ? template : template.substr(0, 255) :
                  undefined,
              output: output ?
                  output.length < 256 ? output : output.substr(0, 255) :
                  undefined
            }
          });
          throw err;
        }
      });

      let template = '', compiled: (data: RouteMatch) => string, output = '';
      try {
        template = layouts.routerLayout.template;
        compiled = hbs.compile(template);
        output = compiled(routeMatch);
        output = output.replace(
            /(<!--{section:)([a-z0-9_-]+)(\[[a-z0-9_-]+\])?(}-->)/ig, (match, m1, m2, m3, m4) => {
              if (sections.hasOwnProperty(m2)) {
                var html = sections[m2];
                if (m3) {
                  var instance = m3.replace(/\[|\]/g, '');
                  html = html.replace(/{{instance_id}})/ig, instance);
                }
                return html;
              } else {
                return match;
              }
            });
      } catch (err) {
        err = new RouteDestinationError(err, {
          statusCode: 500,
          sourceRoute: routeMatch,
          destination: routeMatch.route.destination,
          redirectTo: routeMatch.route.errorRoute,
          data: {
            template: template ?
                template.length < 256 ? template : template.substr(0, 255) :
                undefined,
            output: output ?
                output.length < 256 ? output : output.substr(0, 255) :
                undefined
          }
        });
        throw err;
      }

      const response: RouterResponse = {
        statusCode: 200,
        contentType: layouts.routerLayout.contentType,
        body: output,
        headers: {},
        cookies: routeMatch.request.cookies
      };

      return response;
    } catch (err) {
      console.error('#### RouteMatch -> Failed to render:', err);
      throw err;
    }
  }

  private getLayouts(
      routerLayouts: RouterLayoutMap, routeLayouts: RouteLayoutMap,
      url: string): LayoutPair {
    try {
      let layoutName = 'default';

      // console.log('#### ROUTEMATCH.getLayoutName() -> Getting layout name');
      Object.keys(routeLayouts).forEach((name: string) => {
        if (name === 'default' || layoutName !== 'default') return;
        if (routerLayouts.hasOwnProperty(name)) {
          const pattern = routerLayouts[name].pattern;
          const regex = new RegExp(pattern, 'ig');
          if (regex.test(url)) {
            layoutName = name;
          }
        }
      });
      // console.log('#### ROUTEMATCH.getLayoutName() -> Layout name:',
      // this.layoutName);
      return {
        routerLayout: routerLayouts[layoutName],
        routeLayout: routeLayouts[layoutName]
      };
    } catch (err) {
      console.error('#### RouteMatch -> Failed to get layout name:', err);
      throw err;
    }
  }
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

export interface RouteLayoutMap { [name: string]: RouteLayout; }

export interface RouteLayout { [section: string]: string; }

export interface LayoutPair {
  routerLayout: RouterLayout;
  routeLayout: RouteLayout;
}

export interface HandlebarsHelpers { [name: string]: (...args: any[]) => any; }
/* tslint:enable:no-any */
