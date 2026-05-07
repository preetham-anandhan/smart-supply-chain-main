"""
ETA Prediction Model
Uses regression-based prediction with traffic and weather factors.
Falls back to formula-based calculation when no trained model is available.
"""

import numpy as np
from typing import Dict, Optional
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import joblib
import os


class ETAPredictor:
    """Predicts estimated time of arrival based on route and conditions."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self._train_default_model()

    def _train_default_model(self):
        """Train a default model with synthetic data."""
        np.random.seed(42)
        n_samples = 1000

        # Generate synthetic training data
        distances = np.random.uniform(1, 50, n_samples)
        traffic_factors = np.random.uniform(0.7, 3.0, n_samples)
        weather_factors = np.random.uniform(0.8, 2.5, n_samples)
        hours = np.random.randint(0, 24, n_samples)
        num_stops = np.random.randint(0, 10, n_samples)

        # Realistic ETA formula with some noise
        base_speed = 30  # km/h average in Bangalore
        eta_minutes = (
            (distances / base_speed * 60)
            * traffic_factors
            * weather_factors
            + num_stops * 5  # 5 min per stop
            + np.random.normal(0, 3, n_samples)  # noise
        )
        eta_minutes = np.maximum(eta_minutes, 1)  # Ensure positive

        # Features: [distance, traffic, weather, hour, stops]
        X = np.column_stack([distances, traffic_factors, weather_factors, hours, num_stops])

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = Ridge(alpha=1.0)
        self.model.fit(X_scaled, eta_minutes)

    def predict(
        self,
        distance_km: float,
        traffic_factor: float = 1.0,
        weather_factor: float = 1.0,
        hour: int = 12,
        num_stops: int = 0,
    ) -> Dict:
        """
        Predict ETA for a route.

        Returns:
            Dict with predicted_eta_min, confidence, and breakdown
        """
        features = np.array([[distance_km, traffic_factor, weather_factor, hour, num_stops]])

        if self.model is not None and self.scaler is not None:
            features_scaled = self.scaler.transform(features)
            predicted_eta = float(self.model.predict(features_scaled)[0])
        else:
            # Fallback formula
            predicted_eta = self._formula_eta(
                distance_km, traffic_factor, weather_factor, num_stops
            )

        # Confidence based on factor extremity
        confidence = max(0.3, 1.0 - abs(traffic_factor - 1.0) * 0.2 - abs(weather_factor - 1.0) * 0.15)

        # Breakdown
        base_eta = distance_km / 30 * 60  # Base at 30 km/h
        traffic_delay = base_eta * (traffic_factor - 1.0)
        weather_delay = base_eta * (weather_factor - 1.0) * 0.5
        stop_delay = num_stops * 5

        return {
            "predicted_eta_min": round(max(1, predicted_eta), 1),
            "confidence": round(confidence, 2),
            "breakdown": {
                "base_travel_min": round(base_eta, 1),
                "traffic_delay_min": round(max(0, traffic_delay), 1),
                "weather_delay_min": round(max(0, weather_delay), 1),
                "stop_delay_min": round(stop_delay, 1),
            },
        }

    def _formula_eta(
        self, distance: float, traffic: float, weather: float, stops: int
    ) -> float:
        """Fallback formula-based ETA calculation."""
        base = distance / 30 * 60  # 30 km/h average
        return base * traffic * weather + stops * 5

    def predict_delay(
        self,
        original_eta_min: float,
        current_distance_remaining: float,
        elapsed_min: float,
        traffic_factor: float = 1.0,
        weather_factor: float = 1.0,
    ) -> Dict:
        """Predict if a shipment will be delayed."""
        new_eta = self.predict(
            current_distance_remaining, traffic_factor, weather_factor
        )
        total_predicted = elapsed_min + new_eta["predicted_eta_min"]
        delay = total_predicted - original_eta_min

        return {
            "is_delayed": delay > 5,  # 5 min threshold
            "delay_minutes": round(max(0, delay), 1),
            "new_total_eta_min": round(total_predicted, 1),
            "severity": (
                "critical" if delay > 30
                else "high" if delay > 15
                else "medium" if delay > 5
                else "low"
            ),
        }


# Singleton
_predictor: Optional[ETAPredictor] = None


def get_predictor() -> ETAPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ETAPredictor()
    return _predictor
