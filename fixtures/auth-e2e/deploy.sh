#!/bin/bash
set -e

if [ -z "$METEOR" ]; then
    echo "This script is to be used in advance of running automated Auth QA on Rainforest"
    echo
    echo "Usage: METEOR=/path/to/meteor ./deploy.sh"
    exit 1
fi

cd `dirname "$0"`
TEMPLATE_DIR=`pwd`
TEMP_DIR=`mktemp -d /tmp/deploy-auth-e2e.XXXXXX`
LOG="$TEMP_DIR/auth-e2e-deploy.log"

# This is where we create a bunch of apps to deploy them. We also store
# a log file and the ~/.meteorsession file to restore here.
pushd "$TEMP_DIR" > /dev/null

# Store the original contents in ~/.meteorsession, which contain the
# credentials for the currently logged-in user.  Restore that file if
# this script exits.
METEORSESSION_RESTORE="$TEMP_DIR/.meteorsession-restore"
cp ~/.meteorsession "$METEORSESSION_RESTORE"
function cleanup {
    echo "Logs can be found at $TEMP_DIR/rainforestqa-deploy.log"
    cp "$METEORSESSION_RESTORE" ~/.meteorsession
}
trap cleanup EXIT

# Now, login as rainforestqa. This way, anyone can access apps
# deployed by this script.
echo -n "* Logging in with the test account..."
"$METEOR" help > /dev/null  # Download dev bundle
(echo rainforestqa; sleep 2s; echo rainforestqa;) | "$METEOR" login

# We are creating the app from scratch to ensure fresh installation
# and configuration of the account packages
"$METEOR" create auth-e2e >> $LOG 2>&1
pushd auth-e2e > /dev/null

# Add all the packages and copy over template app files
PACKAGES=(
  accounts-ui
  accounts-facebook
  accounts-google
  accounts-twitter
  accounts-github
  accounts-weibo
  accounts-meetup
  accounts-meteor-developer
  accounts-password
  service-configuration
)
"$METEOR" add ${PACKAGES[@]}
cp "$TEMPLATE_DIR/auth-e2e.html" ./auth-e2e.html
cp "$TEMPLATE_DIR/auth-e2e.js" ./auth-e2e.js

# The Auth QA app is deployed at auth-e2e.meteor.com
SITE=rainforest-auth-qa
echo
echo -n "* Deploying the test app to $SITE..."
# `|| true` so that the script doesn't fail if the the app doesn't exist
"$METEOR" deploy -D $SITE >> $LOG 2>&1 || true
"$METEOR" deploy $SITE >> $LOG 2>&1
echo
echo DONE
