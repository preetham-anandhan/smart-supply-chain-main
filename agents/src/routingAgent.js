// ==============================================
// Routing Agent — Route optimization decisions
// ==============================================

const EVENTS = require('../../shared/constants/events');
const { createLogger } = require('../../shared/utils/logger');

const log = createLogger('ROUTING-AGENT');

class RoutingAgent {
  constructor(eventBus, aiClient) {
    this.eventBus = eventBus;
    this.aiClient = aiClient;
    this.routeCache = new Map();
    this._listen();
  }

  _listen() {
    this.eventBus.on(EVENTS.ROUTE_REQUESTED, async (request) => {
      log.agent(`Route requested: ${request.shipment_id}`);
      try {
        const route = await this.computeRoute(request);
        this.eventBus.emit(EVENTS.ROUTE_GENERATED, {
          shipment: request,
          route,
        });
      } catch (err) {
        log.error(`Route computation failed: ${err.message}`);
        this.eventBus.emit(EVENTS.ROUTE_FAILED, {
          shipment_id: request.shipment_id,
          error: err.message,
        });
      }
    });
  }

  async computeRoute(request) {
    const cacheKey = `${request.source_lat},${request.source_lng}:${request.dest_lat},${request.dest_lng}`;

    if (this.routeCache.has(cacheKey)) {
      log.debug('Route cache hit');
      return this.routeCache.get(cacheKey);
    }

    const route = await this.aiClient.optimizeRoute({
      source_lat: request.source_lat,
      source_lng: request.source_lng,
      dest_lat: request.dest_lat,
      dest_lng: request.dest_lng,
      optimization_mode: request.mode || 'balanced',
    });

    this.routeCache.set(cacheKey, route);

    // Evict old cache entries (keep last 100)
    if (this.routeCache.size > 100) {
      const firstKey = this.routeCache.keys().next().value;
      this.routeCache.delete(firstKey);
    }

    return route;
  }

  getStatus() {
    return {
      agent: 'routing',
      cache_size: this.routeCache.size,
      status: 'active',
    };
  }
}

module.exports = RoutingAgent;
