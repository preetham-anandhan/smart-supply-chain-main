"""Custom Gymnasium environment for logistics RL training."""
import gymnasium as gym
from gymnasium import spaces
import numpy as np

class LogisticsEnv(gym.Env):
    metadata = {"render_modes": ["human"]}
    def __init__(self, num_nodes=31, max_steps=20):
        super().__init__()
        self.num_nodes = num_nodes
        self.max_steps = max_steps
        self.action_space = spaces.Discrete(num_nodes)
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0.5, 0.5, 0], dtype=np.float32),
            high=np.array([num_nodes, num_nodes, max_steps, 100, 3.0, 3.0, 100], dtype=np.float32),
        )
        self.reset()
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_node = self.np_random.integers(0, self.num_nodes)
        self.destination = self.np_random.integers(0, self.num_nodes)
        while self.destination == self.current_node:
            self.destination = self.np_random.integers(0, self.num_nodes)
        self.steps, self.distance, self.fuel = 0, 0.0, 100.0
        self.visited = {self.current_node}
        return self._obs(), {}
    def step(self, action):
        self.steps += 1
        reward, terminated, truncated = 0.0, False, False
        if action == self.destination:
            reward = 100.0 - self.steps * 2 - self.distance * 0.5
            terminated = True
        elif action in self.visited:
            reward = -10.0
        else:
            d = abs(action - self.current_node) * 1.5
            self.distance += d; self.fuel -= d * 0.5
            reward = -d
            if self.fuel <= 0: reward -= 50.0; terminated = True
        self.current_node = action; self.visited.add(action)
        if self.steps >= self.max_steps: truncated = True; reward -= 20.0
        return self._obs(), reward, terminated, truncated, {}
    def _obs(self):
        return np.array([self.current_node, self.destination, self.steps, self.distance,
                         1.0, 1.0, self.fuel], dtype=np.float32)
