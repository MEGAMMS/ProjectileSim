# ProjectileSim

A web-based projectile motion simulator built using JavaScript, HTML, and modular ES6 architecture.

---

## Contents

- [Overview](#overview)  
- [Features](#features)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Development Tools & Configuration](#development-tools--configuration)  
- [Contributing](#contributing) 

---

## Overview

ProjectileSim is a lightweight simulator for visualizing projectile motion. It allows users to input initial velocities (or angles and speeds) and observe trajectory paths in real-time on a 2D canvas.

Built as a modular, ES6-based web app, it aims to be both an educational tool and a flexible framework for customizing physics simulations.

---

## Features

- **Interactive Inputs**: Adjust initial velocity components (or angle and speed) and immediately see updated trajectories.
- **Visual Output**: Plots trajectory paths on a 2D HTML canvas for intuitive visualization.
- **Realistic Physics**: Models gravity, optional drag/air resistance (if supported), and calculates key metrics like maximum height, range, and flight time.
- **Configurable Parameters**: Easily tweak simulation settings (gravity, resolution, time-step, etc.).
- **Lightweight & Responsive**: No heavy frameworks—runs efficiently in modern browsers.

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari).
- (Optional) Node.js and npm/yarn for local development and tooling.

### Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/MEGAMMS/ProjectileSim.git
   cd ProjectileSim
   ```
2. **Install dependencies** (if using npm)—otherwise skip this step
   ```bash
   npm install
   ```
3. **Running Locally**
   - Directly via filesystem: Open index.html in your browser.
   - Using a local server (recommended for module support):
   ```bash
   npm start
   ```
### Usage

1. Launch the application (index.html or via local server).

2. Enter initial conditions:

    - Velocity X (vx): Numeric value (m/s).
    - Velocity Y (vy): Numeric value (m/s).
    - (Optional) Angle and Speed, if supported.

3. Click “Simulate” (or similar controls).

4. View the projectile's trajectory on the canvas with metrics:

    - Time of Flight
    - Maximum Height
    - Horizontal Range

5. Modify parameters and run new simulations as desired.
