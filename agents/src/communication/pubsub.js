// ==============================================
// Pub/Sub System — Event-driven agent coordination
// ==============================================

const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('PUBSUB');

class PubSub {
  constructor() {
    this.topics = new Map();
    this.subscriptionCount = 0;
  }

  /**
   * Subscribe to a topic with a callback.
   * Returns an unsubscribe function.
   */
  subscribe(topic, callback, options = {}) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }

    const subscription = {
      id: `sub-${++this.subscriptionCount}`,
      callback,
      priority: options.priority || 0,
      filter: options.filter || null,
      once: options.once || false,
    };

    const subs = this.topics.get(topic);
    subs.push(subscription);
    subs.sort((a, b) => b.priority - a.priority);

    log.debug(`Subscription ${subscription.id} added to topic: ${topic}`);

    return () => {
      const idx = subs.indexOf(subscription);
      if (idx !== -1) subs.splice(idx, 1);
    };
  }

  /**
   * Publish a message to a topic.
   */
  async publish(topic, data) {
    const subs = this.topics.get(topic);
    if (!subs || subs.length === 0) return 0;

    let delivered = 0;
    const toRemove = [];

    for (const sub of subs) {
      // Apply filter if present
      if (sub.filter && !sub.filter(data)) continue;

      try {
        await sub.callback(data);
        delivered++;
      } catch (err) {
        log.error(`Subscriber ${sub.id} error on topic ${topic}: ${err.message}`);
      }

      if (sub.once) toRemove.push(sub);
    }

    // Remove one-time subscriptions
    for (const sub of toRemove) {
      const idx = subs.indexOf(sub);
      if (idx !== -1) subs.splice(idx, 1);
    }

    return delivered;
  }

  /**
   * Subscribe once to a topic.
   */
  once(topic, callback) {
    return this.subscribe(topic, callback, { once: true });
  }

  /**
   * Get all active topics and their subscriber counts.
   */
  getTopics() {
    const result = {};
    for (const [topic, subs] of this.topics) {
      result[topic] = subs.length;
    }
    return result;
  }

  /**
   * Clear all subscriptions.
   */
  clear() {
    this.topics.clear();
    log.info('All subscriptions cleared');
  }
}

// Singleton
const pubsub = new PubSub();

module.exports = pubsub;
