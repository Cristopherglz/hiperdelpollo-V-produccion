#!/bin/bash
# Install dependencies and build
npm install --legacy-peer-deps 2>&1
npm run build 2>&1
