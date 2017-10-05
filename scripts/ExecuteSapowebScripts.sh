#!/bin/bash

for file in $(find ./db_mysql -name 'MD*')
 do
    if ! $(mysql sapoweb < $file -h 192.168.1.206 -p1111 -u root)
    then
      echo error in $file
      exit 1
    fi
done

for file in $(find ./db_mysql -name 'DT*')
 do
    if ! [$(mysql sapoweb < $file -h 192.168.1.206 -p1111 -u root) has errors]
    then
      echo error in $file
      exit 1
    fi
done