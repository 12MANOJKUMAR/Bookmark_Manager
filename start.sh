#!/bin/bash

# Start Backend
echo "Starting Backend Server on port 5000..."
cd server
npm start &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend Client on port 5173..."
cd ../client
npm run dev &
FRONTEND_PID=$!


trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
