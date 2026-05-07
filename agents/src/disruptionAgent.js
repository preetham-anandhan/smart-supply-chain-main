// ==============================================
// Disruption Agent — Monitors delays & risks
// ==============================================

const EVENTS = require('../../shared/constants/events');
const { createLogger } = require('../../shared/utils/logger');

const log = createLogger('DISRUPTION-AGENT');

class DisruptionAgent {
  constructor(eventBus, aiClient) {
    this.eventBus = eventBus;
    this.aiClient = aiClient;
    this.activeAlerts = [];
    this._listen();
  }

  _listen() {
    // Monitor vehicle location updates for delay detection
    this.eventBus.on(EVENTS.VEHICLE_LOCATION_UPDATE, (vehicle) => {
      if (vehicle.fuel_level < 10) {
        const alert = {
          type: 'low_fuel',
          vehicle_id: vehicle.id,
          fuel_level: vehicle.fuel_level,
          severity: vehicle.fuel_level < 5 ? 'critical' : 'high',
          message: `Vehicle ${vehicle.id} fuel critically low: ${vehicle.fuel_level.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        };
        this.activeAlerts.push(alert);
        this.eventBus.emit(EVENTS.RISK_ALERT, alert);
        log.warn(alert.message);
      }
    });

    // Monitor weather alerts
    this.eventBus.on(EVENTS.WEATHER_ALERT, (weather) => {
      if (weather.factor > 1.5) {
        log.warn(`Weather disruption: ${weather.condition} (factor: ${weather.factor})`);
        this.activeAlerts.push({
          type: 'weather',
          ...weather,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Check if a shipment is likely to be delayed.
   */
  async checkDelay(shipment) {
    try {
      const result = await this.aiClient.detectDisruption({
        original_eta_min: shipment.eta_min || 60,
        current_distance_remaining: 10,
        elapsed_min: 30,
        traffic_factor: 1.5,
        weather_factor: 1.0,
      });

      if (result.is_delayed) {
        this.eventBus.emit(EVENTS.DELAY_DETECTED, {
          shipment_id: shipment.id,
          delay_minutes: result.delay_minutes,
          severity: result.severity,
        });
      }

      return result;
    } catch (err) {
      log.error(`Delay check failed for ${shipment.id}`, err.message);
      return null;
    }
  }

  getStatus() {
    return {
      agent: 'disruption',
      active_alerts: this.activeAlerts.length,
      recent_alerts: this.activeAlerts.slice(-5),
      status: 'active',
    };
  }
}

module.exports = DisruptionAgent;
