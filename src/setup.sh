#!/bin/bash

echo "Hey ${USERNAME}!"
echo  "npm installing..."
npm install

echo "Now running the project..."
gulp --color
