#!/bin/sh
chown -R django.django /app
python /app/manage.py syncdb --noinput
python /app/manage.py migrate
python /app/manage.py collectstatic --noinput
python /app/manage.py runserver 0.0.0.0:5000
