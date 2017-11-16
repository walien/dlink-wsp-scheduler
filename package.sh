#!/bin/bash

find . -name "*.js" -type f -not -path "./node_modules/*" | tar -cvzf app.tar.gz -T -