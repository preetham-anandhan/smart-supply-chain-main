// ==============================================
// Base Agent — Abstract base class for all agents
// ==============================================

const { createLogger } = require('../../../shared/utils/logger');

class BaseAgent {
  constructor(name, eventBus, aiClient) {
    this.name = name;
    this.id = `${name}-${Math.random().toString(36).slice(2, 8)}`;
    this.eventBus = eventBus;
    this.aiClient = aiClient;
    this.log = createLogger(name.toUpperCase());
    this.active = true;
    this.metrics = {
      tasksProcessed: 0,
      errors: 0,
      lastActivity: null,
    };
    this._listen();
    this.log.agent(`Agent ${this.id} initialized`);
  }

  /**
   * Override in subclasses to register event listeners.
   */
  _listen() {
    // Subclasses override this
  }

  /**
   * Record a completed task.
   */
  _recordTask() {
    this.metrics.tasksProcessed++;
    this.metrics.lastActivity = new Date().toISOString();
  }

  /**
   * Record an error.
   */
  _recordError(err) {
    this.metrics.errors++;
    this.log.error(`${this.name} error: ${err.message || err}`);
  }

  /**
   * Publish a message to the event bus.
   */
  publish(event, data) {
    this.eventBus.emit(event, { ...data, _agent: this.id });
  }

  /**
   * Get agent status summary.
   */
  getStatus() {
    return {
      agent: this.name,
      id: this.id,
      active: this.active,
      metrics: this.metrics,
    };
  }

  /**
   * Gracefully stop the agent.
   */
  stop() {
    this.active = false;
    this.log.info(`Agent ${this.id} stopped`);
  }
}

module.exports = BaseAgent;
