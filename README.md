# Offline SIEM System for Air-Gapped Networks

## Project Overview
This project develops a portable and lightweight Security Information and Event Management (SIEM) system designed for air-gapped environments such as military command centers, nuclear facilities, and forensic laboratories.

Since these environments operate without Internet connectivity, traditional cloud-based SIEM solutions cannot be used. The system enables offline security monitoring, log analysis, and threat detection to identify malware activity and insider threats.

---

## Problem Statement
Critical infrastructure systems often operate in air-gapped networks with no Internet access.

Because of this:
- Cloud SIEM solutions cannot be used
- Traditional on-prem SIEM systems are costly and resource-intensive
- Systems remain vulnerable to malware and insider attacks through USB devices, updates, or internal misuse

---

## Proposed Solution
The project proposes a lightweight offline SIEM system capable of:

- Collecting system and security logs
- Monitoring local system activities
- Detecting malware and insider threats
- Providing real-time alerts within isolated networks

The system is designed to be portable, efficient, and suitable for critical infrastructure environments.

---

## Objectives
- Collect and analyze local security logs
- Detect suspicious system activities
- Provide real-time monitoring in offline environments
- Ensure low hardware resource usage
- Enable secure monitoring for air-gapped systems

---

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js

---

## Installation

### Clone the Repository
```bash
git clone <repository-url>

cd project-name

npm install

npm run dev
