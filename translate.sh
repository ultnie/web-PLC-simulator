#!/bin/bash
cd sessions/$1
echo $PWD
java -jar ../../poST2py.jar code.post -o=poST_code.py -l &> out
