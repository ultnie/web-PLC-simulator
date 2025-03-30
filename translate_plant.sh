#!/bin/bash
cd sessions/$1
echo $PWD
java -jar ../../poST2py.jar plant_code.post -o=plant_code.py -l &> plant_out
