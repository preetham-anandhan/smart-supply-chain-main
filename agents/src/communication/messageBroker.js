// ==============================================
// Message Broker — Inter-agent communication
// ==============================================

const EventEmitter = require('events');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('MSG-BROKER');

class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
    this.channels = new Map();
    this.messageLog = [];
  }

  /**
   * Create a named channel for agent communication.
   */
  createChannel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, { subscribers: new Set(), messageCount: 0 });
      log.info(`Channel created: ${name}`);
    }
    return this;
  }

  /**
   * Subscribe an agent to a channel.
   */
  subscribe(channel, agentId, handler) {
    this.createChannel(channel);
    const ch = this.channels.get(channel);
    ch.subscribers.add(agentId);

    this.on(`channel:${channel}`, handler);
    log.debug(`${agentId} subscribed to ${channel}`);
    return this;
  }

  /**
   * Publish a message to a channel.
   */
  publishToChannel(channel, message, senderId = 'system') {
    if (!this.channels.has(channel)) {
      this.createChannel(channel);
    }

    const ch = this.channels.get(channel);
    ch.messageCount++;

    const envelope = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      sender: senderId,
      payload: message,
      timestamp: new Date().toISOString(),
    };

    this.messageLog.push(envelope);
    if (this.messageLog.length > 500) this.messageLog.shift();

    this.emit(`channel:${channel}`, envelope);
    return envelope;
  }

  /**
   * Send a direct message to a specific agent.
   */
  sendDirect(targetAgentId, message, senderId = 'system') {
    const envelope = {
      id: `dm-${Date.now()}`,
      target: targetAgentId,
      sender: senderId,
      payload: message,
      timestamp: new Date().toISOString(),
    };

    this.emit(`direct:${targetAgentId}`, envelope);
    return envelope;
  }

  /**
   * Listen for direct messages to a specific agent.
   */
  onDirectMessage(agentId, handler) {
    this.on(`direct:${agentId}`, handler);
  }

  /**
   * Get broker status.
   */
  getStatus() {
    const channelStats = {};
    for (const [name, ch] of this.channels) {
      channelStats[name] = {
        subscribers: ch.subscribers.size,
        messages: ch.messageCount,
      };
    }
    return {
      channels: channelStats,
      total_messages: this.messageLog.length,
    };
  }
}

// Singleton
const broker = new MessageBroker();

module.exports = broker;
