#!/bin/bash

echo -e 'Pushing shelter-api to gitlab register container...'

# scripts
docker build -t registry.gitlab.com/..
docker push registry.gitlab.com/..

echo -e '\nFinished!!!'
