#!/bin/bash
# Spawn Claude Code agent with auto-accept

PROJECT=$1
PORT=$2
TASK=$3

cd ~/Desktop/assign-x/$PROJECT

# Use script command to create a PTY, pipe in the key sequence
{
  sleep 2
  printf '\x1b[B'  # Down arrow
  sleep 0.5
  printf '\n'       # Enter
} | claude --dangerously-skip-permissions "$TASK"
