#!/bin/bash

# Make sure a BOXID is passed in to the script
if [[ -z $BOXID ]]
then
  echo "Usage: $0 [jsonboxio_boxid]"
  exit;
fi

# Loop through each import enrty
ENTRIES=`cat import.csv`
for ENTRY in $ENTRIES; do

  # Split entry in to array (DATA[0] = code, DATA[1] = destination)
  IFS=','; DATA=($ENTRY); unset IFS;

  # Call curl command with all the info to create a new redirect
  curl https://jsonbox.io/${BOXID}/${DATA[0]} -H 'content-type: application/json' --data-binary '{"dest": "'${DATA[1]}'"}'
  
done
