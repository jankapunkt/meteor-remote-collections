#!/usr/bin/env sh

echo "*************************************************************"
echo "WAIT FOR METOR REMOTE APP STARTUP"
echo "*************************************************************"
while ! nc -z localhost 3030; do
    echo "Waiting for meteor to launch on 3030..."
    sleep 1
done
echo "Meteor finally launched"

echo "*************************************************************"
echo "INJECT INITIAL MONGO COLLECTION AND DATA"
echo "*************************************************************"
cd remote-app
mmongo run --eval 'db.createCollection("tests");db.tests.insert({name:"john doe"});exit'
cd ..
