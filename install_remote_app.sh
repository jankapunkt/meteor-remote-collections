#!/usr/bin/env sh
set -e
echo "*************************************************************"
echo "DOWNLOAD METEOR DISTRIBUTION"
echo "*************************************************************"
curl -L https://git.io/ejPSng | /bin/sh

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
meteor npm install

exit 0