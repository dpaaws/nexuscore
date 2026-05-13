#!/usr/bin/env bash
# Run this once to install all dependencies across services
set -e

echo "Installing Gateway dependencies..."
cd services/gateway && npm install && cd ../..

echo "Installing Loader dependencies..."
cd services/loader && go mod tidy && cd ../..

echo "Installing Webhook dependencies..."
cd services/webhook && composer install && cd ../..

echo "Done. All services ready."
