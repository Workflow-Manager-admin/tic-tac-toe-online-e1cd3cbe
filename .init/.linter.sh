#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-online-e1cd3cbe/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

