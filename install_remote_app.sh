#!/usr/bin/env sh
set -e
echo "*************************************************************"
echo "DOWNLOAD METEOR DISTRIBUTION"
echo "*************************************************************"

#configuring the system
wget https://raw.github.com/arunoda/travis-ci-meteor-packages/master/Makefile
wget https://raw.github.com/arunoda/travis-ci-meteor-packages/master/start_test.js
wget https://raw.github.com/arunoda/travis-ci-meteor-packages/master/phantom_runner.js

#install meteor
curl https://install.meteor.com | /bin/sh

#installing meteorite
npm install -g meteorite

echo "*************************************************************"
echo "INSTALL GLOBAL NPM PACKAGES"
echo "*************************************************************"

npm install -g mmongo
npm install -g spacejam

echo "*************************************************************"
echo "CREATE REMOTE APP"
echo "*************************************************************"

meteor create remote-app
cd remote-app
meteor add jkuester:remote-collections-provider
meteor npm install

exit 0