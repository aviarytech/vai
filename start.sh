 #!/bin/bash

tmux new-session -d -s verifiable-ai-mvp
tmux split-window -h
tmux select-pane -t 0
tmux send-keys "cd frontend && bun start" C-m
tmux select-pane -t 1
tmux send-keys "cd backend && bun start" C-m
tmux attach-session -t verifiable-ai-mvp