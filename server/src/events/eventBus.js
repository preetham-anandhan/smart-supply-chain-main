// ==============================================
// Event Bus — Central event emitter
// ==============================================

const EventEmitter = require('events');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('EVENT-BUS');

class SupplyChainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emit(event, data) {
    log.event(`${event}`, data ? { id: data.id || data.shipment?.id || '' } : undefined);
    return super.emit(event, data);
  }
}

// Singleton
const eventBus = new SupplyChainEventBus();

module.exports = eventBus;
