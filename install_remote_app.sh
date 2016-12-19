#!/usr/bin/env sh
curl -L https://git.io/ejPSng | /bin/sh
npm install -g mmongo
npm install -g spacejam
meteor create remote-app
cd remote-app
meteor npm install
mmongo run --eval 'db.createCollection('tests');db.tests.insert({name:'john doe'});exit'
exit 0