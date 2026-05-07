"""
Reinforcement Learning Model for Route Optimization
Uses Gymnasium environment with optional Stable Baselines3 training.
"""

import numpy as np
from typing import Dict, Optional, List
import gymnasium as gym
from gymnasium import spaces


class LogisticsRoutingEnv(gym.Env):
    """
    Custom Gymnasium environment for logistics routing.
    The agent learns to select optimal next hops in the delivery network.
    """

    metadata = {"render_modes": ["human"]}

    def __init__(self, num_nodes: int = 31, max_steps: int = 20):
        super().__init__()
        self.num_nodes = num_nodes
        self.max_steps = max_steps

        # Action: choose next node to visit (0 to num_nodes-1)
        self.action_space = spaces.Discrete(num_nodes)

        # Observation: [current_node, destination_node, steps_taken, distance_traveled,
        #               traffic_factor, weather_factor, fuel_remaining]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0.5, 0.5, 0]),
            high=np.array([num_nodes, num_nodes, max_steps, 100, 3.0, 3.0, 100]),
            dtype=np.float32,
        )

        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_node = self.np_random.integers(0, self.num_nodes)
        self.destination = self.np_random.integers(0, self.num_nodes)
        while self.destination == self.current_node:
            self.destination = self.np_random.integers(0, self.num_nodes)

        self.steps = 0
        self.distance_traveled = 0.0
        self.traffic_factor = float(self.np_random.uniform(0.7, 2.5))
        self.weather_factor = float(self.np_random.uniform(0.8, 2.0))
        self.fuel = 100.0
        self.visited = {self.current_node}

        return self._get_obs(), {}

    def step(self, action: int):
        self.steps += 1

        # Calculate reward
        reward = 0.0
        terminated = False
        truncated = False

        if action == self.destination:
            # Reached destination
            reward = 100.0 - self.steps * 2 - self.distance_traveled * 0.5
            terminated = True
        elif action in self.visited:
            # Revisiting node - penalty
            reward = -10.0
        else:
            # Moving to new node
            distance = abs(action - self.current_node) * 1.5  # Simplified
            self.distance_traveled += distance
            self.fuel -= distance * 0.5
            reward = -distance * self.traffic_factor * self.weather_factor

            if self.fuel <= 0:
                reward -= 50.0
                terminated = True

        self.current_node = action
        self.visited.add(action)

        if self.steps >= self.max_steps:
            truncated = True
            reward -= 20.0

        return self._get_obs(), reward, terminated, truncated, {}

    def _get_obs(self):
        return np.array([
            self.current_node,
            self.destination,
            self.steps,
            self.distance_traveled,
            self.traffic_factor,
            self.weather_factor,
            self.fuel,
        ], dtype=np.float32)


class RLRouteModel:
    """Wrapper for RL-based route optimization."""

    def __init__(self):
        self.model = None
        self.env = LogisticsRoutingEnv()

    def train(self, total_timesteps: int = 10000):
        """Train the RL model (optional - requires stable-baselines3)."""
        try:
            from stable_baselines3 import PPO
            self.model = PPO("MlpPolicy", self.env, verbose=0)
            self.model.learn(total_timesteps=total_timesteps)
            return {"status": "trained", "timesteps": total_timesteps}
        except ImportError:
            return {"status": "skipped", "reason": "stable-baselines3 not available"}

    def predict_action(self, observation: np.ndarray) -> int:
        """Predict next action given current state."""
        if self.model is not None:
            action, _ = self.model.predict(observation, deterministic=True)
            return int(action)
        # Fallback: greedy toward destination
        return int(observation[1])  # Move toward destination

    def get_status(self) -> Dict:
        return {
            "model_loaded": self.model is not None,
            "env_name": "LogisticsRoutingEnv",
            "algorithm": "PPO" if self.model else "greedy_fallback",
        }
