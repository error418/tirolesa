#!/usr/bin/env bash

#******************************************************************************
# Copyright 2018 the original author or authors.                              *
#                                                                             *
# Licensed under the Apache License, Version 2.0 (the "License");             *
# you may not use this file except in compliance with the License.            *
# You may obtain a copy of the License at                                     *
#                                                                             *
# http://www.apache.org/licenses/LICENSE-2.0                                  *
#                                                                             *
# Unless required by applicable law or agreed to in writing, software         *
# distributed under the License is distributed on an "AS IS" BASIS,           *
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.    *
# See the License for the specific language governing permissions and         *
# limitations under the License.                                              *
#******************************************************************************/

#==============================================================================
# SCRIPT:   run.sh 
# AUTOHR:   Markus Schneider
# DATE:     10/03/2018
# REV:      1.0.0
# PLATFORM: noarch
# PURPOSE:  Wrapper for running Docker containers 
#==============================================================================

##----------------------------------------
## CONFIG
##----------------------------------------
opts="visSh"
IMAGE="tirolesa"
NAME="tirolesa"
VERBOSE="n"
WAIT_TIME=5
CLIENT_ID="CHANGEME"
CLIENT_SECRET="CHANGEME"

##----------------------------------------
## FUNCTIONS
##----------------------------------------
usage() {
  cat<<EOF
  usage: ${0##*/} [-v -h -x option1 -y option2 ...]
         
         -v verbose
         -i build the image and run the container
         -s start 
         -S stop
         -h help
EOF
  exit 0;
}

build() {
   if [[ "$VERBOSE" -eq "y" ]]; then
     docker rmi -f $NAME 
   else
     docker rmi -f $NAME >/dev/null 2>&1
   fi
   docker build -t $IMAGE .
}

daemonize() {
   runable stop
   if [[ "$VERBOSE" -eq "y" ]]; then
     docker rm -f $NAME 
   else
     docker rm -f $NAME >/dev/null 2>&1
   fi
   docker run -dit -e "clientID=${CLIENT_ID}" -e "clientSecret=${CLIENT_SECRET}"  -p 3000:3000 --name $NAME $IMAGE 
   sleep $WAIT_TIME 
   if [[ "$VERBOSE" -eq "y" ]]; then
     docker ps -a
   fi
}

init() {
   build && daemonize
}

runable() {
   MODE=$1 
   shift
   if [[ "$VERBOSE" -eq "y" ]]; then
     eval docker $MODE $NAME 
     docker ps -a
   else
     docker $MODE $NAME >/dev/null 2>&1
   fi
}

procOpt() {
  while getopts $opts opt
    do
    case $opt in
      v) VERBOSE="y";;
      i) init;;
      s) runable start;;
      S) runable stop;;
      h) usage;;
      \?) echo -e "Invalid option: $opt\n" >&2; usage; exit 1;;
      :) echo -e "Missing argument for: $opt\n" >&2; usage; exit 1;;
      *) echo -e "Unimplemented option: $opt\n" >&2; usage; exit 1;;
    esac
  done
}

##----------------------------------------
## MAIN
##----------------------------------------
main() {
  if [ -z "$1" ]
  then
    usage
  else
    procOpt "$@"
  fi
}

main "$@"
