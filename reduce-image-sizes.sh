#!/bin/bash

for file in media/*

do
		filename="${file##*/}"
		ext="${filename#*.}"
		basename=${filename%.$ext}
    convert -resize "512x512>" ${file} media/${basename}-compact.${ext}
done

